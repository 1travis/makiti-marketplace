"""
================================================================================
MAIN.PY - FICHIER PRINCIPAL DE L'API BACKEND FASTAPI
================================================================================
Ce fichier contient toutes les routes (endpoints) de l'API REST.
Il gère l'authentification, les produits, les boutiques, les commandes,
les avis, les notifications et le système de messagerie.

Technologies utilisées:
- FastAPI : Framework web Python moderne et rapide
- MongoDB : Base de données NoSQL
- JWT : Authentification par tokens
- Pydantic : Validation des données
================================================================================
"""

# ==================== IMPORTS FASTAPI ====================

# FastAPI et ses dépendances
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
# Middleware CORS pour autoriser les requêtes cross-origin (frontend)
from fastapi.middleware.cors import CORSMiddleware
# Formulaire OAuth2 pour la connexion
from fastapi.security import OAuth2PasswordRequestForm
# Pour servir les fichiers statiques (images uploadées)
from fastapi.staticfiles import StaticFiles

# ==================== IMPORTS PYTHON STANDARD ====================

from datetime import datetime, timedelta  # Gestion des dates
from bson import ObjectId                  # ID MongoDB
import uvicorn                             # Serveur ASGI
import os                                  # Opérations système
import uuid                                # Génération d'identifiants uniques
import shutil                              # Opérations sur les fichiers

# ==================== IMPORTS CONFIGURATION ====================

# Connexion à la base de données MongoDB
from app.config.database import get_database, close_mongo_connection
# Paramètres de l'application
from app.config.settings import settings

# ==================== IMPORTS MODÈLES ====================

# Modèles Pydantic pour la validation des données
from app.models.user import UserCreate, UserResponse, Token, UserRole, SellerApprovalStatus, SellerRequest
from app.models.product import ProductResponse, ProductCreate, ProductUpdate
from app.models.shop import ShopResponse, ShopCreate
from typing import Optional, List
from pydantic import BaseModel

# ==================== IMPORTS SERVICES ====================

# Service d'envoi d'emails
from app.services.email_service import (
    send_seller_approved_email,    # Email d'approbation vendeur
    send_seller_rejected_email,    # Email de refus vendeur
    send_new_order_email,          # Email nouvelle commande
    send_order_status_email,       # Email changement statut commande
    send_low_stock_alert           # Alerte stock faible
)

# ==================== CONFIGURATION UPLOADS ====================

# Dossier pour stocker les images uploadées
UPLOAD_DIR = "uploads"
# Crée le dossier s'il n'existe pas
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ==================== MODÈLES PYDANTIC ADDITIONNELS ====================

class SellerRequestCreate(BaseModel):
    """
    Modèle pour la création d'une demande de compte vendeur
    Contient les informations de l'entreprise du vendeur
    """
    business_name: str           # Nom de l'entreprise
    business_description: str    # Description de l'activité
    business_address: str        # Adresse de l'entreprise
    business_phone: str          # Téléphone professionnel
    document_url: Optional[str] = None    # URL du document justificatif
    document_type: Optional[str] = None   # Type de document (SIRET, Kbis, etc.)

class SellerApprovalAction(BaseModel):
    """
    Modèle pour l'action d'approbation/refus d'une demande vendeur
    Utilisé par les administrateurs
    """
    action: str  # "approve" pour approuver, "reject" pour refuser
    rejection_reason: Optional[str] = None  # Raison du refus (si refusé)

# ==================== IMPORTS SÉCURITÉ ====================

# Utilitaires de sécurité (hachage mot de passe, JWT, etc.)
from app.utils.security import (
    get_password_hash,           # Hache un mot de passe
    verify_password,             # Vérifie un mot de passe
    create_access_token,         # Crée un token JWT
    get_current_user,            # Récupère l'utilisateur depuis le token
    ACCESS_TOKEN_EXPIRE_MINUTES, # Durée de validité du token
)

# ==================== CRÉATION DE L'APPLICATION ====================

# Initialisation de l'application FastAPI avec métadonnées
app = FastAPI(
    title="Makiti Marketplace API",
    description="API pour la plateforme de commerce électronique Makiti",
    version="1.0.0",
    contact={
        "name": "Support Makiti",
        "email": "support@makiti.com"
    },
    license_info={
        "name": "MIT",
    },
)

# ==================== CONFIGURATION CORS ====================

# Permet au frontend (React) de communiquer avec l'API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # Autorise toutes les origines (à restreindre en production)
    allow_credentials=True,      # Autorise les cookies
    allow_methods=["*"],         # Autorise toutes les méthodes HTTP
    allow_headers=["*"],         # Autorise tous les en-têtes
)

# ==================== FICHIERS STATIQUES ====================

# Monte le dossier uploads pour servir les images via /uploads/nom_fichier
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# ==================== ÉVÉNEMENTS DE L'APPLICATION ====================

@app.on_event("startup")
async def startup_db_client():
    """
    Événement exécuté au démarrage de l'application
    Établit la connexion à MongoDB
    """
    await get_database()
    print("✅ Connecté à MongoDB")

@app.on_event("shutdown")
async def shutdown_db_client():
    """
    Événement exécuté à l'arrêt de l'application
    Ferme proprement la connexion MongoDB
    """
    close_mongo_connection()
    print("✅ Déconnecté de MongoDB")

# ==================== ROUTES D'AUTHENTIFICATION ====================

@app.post("/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate):
    """
    Enregistrement d'un nouvel utilisateur
    
    Args:
        user: Données de l'utilisateur (email, mot de passe, nom, rôle)
    
    Returns:
        UserResponse: Données de l'utilisateur créé (sans mot de passe)
    
    Raises:
        HTTPException 400: Si l'email existe déjà
    """
    # Vérifier si l'utilisateur existe déjà
    db = await get_database()
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un utilisateur avec cet email existe déjà"
        )
    
    # Créer un nouvel utilisateur
    user_dict = user.dict()
    user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))
    user_dict["created_at"] = datetime.utcnow()
    user_dict["updated_at"] = datetime.utcnow()
    
    # Insérer l'utilisateur dans la base de données
    result = await db.users.insert_one(user_dict)
    user_dict["id"] = str(result.inserted_id)
    
    return user_dict

@app.post("/auth/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """Authentification d'un utilisateur et génération d'un token JWT"""
    db = await get_database()
    print(f" Tentative de connexion: {form_data.username}")
    user = await db.users.find_one({"email": form_data.username})
    
    if not user:
        print(f" Utilisateur non trouvé: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print(f" Utilisateur trouvé: {user['email']}")
    password_valid = verify_password(form_data.password, user["hashed_password"])
    print(f" Mot de passe valide: {password_valid}")
    
    if not password_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Créer un token d'accès
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user["_id"])}, 
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

# Routes protégées
@app.get("/users/me", response_model=UserResponse)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    """Récupérer les informations de l'utilisateur connecté"""
    db = await get_database()
    user = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    user["id"] = str(user["_id"])
    return user

# Routes des produits
@app.post("/products/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(product: ProductCreate, current_user: dict = Depends(get_current_user)):
    """Créer un nouveau produit (vendeur approuvé uniquement)"""
    db = await get_database()
    
    # Vérifier si l'utilisateur est un vendeur
    user = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
    if user["role"] != UserRole.SELLER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les vendeurs peuvent créer des produits"
        )
    
    # Vérifier si le vendeur est approuvé
    if user.get("seller_approval_status") != "approved":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Votre compte vendeur doit être approuvé avant de pouvoir publier des produits"
        )
    
    # Créer le produit
    product_dict = product.dict()
    product_dict["seller_id"] = str(user["_id"])
    product_dict["created_at"] = product_dict["updated_at"] = datetime.utcnow()
    
    # Insérer le produit dans la base de données
    result = await db.products.insert_one(product_dict)
    product_dict["id"] = str(result.inserted_id)
    
    return product_dict

# ==================== ROUTES D'ADMINISTRATION ====================

@app.get("/admin/users")
async def get_all_users(current_user: dict = Depends(get_current_user)):
    """Récupérer tous les utilisateurs (admin uniquement)"""
    db = await get_database()
    
    # Vérifier si l'utilisateur est un admin
    user = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
    if user["role"] != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux administrateurs"
        )
    
    # Récupérer tous les utilisateurs
    users = []
    cursor = db.users.find({})
    async for u in cursor:
        u["id"] = str(u["_id"])
        del u["_id"]  # Supprimer l'ObjectId non sérialisable
        del u["hashed_password"]  # Ne pas exposer le mot de passe
        users.append(u)
    
    return users

@app.put("/admin/users/{user_id}/role")
async def update_user_role(
    user_id: str, 
    new_role: UserRole,
    current_user: dict = Depends(get_current_user)
):
    """Modifier le rôle d'un utilisateur (admin uniquement)"""
    db = await get_database()
    
    # Vérifier si l'utilisateur courant est un admin
    admin = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
    if admin["role"] != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux administrateurs"
        )
    
    # Vérifier que l'utilisateur cible existe
    target_user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )
    
    # Empêcher l'admin de modifier son propre rôle
    if str(target_user["_id"]) == str(admin["_id"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vous ne pouvez pas modifier votre propre rôle"
        )
    
    # Mettre à jour le rôle
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"role": new_role, "updated_at": datetime.utcnow()}}
    )
    
    return {"message": f"Rôle de l'utilisateur mis à jour vers {new_role}"}

@app.delete("/admin/users/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(get_current_user)):
    """Supprimer un utilisateur (admin uniquement)"""
    db = await get_database()
    
    # Vérifier si l'utilisateur courant est un admin
    admin = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
    if admin["role"] != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux administrateurs"
        )
    
    # Vérifier que l'utilisateur cible existe
    target_user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )
    
    # Empêcher l'admin de se supprimer lui-même
    if str(target_user["_id"]) == str(admin["_id"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vous ne pouvez pas supprimer votre propre compte"
        )
    
    # Supprimer l'utilisateur
    await db.users.delete_one({"_id": ObjectId(user_id)})
    
    return {"message": "Utilisateur supprimé avec succès"}

# ==================== ROUTES DEMANDES VENDEUR ====================

@app.post("/seller/request")
async def submit_seller_request(
    business_name: str = Form(...),
    business_description: str = Form(...),
    business_address: str = Form(...),
    business_phone: str = Form(...),
    document_type: str = Form(...),
    document_file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Soumettre une demande pour devenir vendeur approuvé avec upload de document"""
    db = await get_database()
    
    # Récupérer l'utilisateur
    user = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
    
    # Vérifier que l'utilisateur est un vendeur
    if user["role"] != UserRole.SELLER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez être inscrit en tant que vendeur"
        )
    
    # Vérifier qu'il n'a pas déjà une demande en attente ou approuvée
    current_status = user.get("seller_approval_status", "none")
    if current_status == "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vous avez déjà une demande en attente"
        )
    if current_status == "approved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Votre compte vendeur est déjà approuvé"
        )
    
    # Vérifier le type de fichier
    allowed_types = ["application/pdf", "image/jpeg", "image/png"]
    if document_file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Type de fichier non supporté. Utilisez PDF, JPG ou PNG."
        )
    
    # Vérifier la taille du fichier (max 5MB)
    if document_file.size and document_file.size > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Fichier trop volumineux. Taille maximale: 5MB."
        )
    
    # Générer un nom de fichier unique
    file_extension = document_file.filename.split(".")[-1]
    unique_filename = f"seller_request_{current_user['user_id']}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Sauvegarder le fichier
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(document_file.file, buffer)
    
    # Créer la demande
    seller_request = {
        "business_name": business_name,
        "business_description": business_description,
        "business_address": business_address,
        "business_phone": business_phone,
        "document_url": f"http://localhost:8000/uploads/{unique_filename}",
        "document_type": document_type,
        "document_filename": unique_filename,
        "submitted_at": datetime.utcnow(),
        "reviewed_at": None,
        "reviewed_by": None,
        "rejection_reason": None
    }
    
    # Mettre à jour l'utilisateur
    await db.users.update_one(
        {"_id": ObjectId(current_user["user_id"])},
        {
            "$set": {
                "seller_approval_status": "pending",
                "seller_request": seller_request,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {"message": "Demande soumise avec succès. Elle sera examinée par un administrateur."}

@app.get("/seller/request/status")
async def get_seller_request_status(current_user: dict = Depends(get_current_user)):
    """Récupérer le statut de la demande vendeur"""
    db = await get_database()
    
    user = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
    
    return {
        "status": user.get("seller_approval_status", "none"),
        "request": user.get("seller_request", None)
    }

@app.get("/admin/seller-requests")
async def get_pending_seller_requests(current_user: dict = Depends(get_current_user)):
    """Récupérer toutes les demandes vendeur en attente (admin uniquement)"""
    db = await get_database()
    
    # Vérifier si l'utilisateur est un admin
    admin = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
    if admin["role"] != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux administrateurs"
        )
    
    # Récupérer les vendeurs avec demande en attente
    requests = []
    cursor = db.users.find({"seller_approval_status": "pending"})
    async for user in cursor:
        user["id"] = str(user["_id"])
        del user["_id"]  # Supprimer l'ObjectId non sérialisable
        if "hashed_password" in user:
            del user["hashed_password"]
        requests.append(user)
    
    return requests

@app.put("/admin/seller-requests/{user_id}")
async def process_seller_request(
    user_id: str,
    action_data: SellerApprovalAction,
    current_user: dict = Depends(get_current_user)
):
    """Approuver ou refuser une demande vendeur (admin uniquement)"""
    db = await get_database()
    
    # Vérifier si l'utilisateur courant est un admin
    admin = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
    if admin["role"] != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux administrateurs"
        )
    
    # Vérifier que le vendeur existe
    seller = await db.users.find_one({"_id": ObjectId(user_id)})
    if not seller:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )
    
    # Vérifier que le vendeur a une demande en attente
    if seller.get("seller_approval_status") != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cet utilisateur n'a pas de demande en attente"
        )
    
    # Traiter la demande
    if action_data.action == "approve":
        new_status = "approved"
        rejection_reason = None
    elif action_data.action == "reject":
        new_status = "rejected"
        rejection_reason = action_data.rejection_reason
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Action invalide. Utilisez 'approve' ou 'reject'"
        )
    
    # Mettre à jour le vendeur
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                "seller_approval_status": new_status,
                "seller_request.reviewed_at": datetime.utcnow(),
                "seller_request.reviewed_by": str(admin["_id"]),
                "seller_request.rejection_reason": rejection_reason,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    # Envoyer l'email de notification au vendeur
    if action_data.action == "approve":
        send_seller_approved_email(
            to_email=seller["email"],
            seller_name=seller.get("full_name", "Vendeur"),
            business_name=seller.get("seller_request", {}).get("business_name", "Votre boutique")
        )
        # Créer une notification in-app
        await db.notifications.insert_one({
            "user_id": user_id,
            "type": "seller_approved",
            "title": " Compte vendeur approuvé !",
            "message": "Félicitations ! Votre demande de compte vendeur a été approuvée. Vous pouvez maintenant créer et vendre vos produits.",
            "read": False,
            "created_at": datetime.utcnow()
        })
    else:
        send_seller_rejected_email(
            to_email=seller["email"],
            seller_name=seller.get("full_name", "Vendeur"),
            reason=rejection_reason
        )
        await db.notifications.insert_one({
            "user_id": user_id,
            "type": "seller_rejected",
            "title": "Demande vendeur refusée",
            "message": f"Votre demande a été refusée. Raison: {rejection_reason or 'Non spécifiée'}",
            "read": False,
            "created_at": datetime.utcnow()
        })
    
    action_text = "approuvée" if action_data.action == "approve" else "refusée"
    return {"message": f"Demande {action_text} avec succès"}

# ==================== ROUTES DES BOUTIQUES ====================

@app.post("/shops", response_model=ShopResponse, status_code=status.HTTP_201_CREATED)
@app.post("/shops/", response_model=ShopResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
async def create_shop(shop: ShopCreate, current_user: dict = Depends(get_current_user)):
    """Créer une nouvelle boutique (vendeur uniquement)"""
    db = await get_database()
    
    # Vérifier si l'utilisateur est un vendeur
    user = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
    if user["role"] != UserRole.SELLER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les vendeurs peuvent créer des boutiques"
        )
    
    # Vérifier si l'utilisateur a déjà une boutique
    existing_shop = await db.shops.find_one({"owner_id": str(user["_id"])})
    if existing_shop:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vous avez déjà une boutique"
        )
    
    # Créer la boutique
    shop_dict = shop.dict()
    shop_dict["owner_id"] = str(user["_id"])
    shop_dict["created_at"] = shop_dict["updated_at"] = datetime.utcnow()
    
    # Insérer la boutique dans la base de données
    result = await db.shops.insert_one(shop_dict)
    shop_dict["id"] = str(result.inserted_id)
    
    return shop_dict

@app.get("/shops/my-shop")
@app.get("/shops/me", include_in_schema=False)
async def get_my_shop(current_user: dict = Depends(get_current_user)):
    """Récupérer la boutique du vendeur connecté"""
    db = await get_database()
    
    user = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
    if user["role"] != UserRole.SELLER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les vendeurs ont une boutique"
        )
    
    shop = await db.shops.find_one({"owner_id": str(user["_id"])})
    if not shop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vous n'avez pas encore de boutique"
        )
    
    shop["id"] = str(shop["_id"])
    del shop["_id"]
    return shop

@app.get("/shops/seller/{seller_id}")
async def get_shop_by_seller(seller_id: str):
    """Récupérer la boutique d'un vendeur par son ID (public)"""
    db = await get_database()
    
    shop = await db.shops.find_one({"owner_id": seller_id})
    if not shop:
        raise HTTPException(status_code=404, detail="Boutique non trouvée")
    
    shop["id"] = str(shop["_id"])
    del shop["_id"]
    return shop

@app.get("/sellers/{seller_id}/public")
async def get_seller_public_profile(seller_id: str):
    """Récupérer le profil public d'un vendeur"""
    db = await get_database()
    
    # Récupérer le vendeur
    seller = await db.users.find_one({"_id": ObjectId(seller_id), "role": "seller"})
    if not seller:
        raise HTTPException(status_code=404, detail="Vendeur non trouvé")
    
    # Récupérer la boutique
    shop = await db.shops.find_one({"owner_id": seller_id})
    
    # Récupérer uniquement les produits publiés du vendeur
    products = []
    cursor = db.products.find({"seller_id": seller_id, "status": "published"})
    async for product in cursor:
        product["id"] = str(product["_id"])
        del product["_id"]
        products.append(product)
    
    # Récupérer les avis
    reviews = []
    review_cursor = db.reviews.find({"seller_id": seller_id}).sort("created_at", -1).limit(10)
    async for review in review_cursor:
        review["id"] = str(review["_id"])
        del review["_id"]
        reviews.append(review)
    
    # Calculer les statistiques
    total_reviews = await db.reviews.count_documents({"seller_id": seller_id})
    avg_rating = seller.get("average_rating", 0)
    
    return {
        "seller": {
            "id": seller_id,
            "name": seller.get("full_name", "Vendeur"),
            "bio": seller.get("bio", ""),
            "avatar": seller.get("avatar"),
            "member_since": seller.get("created_at"),
            "average_rating": avg_rating,
            "total_reviews": total_reviews
        },
        "shop": {
            "id": str(shop["_id"]) if shop else None,
            "name": shop.get("name", "Boutique") if shop else "Boutique",
            "description": shop.get("description", "") if shop else "",
            "logo": shop.get("logo") if shop else None,
            "address": shop.get("address") if shop else None,
            "phone": shop.get("phone") if shop else None
        } if shop else None,
        "products": products,
        "reviews": reviews,
        "stats": {
            "total_products": len(products),
            "total_reviews": total_reviews,
            "average_rating": avg_rating
        }
    }

# ==================== ROUTES DES PRODUITS VENDEUR ====================

@app.get("/seller/products")
async def get_seller_products(current_user: dict = Depends(get_current_user)):
    """Récupérer tous les produits du vendeur connecté"""
    db = await get_database()
    
    user = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
    if user["role"] != UserRole.SELLER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux vendeurs"
        )
    
    products = []
    cursor = db.products.find({"seller_id": str(user["_id"])})
    async for product in cursor:
        product["id"] = str(product["_id"])
        del product["_id"]
        products.append(product)
    
    return products

@app.get("/seller/products/{product_id}")
async def get_seller_product(product_id: str, current_user: dict = Depends(get_current_user)):
    """Récupérer un produit spécifique du vendeur"""
    db = await get_database()
    
    user = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
    product = await db.products.find_one({"_id": ObjectId(product_id)})
    
    if not product:
        raise HTTPException(status_code=404, detail="Produit non trouvé")
    
    if product["seller_id"] != str(user["_id"]):
        raise HTTPException(status_code=403, detail="Ce produit ne vous appartient pas")
    
    product["id"] = str(product["_id"])
    del product["_id"]
    return product

@app.put("/seller/products/{product_id}")
async def update_seller_product(
    product_id: str,
    product_update: ProductUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Mettre à jour un produit du vendeur"""
    db = await get_database()
    
    user = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
    product = await db.products.find_one({"_id": ObjectId(product_id)})
    
    if not product:
        raise HTTPException(status_code=404, detail="Produit non trouvé")
    
    if product["seller_id"] != str(user["_id"]):
        raise HTTPException(status_code=403, detail="Ce produit ne vous appartient pas")
    
    # Mettre à jour uniquement les champs fournis
    update_data = {k: v for k, v in product_update.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    await db.products.update_one(
        {"_id": ObjectId(product_id)},
        {"$set": update_data}
    )
    
    updated_product = await db.products.find_one({"_id": ObjectId(product_id)})
    updated_product["id"] = str(updated_product["_id"])
    del updated_product["_id"]
    return updated_product

@app.delete("/seller/products/{product_id}")
async def delete_seller_product(product_id: str, current_user: dict = Depends(get_current_user)):
    """Supprimer un produit du vendeur"""
    db = await get_database()
    
    user = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
    product = await db.products.find_one({"_id": ObjectId(product_id)})
    
    if not product:
        raise HTTPException(status_code=404, detail="Produit non trouvé")
    
    if product["seller_id"] != str(user["_id"]):
        raise HTTPException(status_code=403, detail="Ce produit ne vous appartient pas")
    
    await db.products.delete_one({"_id": ObjectId(product_id)})
    return {"message": "Produit supprimé avec succès"}

# ==================== ROUTES PUBLIQUES PRODUITS ====================

@app.get("/products")
async def get_all_products(category: Optional[str] = None, shop_id: Optional[str] = None, search: Optional[str] = None):
    """Récupérer tous les produits publiés (public) - les brouillons ne sont pas visibles"""
    db = await get_database()
    
    # Construire la requête - afficher uniquement les produits publiés
    query = {"status": "published"}
    if category:
        query["category"] = category
    if shop_id:
        query["shop_id"] = shop_id
    if search:
        # Recherche par nom (insensible à la casse)
        query["name"] = {"$regex": search, "$options": "i"}
    
    products = []
    cursor = db.products.find(query).sort("created_at", -1)
    async for product in cursor:
        product["id"] = str(product["_id"])
        del product["_id"]
        products.append(product)
    
    return products

@app.get("/products/{product_id}")
async def get_product(product_id: str):
    """Récupérer un produit par son ID (public)"""
    db = await get_database()
    
    product = await db.products.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Produit non trouvé")
    
    product["id"] = str(product["_id"])
    del product["_id"]
    return product

# ==================== ROUTES UPLOAD D'IMAGES ====================

@app.post("/upload/image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload une image et retourne l'URL"""
    # Vérifier le type de fichier
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Type de fichier non autorisé. Utilisez JPEG, PNG, GIF ou WebP."
        )
    
    # Générer un nom de fichier unique
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Sauvegarder le fichier
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Retourner l'URL de l'image
    image_url = f"http://localhost:8000/uploads/{unique_filename}"
    return {"url": image_url, "filename": unique_filename}

@app.post("/seller/products/with-image")
async def create_product_with_image(
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    category: str = Form(...),
    stock_quantity: int = Form(...),
    product_status: str = Form("draft"),
    image: UploadFile = File(None),
    current_user: dict = Depends(get_current_user)
):
    """Créer un produit avec une image (vendeur approuvé uniquement)"""
    db = await get_database()
    
    # Vérifier si l'utilisateur est un vendeur approuvé
    user = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
    if user["role"] != UserRole.SELLER:
        raise HTTPException(
            status_code=403,
            detail="Seuls les vendeurs peuvent créer des produits"
        )
    
    if user.get("seller_approval_status") != "approved":
        raise HTTPException(
            status_code=403,
            detail="Votre compte vendeur doit être approuvé"
        )
    
    # Traiter l'image si fournie
    images = []
    if image and image.filename:
        allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
        if image.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="Type d'image non autorisé")
        
        file_extension = image.filename.split(".")[-1]
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        
        images.append(f"http://localhost:8000/uploads/{unique_filename}")
    
    # Créer le produit
    product_dict = {
        "name": name,
        "description": description,
        "price": price,
        "category": category,
        "stock_quantity": stock_quantity,
        "status": product_status,
        "images": images,
        "seller_id": str(user["_id"]),
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    
    result = await db.products.insert_one(product_dict)
    product_dict["id"] = str(result.inserted_id)
    
    # Supprimer _id ajouté par MongoDB (non sérialisable)
    if "_id" in product_dict:
        del product_dict["_id"]
    
    return product_dict

@app.put("/seller/products/{product_id}/image")
async def update_product_image(
    product_id: str,
    image: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Mettre à jour l'image d'un produit"""
    db = await get_database()
    
    user = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
    product = await db.products.find_one({"_id": ObjectId(product_id)})
    
    if not product:
        raise HTTPException(status_code=404, detail="Produit non trouvé")
    
    if product["seller_id"] != str(user["_id"]):
        raise HTTPException(status_code=403, detail="Ce produit ne vous appartient pas")
    
    # Vérifier le type de fichier
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if image.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Type d'image non autorisé")
    
    # Sauvegarder la nouvelle image
    file_extension = image.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)
    
    image_url = f"http://localhost:8000/uploads/{unique_filename}"
    
    # Mettre à jour le produit
    await db.products.update_one(
        {"_id": ObjectId(product_id)},
        {"$set": {"images": [image_url], "updated_at": datetime.utcnow()}}
    )
    
    return {"message": "Image mise à jour", "image_url": image_url}

# ==================== ROUTES PROFIL UTILISATEUR ====================

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

@app.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Récupérer le profil de l'utilisateur connecté"""
    db = await get_database()
    user = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    user["id"] = str(user["_id"])
    del user["_id"]
    del user["hashed_password"]
    # S'assurer que le rôle est une chaîne
    if hasattr(user.get("role"), "value"):
        user["role"] = user["role"].value
    return user

@app.put("/profile")
async def update_profile(
    profile_data: ProfileUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Mettre à jour le profil de l'utilisateur"""
    db = await get_database()
    
    update_data = {k: v for k, v in profile_data.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="Aucune donnée à mettre à jour")
    
    update_data["updated_at"] = datetime.utcnow()
    
    await db.users.update_one(
        {"_id": ObjectId(current_user["user_id"])},
        {"$set": update_data}
    )
    
    user = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
    user["id"] = str(user["_id"])
    del user["_id"]
    del user["hashed_password"]
    return user

@app.put("/profile/photo")
async def update_profile_photo(
    photo: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Mettre à jour la photo de profil"""
    db = await get_database()
    
    # Vérifier le type de fichier
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if photo.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Type d'image non autorisé")
    
    # Sauvegarder l'image
    file_extension = photo.filename.split(".")[-1]
    unique_filename = f"profile_{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(photo.file, buffer)
    
    photo_url = f"http://localhost:8000/uploads/{unique_filename}"
    
    await db.users.update_one(
        {"_id": ObjectId(current_user["user_id"])},
        {"$set": {"profile_photo": photo_url, "updated_at": datetime.utcnow()}}
    )
    
    return {"message": "Photo de profil mise à jour", "photo_url": photo_url}

@app.put("/profile/password")
async def change_password(
    password_data: PasswordChange,
    current_user: dict = Depends(get_current_user)
):
    """Changer le mot de passe"""
    db = await get_database()
    
    user = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
    
    # Vérifier l'ancien mot de passe
    if not verify_password(password_data.current_password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Mot de passe actuel incorrect")
    
    # Mettre à jour le mot de passe
    new_hashed_password = get_password_hash(password_data.new_password)
    await db.users.update_one(
        {"_id": ObjectId(current_user["user_id"])},
        {"$set": {"hashed_password": new_hashed_password, "updated_at": datetime.utcnow()}}
    )
    
    return {"message": "Mot de passe modifié avec succès"}

# ==================== ROUTES PANIER ====================

class CartItem(BaseModel):
    product_id: str
    quantity: int = 1

@app.get("/cart")
async def get_cart(current_user: dict = Depends(get_current_user)):
    """Récupérer le panier de l'utilisateur"""
    db = await get_database()
    
    cart = await db.carts.find_one({"user_id": current_user["user_id"]})
    if not cart:
        return {"items": [], "total": 0}
    
    # Enrichir les items avec les détails des produits
    enriched_items = []
    total = 0
    
    for item in cart.get("items", []):
        product = await db.products.find_one({"_id": ObjectId(item["product_id"])})
        if product:
            item_total = product["price"] * item["quantity"]
            enriched_items.append({
                "product_id": item["product_id"],
                "quantity": item["quantity"],
                "product": {
                    "id": str(product["_id"]),
                    "name": product["name"],
                    "price": product["price"],
                    "images": product.get("images", []),
                    "seller_id": product["seller_id"],
                    "stock_quantity": product.get("stock_quantity", 0)
                },
                "item_total": item_total
            })
            total += item_total
    
    return {"items": enriched_items, "total": total}

@app.post("/cart/add")
async def add_to_cart(
    cart_item: CartItem,
    current_user: dict = Depends(get_current_user)
):
    """Ajouter un produit au panier"""
    db = await get_database()
    
    # Vérifier que le produit existe
    product = await db.products.find_one({"_id": ObjectId(cart_item.product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Produit non trouvé")
    
    # Vérifier le stock
    if product.get("stock_quantity", 0) < cart_item.quantity:
        raise HTTPException(status_code=400, detail="Stock insuffisant")
    
    # Récupérer ou créer le panier
    cart = await db.carts.find_one({"user_id": current_user["user_id"]})
    
    if not cart:
        # Créer un nouveau panier
        await db.carts.insert_one({
            "user_id": current_user["user_id"],
            "items": [{"product_id": cart_item.product_id, "quantity": cart_item.quantity}],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })
    else:
        # Vérifier si le produit est déjà dans le panier
        existing_item = next(
            (item for item in cart.get("items", []) if item["product_id"] == cart_item.product_id),
            None
        )
        
        if existing_item:
            # Mettre à jour la quantité
            new_quantity = existing_item["quantity"] + cart_item.quantity
            if new_quantity > product.get("stock_quantity", 0):
                raise HTTPException(status_code=400, detail="Stock insuffisant")
            
            await db.carts.update_one(
                {"user_id": current_user["user_id"], "items.product_id": cart_item.product_id},
                {"$set": {"items.$.quantity": new_quantity, "updated_at": datetime.utcnow()}}
            )
        else:
            # Ajouter le nouveau produit
            await db.carts.update_one(
                {"user_id": current_user["user_id"]},
                {
                    "$push": {"items": {"product_id": cart_item.product_id, "quantity": cart_item.quantity}},
                    "$set": {"updated_at": datetime.utcnow()}
                }
            )
    
    return {"message": "Produit ajouté au panier"}

@app.put("/cart/update")
async def update_cart_item(
    cart_item: CartItem,
    current_user: dict = Depends(get_current_user)
):
    """Mettre à jour la quantité d'un produit dans le panier"""
    db = await get_database()
    
    if cart_item.quantity <= 0:
        # Supprimer l'item si quantité <= 0
        await db.carts.update_one(
            {"user_id": current_user["user_id"]},
            {"$pull": {"items": {"product_id": cart_item.product_id}}}
        )
        return {"message": "Produit retiré du panier"}
    
    # Vérifier le stock
    product = await db.products.find_one({"_id": ObjectId(cart_item.product_id)})
    if product and cart_item.quantity > product.get("stock_quantity", 0):
        raise HTTPException(status_code=400, detail="Stock insuffisant")
    
    await db.carts.update_one(
        {"user_id": current_user["user_id"], "items.product_id": cart_item.product_id},
        {"$set": {"items.$.quantity": cart_item.quantity, "updated_at": datetime.utcnow()}}
    )
    
    return {"message": "Panier mis à jour"}

@app.delete("/cart/remove/{product_id}")
async def remove_from_cart(
    product_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Retirer un produit du panier"""
    db = await get_database()
    
    await db.carts.update_one(
        {"user_id": current_user["user_id"]},
        {"$pull": {"items": {"product_id": product_id}}}
    )
    
    return {"message": "Produit retiré du panier"}

@app.delete("/cart/clear")
async def clear_cart(current_user: dict = Depends(get_current_user)):
    """Vider le panier"""
    db = await get_database()
    
    await db.carts.update_one(
        {"user_id": current_user["user_id"]},
        {"$set": {"items": [], "updated_at": datetime.utcnow()}}
    )
    
    return {"message": "Panier vidé"}

# ==================== ROUTES HISTORIQUE D'ACHATS ====================

@app.get("/orders/history")
async def get_order_history(current_user: dict = Depends(get_current_user)):
    """Récupérer l'historique des commandes de l'utilisateur"""
    db = await get_database()
    
    orders = []
    cursor = db.orders.find({"user_id": current_user["user_id"]}).sort("created_at", -1)
    
    async for order in cursor:
        order["id"] = str(order["_id"])
        del order["_id"]
        orders.append(order)
    
    return orders

@app.get("/orders/my-orders")
async def get_my_orders(current_user: dict = Depends(get_current_user)):
    """Récupérer les commandes de l'utilisateur avec détails des produits"""
    db = await get_database()
    
    orders = []
    cursor = db.orders.find({"user_id": current_user["user_id"]}).sort("created_at", -1)
    
    async for order in cursor:
        order["id"] = str(order["_id"])
        del order["_id"]
        
        # Enrichir les items avec les détails des produits
        enriched_items = []
        for item in order.get("items", []):
            product = await db.products.find_one({"_id": ObjectId(item.get("product_id", ""))}) if item.get("product_id") else None
            enriched_items.append({
                "product_id": item.get("product_id"),
                "quantity": item.get("quantity", 1),
                "price": item.get("unit_price", item.get("price", 0)),
                "product": {
                    "id": str(product["_id"]) if product else None,
                    "name": item.get("product_name", product["name"] if product else "Produit inconnu"),
                    "images": product.get("images", []) if product else [item.get("product_image")],
                } if product or item.get("product_name") else None
            })
        
        order["items"] = enriched_items
        
        # Formater l'adresse de livraison
        shipping = order.get("shipping_address", {})
        if isinstance(shipping, dict):
            order["shipping_address"] = f"{shipping.get('full_name', '')}, {shipping.get('address', '')}, {shipping.get('city', '')} {shipping.get('postal_code', '')}"
        
        orders.append(order)
    
    return orders

# ==================== ROUTES CHECKOUT & COMMANDES ====================

class ShippingAddress(BaseModel):
    full_name: str
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    phone: str

class CheckoutRequest(BaseModel):
    shipping_address: ShippingAddress
    payment_method: str = "card"
    delivery_method: str = "delivery"  # "delivery" ou "pickup"

@app.post("/checkout")
async def create_order(
    checkout_data: CheckoutRequest,
    current_user: dict = Depends(get_current_user)
):
    """Créer une commande à partir du panier"""
    db = await get_database()
    
    # Récupérer le panier
    cart = await db.carts.find_one({"user_id": current_user["user_id"]})
    if not cart or not cart.get("items") or len(cart["items"]) == 0:
        raise HTTPException(status_code=400, detail="Votre panier est vide")
    
    # Vérifier le stock et calculer le total
    order_items = []
    total = 0
    
    for item in cart["items"]:
        product = await db.products.find_one({"_id": ObjectId(item["product_id"])})
        if not product:
            raise HTTPException(status_code=400, detail=f"Produit non trouvé")
        
        if product.get("stock_quantity", 0) < item["quantity"]:
            raise HTTPException(status_code=400, detail=f"Stock insuffisant pour {product['name']}")
        
        item_total = product["price"] * item["quantity"]
        order_items.append({
            "product_id": item["product_id"],
            "product_name": product["name"],
            "product_image": product.get("images", [None])[0] if product.get("images") else None,
            "seller_id": product["seller_id"],
            "quantity": item["quantity"],
            "unit_price": product["price"],
            "total": item_total
        })
        total += item_total
    
    # Créer la commande
    order = {
        "user_id": current_user["user_id"],
        "items": order_items,
        "shipping_address": checkout_data.shipping_address.dict(),
        "payment_method": checkout_data.payment_method,
        "delivery_method": checkout_data.delivery_method,
        "subtotal": total,
        "shipping_fee": 0,
        "total": total,
        "status": "pending",
        "payment_status": "pending",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.orders.insert_one(order)
    order_id = str(result.inserted_id)
    
    # Mettre à jour le stock des produits
    for item in cart["items"]:
        await db.products.update_one(
            {"_id": ObjectId(item["product_id"])},
            {"$inc": {"stock_quantity": -item["quantity"]}}
        )
    
    # Vider le panier
    await db.carts.update_one(
        {"user_id": current_user["user_id"]},
        {"$set": {"items": [], "updated_at": datetime.utcnow()}}
    )
    
    # Notifier les vendeurs concernés
    seller_ids = list(set(item["seller_id"] for item in order_items))
    for seller_id in seller_ids:
        seller = await db.users.find_one({"_id": ObjectId(seller_id)})
        if seller:
            seller_items = [item for item in order_items if item["seller_id"] == seller_id]
            seller_total = sum(item["total"] for item in seller_items)
            
            # Email au vendeur
            send_new_order_email(
                to_email=seller["email"],
                seller_name=seller.get("full_name", "Vendeur"),
                order_id=order_id,
                items=seller_items,
                total=seller_total
            )
            
            # Notification in-app
            await db.notifications.insert_one({
                "user_id": seller_id,
                "type": "new_order",
                "title": f"🛒 Nouvelle commande #{order_id[-8:]}",
                "message": f"Vous avez reçu une nouvelle commande de {len(seller_items)} article(s) pour {seller_total:.2f} €",
                "read": False,
                "created_at": datetime.utcnow()
            })
    
    # Vérifier les stocks faibles après la commande
    for item in cart["items"]:
        product = await db.products.find_one({"_id": ObjectId(item["product_id"])})
        if product and product.get("stock_quantity", 0) <= 5:
            seller = await db.users.find_one({"_id": ObjectId(product["seller_id"])})
            if seller:
                # Alerte stock faible
                send_low_stock_alert(
                    to_email=seller["email"],
                    seller_name=seller.get("full_name", "Vendeur"),
                    product_name=product["name"],
                    current_stock=product.get("stock_quantity", 0)
                )
                await db.notifications.insert_one({
                    "user_id": product["seller_id"],
                    "type": "low_stock",
                    "title": f"⚠️ Stock faible: {product['name']}",
                    "message": f"Il ne reste que {product.get('stock_quantity', 0)} unités en stock.",
                    "read": False,
                    "created_at": datetime.utcnow()
                })
    
    return {"message": "Commande créée avec succès", "order_id": order_id, "total": total}

@app.get("/orders/{order_id}")
async def get_order(order_id: str, current_user: dict = Depends(get_current_user)):
    """Récupérer les détails d'une commande"""
    db = await get_database()
    
    order = await db.orders.find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Commande non trouvée")
    
    # Vérifier que la commande appartient à l'utilisateur ou est un vendeur/admin
    user = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
    if order["user_id"] != current_user["user_id"] and user["role"] not in ["seller", "admin"]:
        raise HTTPException(status_code=403, detail="Accès non autorisé")
    
    order["id"] = str(order["_id"])
    del order["_id"]
    return order

@app.put("/orders/{order_id}/status")
async def update_order_status(
    order_id: str,
    new_status: str,
    current_user: dict = Depends(get_current_user)
):
    """Mettre à jour le statut d'une commande (vendeur/admin)"""
    db = await get_database()
    
    user = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
    if user["role"] not in ["seller", "admin"]:
        raise HTTPException(status_code=403, detail="Accès non autorisé")
    
    valid_statuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Statut invalide")
    
    await db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"status": new_status, "updated_at": datetime.utcnow()}}
    )
    
    return {"message": f"Statut mis à jour: {new_status}"}

@app.get("/seller/orders")
async def get_seller_orders(current_user: dict = Depends(get_current_user)):
    """Récupérer les commandes contenant des produits du vendeur"""
    db = await get_database()
    
    user = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
    if user["role"] != "seller":
        raise HTTPException(status_code=403, detail="Accès réservé aux vendeurs")
    
    seller_id = str(user["_id"])
    
    orders = []
    cursor = db.orders.find({"items.seller_id": seller_id}).sort("created_at", -1)
    
    async for order in cursor:
        seller_items = [item for item in order["items"] if item["seller_id"] == seller_id]
        seller_total = sum(item["total"] for item in seller_items)
        
        order["id"] = str(order["_id"])
        del order["_id"]
        order["seller_items"] = seller_items
        order["seller_total"] = seller_total
        orders.append(order)
    
    return orders

# ==================== ROUTES NOTIFICATIONS ====================

@app.get("/notifications")
async def get_notifications(current_user: dict = Depends(get_current_user)):
    """Récupérer les notifications de l'utilisateur"""
    db = await get_database()
    
    notifications = []
    cursor = db.notifications.find({"user_id": current_user["user_id"]}).sort("created_at", -1).limit(50)
    
    async for notif in cursor:
        notif["id"] = str(notif["_id"])
        del notif["_id"]
        notifications.append(notif)
    
    return notifications

@app.get("/notifications/unread-count")
async def get_unread_count(current_user: dict = Depends(get_current_user)):
    """Récupérer le nombre de notifications non lues"""
    db = await get_database()
    
    count = await db.notifications.count_documents({
        "user_id": current_user["user_id"],
        "read": False
    })
    
    return {"count": count}

@app.put("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Marquer une notification comme lue"""
    db = await get_database()
    
    await db.notifications.update_one(
        {"_id": ObjectId(notification_id), "user_id": current_user["user_id"]},
        {"$set": {"read": True}}
    )
    
    return {"message": "Notification marquée comme lue"}

@app.put("/notifications/read-all")
async def mark_all_notifications_read(current_user: dict = Depends(get_current_user)):
    """Marquer toutes les notifications comme lues"""
    db = await get_database()
    
    await db.notifications.update_many(
        {"user_id": current_user["user_id"], "read": False},
        {"$set": {"read": True}}
    )
    
    return {"message": "Toutes les notifications marquées comme lues"}

@app.delete("/notifications/{notification_id}")
async def delete_notification(
    notification_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Supprimer une notification"""
    db = await get_database()
    
    await db.notifications.delete_one({
        "_id": ObjectId(notification_id),
        "user_id": current_user["user_id"]
    })
    
    return {"message": "Notification supprimée"}

# ==================== FONCTION HELPER NOTIFICATIONS ====================

async def create_notification(db, user_id: str, notif_type: str, title: str, message: str):
    """Créer une notification in-app"""
    await db.notifications.insert_one({
        "user_id": user_id,
        "type": notif_type,
        "title": title,
        "message": message,
        "read": False,
        "created_at": datetime.utcnow()
    })

# ==================== ROUTES AVIS / REVIEWS ====================

class ReviewCreate(BaseModel):
    order_id: str
    seller_id: str
    product_id: Optional[str] = None
    rating: int  # 1-5
    comment: Optional[str] = None

@app.post("/reviews")
async def create_review(
    review_data: ReviewCreate,
    current_user: dict = Depends(get_current_user)
):
    """Créer un avis sur un vendeur/produit après livraison"""
    db = await get_database()
    
    # Vérifier que la note est valide
    if review_data.rating < 1 or review_data.rating > 5:
        raise HTTPException(status_code=400, detail="La note doit être entre 1 et 5")
    
    # Vérifier que la commande existe et appartient à l'utilisateur
    order = await db.orders.find_one({"_id": ObjectId(review_data.order_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Commande non trouvée")
    
    if order["user_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Cette commande ne vous appartient pas")
    
    # Vérifier que la commande est livrée
    if order.get("status") != "delivered":
        raise HTTPException(status_code=400, detail="Vous ne pouvez noter qu'après la livraison")
    
    # Vérifier si un avis existe déjà pour cette commande et ce vendeur
    existing_review = await db.reviews.find_one({
        "order_id": review_data.order_id,
        "seller_id": review_data.seller_id,
        "user_id": current_user["user_id"]
    })
    
    if existing_review:
        raise HTTPException(status_code=400, detail="Vous avez déjà noté ce vendeur pour cette commande")
    
    # Créer l'avis
    review = {
        "user_id": current_user["user_id"],
        "order_id": review_data.order_id,
        "seller_id": review_data.seller_id,
        "product_id": review_data.product_id,
        "rating": review_data.rating,
        "comment": review_data.comment,
        "created_at": datetime.utcnow()
    }
    
    # Récupérer le nom de l'utilisateur
    user = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
    review["user_name"] = user.get("full_name", "Client")
    
    result = await db.reviews.insert_one(review)
    
    # Mettre à jour la note moyenne du vendeur
    await update_seller_rating(db, review_data.seller_id)
    
    # Notifier le vendeur
    await db.notifications.insert_one({
        "user_id": review_data.seller_id,
        "type": "new_review",
        "title": f"⭐ Nouvel avis ({review_data.rating}/5)",
        "message": f"Un client a laissé un avis sur votre boutique: \"{review_data.comment[:50] + '...' if review_data.comment and len(review_data.comment) > 50 else review_data.comment or 'Pas de commentaire'}\"",
        "read": False,
        "created_at": datetime.utcnow()
    })
    
    return {"message": "Avis enregistré avec succès", "review_id": str(result.inserted_id)}

async def update_seller_rating(db, seller_id: str):
    """Mettre à jour la note moyenne d'un vendeur"""
    pipeline = [
        {"$match": {"seller_id": seller_id}},
        {"$group": {
            "_id": "$seller_id",
            "average_rating": {"$avg": "$rating"},
            "total_reviews": {"$sum": 1}
        }}
    ]
    
    result = await db.reviews.aggregate(pipeline).to_list(1)
    
    if result:
        await db.users.update_one(
            {"_id": ObjectId(seller_id)},
            {"$set": {
                "average_rating": round(result[0]["average_rating"], 1),
                "total_reviews": result[0]["total_reviews"]
            }}
        )

@app.get("/reviews/seller/{seller_id}")
async def get_seller_reviews(seller_id: str):
    """Récupérer les avis d'un vendeur"""
    db = await get_database()
    
    reviews = []
    cursor = db.reviews.find({"seller_id": seller_id}).sort("created_at", -1)
    
    async for review in cursor:
        review["id"] = str(review["_id"])
        del review["_id"]
        reviews.append(review)
    
    # Calculer les statistiques
    total = len(reviews)
    average = sum(r["rating"] for r in reviews) / total if total > 0 else 0
    
    return {
        "reviews": reviews,
        "stats": {
            "total": total,
            "average": round(average, 1),
            "distribution": {
                "5": len([r for r in reviews if r["rating"] == 5]),
                "4": len([r for r in reviews if r["rating"] == 4]),
                "3": len([r for r in reviews if r["rating"] == 3]),
                "2": len([r for r in reviews if r["rating"] == 2]),
                "1": len([r for r in reviews if r["rating"] == 1]),
            }
        }
    }

@app.get("/reviews/product/{product_id}")
async def get_product_reviews(product_id: str):
    """Récupérer les avis d'un produit"""
    db = await get_database()
    
    # Récupérer le produit pour avoir le seller_id
    product = await db.products.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Produit non trouvé")
    
    seller_id = product["seller_id"]
    
    reviews = []
    cursor = db.reviews.find({"seller_id": seller_id}).sort("created_at", -1)
    
    async for review in cursor:
        review["id"] = str(review["_id"])
        del review["_id"]
        reviews.append(review)
    
    # Calculer les statistiques
    total = len(reviews)
    average = sum(r["rating"] for r in reviews) / total if total > 0 else 0
    
    # Récupérer les infos du vendeur
    seller = await db.users.find_one({"_id": ObjectId(seller_id)})
    shop = await db.shops.find_one({"owner_id": seller_id})
    
    return {
        "reviews": reviews,
        "seller": {
            "id": seller_id,
            "name": seller.get("full_name", "Vendeur") if seller else "Vendeur",
            "shop_name": shop.get("name", "Boutique") if shop else "Boutique",
            "average_rating": seller.get("average_rating", 0) if seller else 0,
            "total_reviews": seller.get("total_reviews", 0) if seller else 0
        },
        "stats": {
            "total": total,
            "average": round(average, 1),
            "distribution": {
                "5": len([r for r in reviews if r["rating"] == 5]),
                "4": len([r for r in reviews if r["rating"] == 4]),
                "3": len([r for r in reviews if r["rating"] == 3]),
                "2": len([r for r in reviews if r["rating"] == 2]),
                "1": len([r for r in reviews if r["rating"] == 1]),
            }
        }
    }

class ReviewReply(BaseModel):
    reply: str

@app.post("/reviews/{review_id}/reply")
async def reply_to_review(
    review_id: str,
    reply_data: ReviewReply,
    current_user: dict = Depends(get_current_user)
):
    """Permettre au vendeur de répondre à un avis"""
    db = await get_database()
    
    # Récupérer l'avis
    review = await db.reviews.find_one({"_id": ObjectId(review_id)})
    if not review:
        raise HTTPException(status_code=404, detail="Avis non trouvé")
    
    # Vérifier que l'utilisateur est le vendeur concerné
    if review["seller_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Vous ne pouvez répondre qu'aux avis de votre boutique")
    
    # Ajouter la réponse
    await db.reviews.update_one(
        {"_id": ObjectId(review_id)},
        {"$set": {
            "seller_reply": reply_data.reply,
            "seller_reply_at": datetime.utcnow()
        }}
    )
    
    # Notifier le client
    await db.notifications.insert_one({
        "user_id": review["user_id"],
        "type": "review_reply",
        "title": "💬 Réponse à votre avis",
        "message": f"Le vendeur a répondu à votre avis: \"{reply_data.reply[:50]}...\"" if len(reply_data.reply) > 50 else f"Le vendeur a répondu à votre avis: \"{reply_data.reply}\"",
        "read": False,
        "created_at": datetime.utcnow()
    })
    
    return {"message": "Réponse enregistrée"}

@app.get("/reviews/order/{order_id}")
async def get_order_reviews(order_id: str, current_user: dict = Depends(get_current_user)):
    """Récupérer les avis laissés pour une commande"""
    db = await get_database()
    
    reviews = []
    cursor = db.reviews.find({
        "order_id": order_id,
        "user_id": current_user["user_id"]
    })
    
    async for review in cursor:
        review["id"] = str(review["_id"])
        del review["_id"]
        reviews.append(review)
    
    return reviews

@app.get("/reviews/can-review/{order_id}")
async def can_review_order(order_id: str, current_user: dict = Depends(get_current_user)):
    """Vérifier si l'utilisateur peut laisser un avis pour une commande"""
    db = await get_database()
    
    order = await db.orders.find_one({"_id": ObjectId(order_id)})
    if not order:
        return {"can_review": False, "reason": "Commande non trouvée"}
    
    if order["user_id"] != current_user["user_id"]:
        return {"can_review": False, "reason": "Cette commande ne vous appartient pas"}
    
    if order.get("status") != "delivered":
        return {"can_review": False, "reason": "La commande n'est pas encore livrée"}
    
    # Récupérer les vendeurs de la commande
    seller_ids = list(set(item.get("seller_id") for item in order.get("items", []) if item.get("seller_id")))
    
    # Vérifier quels vendeurs n'ont pas encore été notés
    pending_reviews = []
    for seller_id in seller_ids:
        existing = await db.reviews.find_one({
            "order_id": order_id,
            "seller_id": seller_id,
            "user_id": current_user["user_id"]
        })
        if not existing:
            seller = await db.users.find_one({"_id": ObjectId(seller_id)})
            shop = await db.shops.find_one({"owner_id": seller_id})
            pending_reviews.append({
                "seller_id": seller_id,
                "seller_name": seller.get("full_name", "Vendeur") if seller else "Vendeur",
                "shop_name": shop.get("name", "Boutique") if shop else "Boutique"
            })
    
    return {
        "can_review": len(pending_reviews) > 0,
        "pending_reviews": pending_reviews
    }

# ==================== CHAT / MESSAGERIE ====================

class MessageCreate(BaseModel):
    content: str
    product_id: Optional[str] = None

@app.post("/conversations/start/{seller_id}")
async def start_conversation(
    seller_id: str,
    product_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Démarrer ou récupérer une conversation avec un vendeur"""
    db = await get_database()
    
    # Vérifier que le vendeur existe
    seller = await db.users.find_one({"_id": ObjectId(seller_id), "role": "seller"})
    if not seller:
        raise HTTPException(status_code=404, detail="Vendeur non trouvé")
    
    # Chercher une conversation existante
    conversation = await db.conversations.find_one({
        "participants": {"$all": [current_user["user_id"], seller_id]}
    })
    
    if conversation:
        return {
            "id": str(conversation["_id"]),
            "participants": conversation["participants"],
            "created_at": conversation["created_at"],
            "product_id": conversation.get("product_id")
        }
    
    # Créer une nouvelle conversation
    shop = await db.shops.find_one({"owner_id": seller_id})
    
    new_conversation = {
        "participants": [current_user["user_id"], seller_id],
        "buyer_id": current_user["user_id"],
        "seller_id": seller_id,
        "buyer_name": current_user.get("full_name", "Acheteur"),
        "seller_name": seller.get("full_name", "Vendeur"),
        "shop_name": shop.get("name", "Boutique") if shop else "Boutique",
        "product_id": product_id,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "last_message": None,
        "unread_buyer": 0,
        "unread_seller": 0
    }
    
    result = await db.conversations.insert_one(new_conversation)
    
    return {
        "id": str(result.inserted_id),
        "participants": new_conversation["participants"],
        "created_at": new_conversation["created_at"],
        "product_id": product_id
    }

@app.get("/conversations")
async def get_conversations(current_user: dict = Depends(get_current_user)):
    """Récupérer toutes les conversations de l'utilisateur"""
    db = await get_database()
    
    conversations = await db.conversations.find({
        "participants": current_user["user_id"]
    }).sort("updated_at", -1).to_list(100)
    
    result = []
    for conv in conversations:
        # Déterminer si l'utilisateur est l'acheteur ou le vendeur
        is_buyer = conv.get("buyer_id") == current_user["user_id"]
        other_id = conv.get("seller_id") if is_buyer else conv.get("buyer_id")
        other_name = conv.get("seller_name") if is_buyer else conv.get("buyer_name")
        unread = conv.get("unread_buyer", 0) if is_buyer else conv.get("unread_seller", 0)
        
        # Récupérer les infos du produit si présent
        product_info = None
        if conv.get("product_id"):
            product = await db.products.find_one({"_id": ObjectId(conv["product_id"])})
            if product:
                product_info = {
                    "id": str(product["_id"]),
                    "name": product.get("name"),
                    "image": product.get("images", [None])[0],
                    "price": product.get("price")
                }
        
        result.append({
            "id": str(conv["_id"]),
            "other_user_id": other_id,
            "other_user_name": other_name,
            "shop_name": conv.get("shop_name"),
            "is_buyer": is_buyer,
            "last_message": conv.get("last_message"),
            "updated_at": conv.get("updated_at"),
            "unread_count": unread,
            "product": product_info
        })
    
    return result

@app.get("/conversations/{conversation_id}/messages")
async def get_messages(
    conversation_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Récupérer les messages d'une conversation"""
    db = await get_database()
    
    # Vérifier que l'utilisateur fait partie de la conversation
    conversation = await db.conversations.find_one({
        "_id": ObjectId(conversation_id),
        "participants": current_user["user_id"]
    })
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation non trouvée")
    
    # Marquer les messages comme lus
    is_buyer = conversation.get("buyer_id") == current_user["user_id"]
    update_field = "unread_buyer" if is_buyer else "unread_seller"
    await db.conversations.update_one(
        {"_id": ObjectId(conversation_id)},
        {"$set": {update_field: 0}}
    )
    
    # Récupérer les messages
    messages = await db.messages.find({
        "conversation_id": conversation_id
    }).sort("created_at", 1).to_list(500)
    
    return [{
        "id": str(msg["_id"]),
        "sender_id": msg["sender_id"],
        "sender_name": msg.get("sender_name"),
        "content": msg["content"],
        "created_at": msg["created_at"],
        "is_mine": msg["sender_id"] == current_user["user_id"]
    } for msg in messages]

@app.post("/conversations/{conversation_id}/messages")
async def send_message(
    conversation_id: str,
    message: MessageCreate,
    current_user: dict = Depends(get_current_user)
):
    """Envoyer un message dans une conversation"""
    db = await get_database()
    
    # Vérifier que l'utilisateur fait partie de la conversation
    conversation = await db.conversations.find_one({
        "_id": ObjectId(conversation_id),
        "participants": current_user["user_id"]
    })
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation non trouvée")
    
    # Créer le message
    new_message = {
        "conversation_id": conversation_id,
        "sender_id": current_user["user_id"],
        "sender_name": current_user.get("full_name", "Utilisateur"),
        "content": message.content,
        "created_at": datetime.utcnow(),
        "read": False
    }
    
    result = await db.messages.insert_one(new_message)
    
    # Mettre à jour la conversation
    is_buyer = conversation.get("buyer_id") == current_user["user_id"]
    unread_field = "unread_seller" if is_buyer else "unread_buyer"
    
    await db.conversations.update_one(
        {"_id": ObjectId(conversation_id)},
        {
            "$set": {
                "last_message": {
                    "content": message.content[:50] + "..." if len(message.content) > 50 else message.content,
                    "sender_id": current_user["user_id"],
                    "created_at": datetime.utcnow()
                },
                "updated_at": datetime.utcnow()
            },
            "$inc": {unread_field: 1}
        }
    )
    
    # Créer une notification pour le destinataire
    other_id = conversation.get("seller_id") if is_buyer else conversation.get("buyer_id")
    notification = {
        "user_id": other_id,
        "type": "new_message",
        "title": "Nouveau message",
        "message": f"{current_user.get('full_name', 'Quelqu\'un')} vous a envoyé un message",
        "data": {
            "conversation_id": conversation_id,
            "sender_id": current_user["user_id"],
            "sender_name": current_user.get("full_name")
        },
        "read": False,
        "created_at": datetime.utcnow()
    }
    await db.notifications.insert_one(notification)
    
    return {
        "id": str(result.inserted_id),
        "sender_id": current_user["user_id"],
        "sender_name": current_user.get("full_name"),
        "content": message.content,
        "created_at": new_message["created_at"],
        "is_mine": True
    }

@app.get("/conversations/unread/count")
async def get_unread_count(current_user: dict = Depends(get_current_user)):
    """Récupérer le nombre total de messages non lus"""
    db = await get_database()
    
    # Récupérer toutes les conversations de l'utilisateur
    conversations = await db.conversations.find({
        "participants": current_user["user_id"]
    }).to_list(100)
    
    total_unread = 0
    for conv in conversations:
        is_buyer = conv.get("buyer_id") == current_user["user_id"]
        unread = conv.get("unread_buyer", 0) if is_buyer else conv.get("unread_seller", 0)
        total_unread += unread
    
    return {"unread_count": total_unread}

@app.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Supprimer une conversation"""
    db = await get_database()
    
    # Vérifier que l'utilisateur fait partie de la conversation
    conversation = await db.conversations.find_one({
        "_id": ObjectId(conversation_id),
        "participants": current_user["user_id"]
    })
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation non trouvée")
    
    # Supprimer les messages
    await db.messages.delete_many({"conversation_id": conversation_id})
    
    # Supprimer la conversation
    await db.conversations.delete_one({"_id": ObjectId(conversation_id)})
    
    return {"message": "Conversation supprimée"}

# Point d'entrée pour l'exécution de l'application
if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)