from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    sqlite_db_path: str = "data/cache.db"
    request_timeout: int = 15

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
