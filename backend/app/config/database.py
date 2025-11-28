from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import os
from dotenv import load_dotenv
from bson import ObjectId

# Charger les variables d'environnement
load_dotenv()

# Récupérer les variables d'environnement
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017/")
DATABASE_NAME = os.getenv("DATABASE_NAME", "makiti_db")

# Client MongoDB asynchrone (pour FastAPI)
client = None
db = None

# Client synchrone (pour les opérations qui nécessitent du code synchrone)
sync_client = None

async def get_database():
    """Obtient la connexion à la base de données MongoDB"""
    global client, db, sync_client
    
    if db is None:
        try:
            # Configuration du client asynchrone
            client = AsyncIOMotorClient(MONGODB_URL)
            db = client[DATABASE_NAME]
            
            # Configuration du client synchrone pour les opérations qui en ont besoin
            sync_client = MongoClient(MONGODB_URL)
            
            # Tester la connexion
            await client.admin.command('ping')
            print("✅ Connecté à MongoDB avec succès")
            
        except Exception as e:
            print(f"❌ Erreur de connexion à MongoDB: {e}")
            raise
    
    return db

def get_sync_database():
    """Obtient une instance synchrone de la base de données"""
    global sync_client
    if sync_client is None:
        sync_client = MongoClient(MONGODB_URL)
    return sync_client[DATABASE_NAME]

def close_mongo_connection():
    """Ferme les connexions à MongoDB"""
    global client, sync_client
    if client:
        client.close()
    if sync_client:
        sync_client.close()
    print("✅ Connexion à MongoDB fermée")

# Fonction utilitaire pour convertir les ObjectId en chaînes
def convert_objectid(data):
    """Convertit les ObjectId en chaînes dans un dictionnaire"""
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, ObjectId):
                data[key] = str(value)
            elif isinstance(value, dict):
                convert_objectid(value)
            elif isinstance(value, list):
                for item in value:
                    convert_objectid(item)
    return data