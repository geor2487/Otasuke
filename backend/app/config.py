from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/kensetsu"
    TEST_DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5433/kensetsu_test"

    JWT_SECRET_KEY: str = "your-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    AWS_ACCESS_KEY_ID: str = "test"
    AWS_SECRET_ACCESS_KEY: str = "test"
    AWS_REGION: str = "ap-northeast-1"
    S3_BUCKET_NAME: str = "kensetsu-files"
    S3_ENDPOINT_URL: str = "http://localhost:4566"

    APP_ENV: str = "development"


settings = Settings()
