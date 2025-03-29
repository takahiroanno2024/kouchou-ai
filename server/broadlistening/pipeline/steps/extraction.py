import concurrent.futures
import json
import logging
import re

import pandas as pd
from tqdm import tqdm

from services.category_classification import classify_args
from services.llm import request_to_chat_openai
from services.parse_json_list import parse_response
from utils import update_progress

COMMA_AND_SPACE_AND_RIGHT_BRACKET = re.compile(r",\s*(\])")


def _validate_property_columns(property_columns: list[str], comments: pd.DataFrame) -> None:
    if not all(property in comments.columns for property in property_columns):
        raise ValueError(f"Properties {property_columns} not found in comments. Columns are {comments.columns}")


def extraction(config):
    dataset = config["output_dir"]
    path = f"outputs/{dataset}/args.csv"
    comments = pd.read_csv(f"inputs/{config['input']}.csv")

    model = config["extraction"]["model"]
    prompt = config["extraction"]["prompt"]
    workers = config["extraction"]["workers"]
    limit = config["extraction"]["limit"]
    property_columns = config["extraction"]["properties"]
    is_pubcom = config.get("is_pubcom", False)
    _validate_property_columns(property_columns, comments)
    comment_ids = (comments["comment-id"].values)[:limit]
    comments.set_index("comment-id", inplace=True)
    results = pd.DataFrame()
    update_progress(config, total=len(comment_ids))

    existing_arguments = set()

    if is_pubcom:
        # パブコメモード: argumentごとに全てのcomment-idをリストとして保持
        argument_map = {}
        for i in tqdm(range(0, len(comment_ids), workers)):
            batch = comment_ids[i : i + workers]
            batch_inputs = [comments.loc[id]["comment-body"] for id in batch]
            batch_results = extract_batch(batch_inputs, prompt, model, workers)
            for comment_id, extracted_args in zip(batch, batch_results, strict=False):
                for arg in extracted_args:
                    if arg not in argument_map:
                        argument_map[arg] = {"comment_ids": set()}
                    argument_map[arg]["comment_ids"].add(comment_id)
            update_progress(config, incr=len(batch))

        rows = []
        for idx, (arg, data) in enumerate(argument_map.items()):
            rows.append(
                {
                    "arg-id": f"A{idx}",
                    "argument": arg,
                    "comment-id": list(data["comment_ids"]),
                }
            )

        results = pd.DataFrame(rows)

    else:
        # 通常の処理: argumentごとにcomment-idは一つのみ
        for i in tqdm(range(0, len(comment_ids), workers)):
            batch = comment_ids[i : i + workers]
            batch_inputs = [comments.loc[id]["comment-body"] for id in batch]
            batch_results = extract_batch(batch_inputs, prompt, model, workers)
            for comment_id, extracted_args in zip(batch, batch_results, strict=False):
                for j, arg in enumerate(extracted_args):
                    if arg not in existing_arguments:
                        properties = {prop: comments.loc[comment_id][prop] for prop in property_columns}
                        new_row = {
                            "arg-id": f"A{comment_id}_{j}",
                            "comment-id": comment_id,
                            "argument": arg,
                            # "source": comments.loc[comment_id]["source"],
                            **properties,
                        }
                        results = pd.concat([results, pd.DataFrame([new_row])], ignore_index=True)
                        existing_arguments.add(arg)
            update_progress(config, incr=len(batch))
    if results.shape == (0, 0):
        raise RuntimeError("result is empty, maybe bad prompt")

    classification_categories = config["extraction"]["categories"]
    if classification_categories:
        results = classify_args(results, config, workers)

    results.to_csv(path, index=False)


logging.basicConfig(level=logging.ERROR)


def extract_batch(batch, prompt, model, workers):
    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as executor:
        futures_with_index = [
            (i, executor.submit(extract_arguments, input, prompt, model)) for i, input in enumerate(batch)
        ]

        done, not_done = concurrent.futures.wait([f for _, f in futures_with_index], timeout=30)
        results = [[] for _ in range(len(batch))]

        for _, future in futures_with_index:
            if future in not_done and not future.cancelled():
                future.cancel()

        for i, future in futures_with_index:
            if future in done:
                try:
                    result = future.result()
                    results[i] = result
                except Exception as e:
                    logging.error(f"Task {future} failed with error: {e}")
                    results[i] = []
        return results


def extract_by_llm(input, prompt, model):
    messages = [
        {"role": "system", "content": prompt},
        {"role": "user", "content": input},
    ]
    response = request_to_chat_openai(messages=messages, model=model)
    return response


def extract_arguments(input, prompt, model, retries=1):
    messages = [
        {"role": "system", "content": prompt},
        {"role": "user", "content": input},
    ]
    try:
        response = request_to_chat_openai(messages=messages, model=model, is_json=False)
        items = parse_response(response)
        items = filter(None, items)  # omit empty strings
        return items
    except json.decoder.JSONDecodeError as e:
        print("JSON error:", e)
        print("Input was:", input)
        print("Response was:", response)
        print("Silently giving up on trying to generate valid list.")
        return []
