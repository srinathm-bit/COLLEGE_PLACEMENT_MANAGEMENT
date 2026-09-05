from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Central configuration, loaded from environment variables / .env file.
    Import `settings` anywhere you need config values instead of reading
    os.environ directly — keeps everything in one auditable place.
    """

    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_USER: str = "cpms_user"
    DB_PASSWORD: str = ""
    DB_NAME: str = "cpms_db"

    SECRET_KEY: str = "insecure-dev-key-change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    ENV: str = "development"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )


settings = Settings()