from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, validator
from bson import ObjectId
from enum import Enum

class ProductCategory(str, Enum):
    """Catégories de produits disponibles"""
    ELECTRONICS = "electronics"
    FASHION = "fashion"
    HOME = "home"
    BEAUTY = "beauty"
    SPORTS = "sports"
    BOOKS = "books"
    OTHER = "other"

class ProductStatus(str, Enum):
    """Statut du produit"""
    DRAFT = "draft"
    PUBLISHED = "published"
    OUT_OF_STOCK = "out_of_stock"
    ARCHIVED = "archived"

class ProductBase(BaseModel):
    """Modèle de base partagé par les produits"""
    name: str
    description: str
    price: float = Field(..., gt=0, description="Le prix doit être supérieur à 0")
    category: ProductCategory
    stock_quantity: int = Field(..., ge=0, description="La quantité en stock ne peut pas être négative")
    shop_id: Optional[str] = None  # ID de la boutique
    seller_id: Optional[str] = None  # ID du vendeur (ajouté par le backend)
    images: List[str] = []
    status: ProductStatus = ProductStatus.DRAFT
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ProductCreate(BaseModel):
    """Modèle pour la création d'un produit (coté client)"""
    name: str
    description: str
    price: float = Field(..., gt=0)
    category: ProductCategory
    stock_quantity: int = Field(..., ge=0)
    shop_id: Optional[str] = None
    images: List[str] = []
    status: ProductStatus = ProductStatus.DRAFT

class ProductUpdate(BaseModel):
    """Modèle pour la mise à jour d'un produit"""
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    category: Optional[ProductCategory] = None
    stock_quantity: Optional[int] = Field(None, ge=0)
    status: Optional[ProductStatus] = None
    is_active: Optional[bool] = None
    images: Optional[List[str]] = None
    
    @validator('price')
    def validate_price(cls, v):
        if v is not None and v <= 0:
            raise ValueError("Le prix doit être supérieur à 0")
        return v

class ProductInDB(ProductBase):
    """Modèle pour un produit dans la base de données"""
    id: str = Field(default_factory=lambda: str(ObjectId()))
    seller_id: str
    
    class Config:
        json_encoders = {
            ObjectId: str
        }

class ProductResponse(ProductBase):
    """Modèle pour la réponse API d'un produit"""
    id: str
    seller_id: str
    
    class Config:
        json_encoders = {
            ObjectId: str
        }