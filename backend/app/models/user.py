from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from enum import Enum
from bson import ObjectId

class UserRole(str, Enum):
    """Rôles disponibles pour les utilisateurs"""
    ADMIN = "admin"
    SELLER = "seller"
    CUSTOMER = "customer"

class SellerApprovalStatus(str, Enum):
    """Statut d'approbation pour les vendeurs"""
    NONE = "none"  # Pas de demande soumise
    PENDING = "pending"  # En attente d'approbation
    APPROVED = "approved"  # Approuvé
    REJECTED = "rejected"  # Refusé

class SellerRequest(BaseModel):
    """Informations de la demande vendeur"""
    business_name: str  # Nom de l'entreprise/boutique
    business_description: str  # Description de l'activité
    business_address: str  # Adresse de l'entreprise
    business_phone: str  # Téléphone professionnel
    document_url: Optional[str] = None  # URL du document d'autorisation
    document_type: Optional[str] = None  # Type de document (licence, registre commerce, etc.)
    submitted_at: Optional[datetime] = None
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[str] = None  # ID de l'admin qui a traité la demande
    rejection_reason: Optional[str] = None  # Raison du refus si applicable

class UserBase(BaseModel):
    """Modèle de base pour un utilisateur"""
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    is_active: bool = True
    role: UserRole = UserRole.CUSTOMER
    seller_approval_status: SellerApprovalStatus = SellerApprovalStatus.NONE
    seller_request: Optional[SellerRequest] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    """Modèle pour la création d'un utilisateur"""
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    password: str
    role: UserRole = UserRole.CUSTOMER
    is_active: bool = True

class UserInDB(UserBase):
    """Modèle pour un utilisateur dans la base de données"""
    id: str = Field(default_factory=lambda: str(ObjectId()))
    hashed_password: str
    
    class Config:
        json_encoders = {
            ObjectId: str
        }

class UserResponse(UserBase):
    """Modèle pour la réponse API (sans mot de passe)"""
    id: str
    
    class Config:
        json_encoders = {
            ObjectId: str
        }

class Token(BaseModel):
    """Modèle pour le token JWT"""
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    """Données stockées dans le token JWT"""
    email: Optional[str] = None
    role: Optional[str] = None