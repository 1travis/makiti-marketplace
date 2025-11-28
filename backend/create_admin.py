"""
Script pour créer l'administrateur initial de la plateforme Makiti
Exécuter une seule fois : python create_admin.py
"""

import asyncio
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

# Configuration
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017/")
DATABASE_NAME = os.getenv("DATABASE_NAME", "makiti_db")

# Contexte de hachage de mot de passe
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Informations de l'administrateur
ADMIN_EMAIL = "admin@makiti.com"
ADMIN_PASSWORD = "Admin123!"  # À changer après la première connexion
ADMIN_FULL_NAME = "Administrateur Makiti"

async def create_admin():
    """Crée l'administrateur initial s'il n'existe pas"""
    
    # Connexion à MongoDB
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    
    try:
        # Vérifier si l'admin existe déjà
        existing_admin = await db.users.find_one({"email": ADMIN_EMAIL})
        
        if existing_admin:
            print(f"⚠️  L'administrateur avec l'email {ADMIN_EMAIL} existe déjà.")
            print("   Aucune action effectuée.")
            return
        
        # Créer l'administrateur
        admin_data = {
            "email": ADMIN_EMAIL,
            "full_name": ADMIN_FULL_NAME,
            "phone": None,
            "hashed_password": pwd_context.hash(ADMIN_PASSWORD),
            "role": "admin",
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        
        result = await db.users.insert_one(admin_data)
        
        print("=" * 50)
        print("✅ ADMINISTRATEUR CRÉÉ AVEC SUCCÈS")
        print("=" * 50)
        print(f"   Email: {ADMIN_EMAIL}")
        print(f"   Mot de passe: {ADMIN_PASSWORD}")
        print(f"   ID: {result.inserted_id}")
        print("=" * 50)
        print("⚠️  IMPORTANT: Changez le mot de passe après la première connexion!")
        print("=" * 50)
        
    except Exception as e:
        print(f"❌ Erreur lors de la création de l'administrateur: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(create_admin())
