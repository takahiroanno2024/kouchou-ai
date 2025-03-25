FROM python:3.13-slim

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        curl \
        build-essential \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN pip install uv

COPY pyproject.toml requirements.lock requirements-dev.lock README.md ./

RUN if [ "$ENVIRONMENT" = "development" ]; then \
        echo "Installing development dependencies from requirements-dev.lock" && \
        uv pip install --no-cache --system -r requirements-dev.lock; \
    else \
        echo "Installing production dependencies from requirements.lock" && \
        uv pip install --no-cache --system -r requirements.lock; \
    fi


COPY . .
# アプリケーションの実行
EXPOSE 8000
CMD ["python", "-m", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
