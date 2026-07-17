from decouple import Csv, config


class Settings:
    def __init__(self):
        self.database_url = config("DATABASE_URL", default="sqlite:///./notes.db")
        self.jwt_secret_key = config("JWT_SECRET_KEY", default="change-me-in-production")
        self.jwt_algorithm = config("JWT_ALGORITHM", default="HS256")
        self.jwt_expires_minutes = config("JWT_EXPIRES_MINUTES", default=60, cast=int)
        self.allowed_origins = config(
            "ALLOWED_ORIGINS", default="http://localhost:3000", cast=Csv()
        )
