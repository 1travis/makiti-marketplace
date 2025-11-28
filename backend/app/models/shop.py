from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, validator
from bson import ObjectId
from enum import Enum

class ShopStatus(str, Enum):
    """Statut de la boutique"""
    PENDING = "pending"  # En attente de validation
    ACTIVE = "active"    # Activée et visible
    SUSPENDED = "suspended"  # Suspendue par l'admin
    CLOSED = "closed"    # Fermée par le vendeur

class ShopBase(BaseModel):
    """Modèle de base pour une boutique"""
    name: str = Field(..., min_length=3, max_length=100)
    description: Optional[str] = None
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None
    owner_id: Optional[str] = None  # ID du propriétaire (ajouté par le backend)
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    address: Optional[dict] = None  # {street, city, postal_code, country, etc.}
    social_media: Optional[dict] = None  # {facebook, instagram, twitter, etc.}
    status: ShopStatus = ShopStatus.PENDING
    is_active: bool = True
    categories: List[str] = []  # Catégories de produits proposées
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ShopCreate(BaseModel):
    """Modèle pour la création d'une boutique"""
    name: str = Field(..., min_length=3, max_length=100)
    description: Optional[str] = None
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    address: Optional[dict] = None
    social_media: Optional[dict] = None
    categories: List[str] = []

class ShopUpdate(BaseModel):
    """Modèle pour la mise à jour d'une boutique"""
    name: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = None
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    address: Optional[dict] = None
    social_media: Optional[dict] = None
    status: Optional[ShopStatus] = None
    is_active: Optional[bool] = None
    categories: Optional[List[str]] = None

class ShopInDB(ShopBase):
    """Modèle pour une boutique dans la base de données"""
    id: str = Field(default_factory=lambda: str(ObjectId()))
    
    class Config:
        json_encoders = {
            ObjectId: str
        }

class ShopResponse(ShopBase):
    """Modèle pour la réponse API d'une boutique"""
    id: str
    
    class Config:
        json_encoders = {
            ObjectId: str
        }

class ShopStats(ShopResponse):
    """Modèle étendu avec des statistiques de la boutique"""
    total_products: int = 0
    total_sales: int = 0
    average_rating: Optional[float] = None