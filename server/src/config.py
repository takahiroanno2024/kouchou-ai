import os
from pathlib import Path
from typing import Literal

from dotenv import load_dotenv
from pydantic import Field
from pydantic_settings import BaseSettings

load_dotenv()

Environment = Literal["development", "production"]


class Settings(BaseSettings):
    ADMIN_API_KEY: str = Field(env="ADMIN_API_KEY")
    PUBLIC_API_KEY: str = Field(env="PUBLIC_API_KEY")
    OPENAI_API_KEY: str = Field(env="OPENAI_API_KEY")
    ENVIRONMENT: Environment = Field(env="ENVIRONMENT", default="production")
    BASE_DIR: Path = Path(__file__).parent.parent
    TOOL_DIR: Path = BASE_DIR / "broadlistening"
    REPORT_DIR: Path = TOOL_DIR / "pipeline" / "outputs"
    CONFIG_DIR: Path = TOOL_DIR / "pipeline" / "configs"
    INPUT_DIR: Path = TOOL_DIR / "pipeline" / "inputs"
    DATA_DIR: Path = BASE_DIR / "data"

    class Config:
        env_file = ".env"


settings = Settings()
# レポート出力ツール側でOpenAI APIを利用できるように、環境変数にセットする
os.environ["OPENAI_API_KEY"] = settings.OPENAI_API_KEY
