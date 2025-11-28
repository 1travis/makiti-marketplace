from pydantic_settings import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

class Settings(BaseSettings):
    # Configuration de l'application
    APP_NAME: str = "Makiti API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Configuration de la base de données
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017/")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "makiti_db")

    # Configuration JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "votre_clé_secrète_très_longue_et_sécurisée")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Configuration de l'admin
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "admin@makiti.com")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "admin123")

    class Config:
        env_file = ".env"
        extra = "ignore"

# Créer une instance des paramètres
settings = Settings()