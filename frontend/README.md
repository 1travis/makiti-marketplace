# 🛒 Makiti Marketplace

> Plateforme de commerce électronique multi-vendeurs développée avec React et FastAPI

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.x-61DAFB.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-47A248.svg)

## 📋 Table des matières

- [Présentation](#-présentation)
- [Fonctionnalités](#-fonctionnalités)
- [Technologies utilisées](#-technologies-utilisées)
- [Architecture du projet](#-architecture-du-projet)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Utilisation](#-utilisation)
- [API Endpoints](#-api-endpoints)
- [Captures d'écran](#-captures-décran)
- [Contribution](#-contribution)

## 🎯 Présentation

**Makiti Marketplace** est une plateforme e-commerce complète permettant à des vendeurs de créer leurs boutiques et vendre leurs produits en ligne. Les clients peuvent parcourir le catalogue, ajouter des produits au panier, passer des commandes et communiquer directement avec les vendeurs.

### Rôles utilisateurs

| Rôle | Description |
|------|-------------|
| **Client** | Parcourt les produits, achète, laisse des avis |
| **Vendeur** | Gère sa boutique, ses produits et ses commandes |
| **Administrateur** | Gère les utilisateurs et approuve les vendeurs |

## ✨ Fonctionnalités

### 👤 Authentification
- Inscription avec choix du rôle (client/vendeur)
- Connexion sécurisée avec JWT
- Gestion du profil utilisateur

### 🛍️ Catalogue produits
- Liste des produits avec filtres par catégorie
- Recherche de produits
- Page détaillée de chaque produit
- Système d'avis et notes

### 🛒 Panier & Commandes
- Ajout/suppression de produits au panier
- Modification des quantités
- Choix du mode de livraison (livraison ou retrait en magasin)
- Historique des commandes

### 💬 Messagerie
- Chat en temps réel entre clients et vendeurs
- Notifications de nouveaux messages
- Historique des conversations

### 🏪 Espace Vendeur
- Demande de compte vendeur avec validation admin
- Création et gestion de boutique
- Gestion des produits (CRUD)
- Tableau de bord avec statistiques
- Gestion des commandes reçues
- Réponse aux avis clients

### 👑 Espace Administrateur
- Gestion des utilisateurs
- Approbation/refus des demandes vendeur
- Statistiques globales de la plateforme

### 🎨 Interface utilisateur
- Design moderne avec Chakra UI
- Mode clair/sombre
- Interface responsive (mobile-friendly)
- Animations fluides avec Framer Motion

## 🛠️ Technologies utilisées

### Frontend
| Technologie | Utilisation |
|-------------|-------------|
| **React 18** | Framework JavaScript |
| **Redux Toolkit** | Gestion d'état global |
| **React Router v6** | Navigation/Routage |
| **Chakra UI** | Composants UI |
| **Axios** | Requêtes HTTP |
| **Framer Motion** | Animations |
| **React Icons** | Icônes |
| **Recharts** | Graphiques |

### Backend
| Technologie | Utilisation |
|-------------|-------------|
| **FastAPI** | Framework API Python |
| **MongoDB** | Base de données NoSQL |
| **Motor** | Driver MongoDB async |
| **JWT** | Authentification |
| **Pydantic** | Validation des données |
| **Uvicorn** | Serveur ASGI |

## 📁 Architecture du projet

```
projet_de_stage/
├── frontend/                    # Application React
│   ├── public/                  # Fichiers statiques
│   ├── src/
│   │   ├── api/                 # Configuration Axios
│   │   ├── components/          # Composants réutilisables
│   │   │   ├── Navbar.jsx       # Barre de navigation
│   │   │   ├── NotificationBell.jsx
│   │   │   ├── ProductReviews.jsx
│   │   │   └── ReviewModal.jsx
│   │   ├── features/            # Fonctionnalités par domaine
│   │   │   ├── auth/            # Authentification
│   │   │   └── shops/           # Boutiques
│   │   ├── pages/               # Pages de l'application
│   │   │   ├── HomePage.jsx
│   │   │   ├── ProductsPage.jsx
│   │   │   ├── ProductDetailPage.jsx
│   │   │   ├── CartPage.jsx
│   │   │   ├── CheckoutPage.jsx
│   │   │   ├── MessagesPage.jsx
│   │   │   ├── SellerDashboard.jsx
│   │   │   ├── SellerPublicPage.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── ...
│   │   ├── store/               # Redux store
│   │   │   ├── store.js
│   │   │   └── slices/
│   │   │       ├── authSlice.js
│   │   │       ├── productSlice.js
│   │   │       └── ...
│   │   ├── App.js               # Composant principal
│   │   └── index.js             # Point d'entrée
│   └── package.json
│
├── backend/                     # API FastAPI
│   ├── app/
│   │   ├── config/              # Configuration
│   │   │   ├── database.py      # Connexion MongoDB
│   │   │   └── settings.py      # Paramètres
│   │   ├── models/              # Modèles Pydantic
│   │   │   ├── user.py
│   │   │   ├── product.py
│   │   │   └── shop.py
│   │   ├── services/            # Services métier
│   │   │   └── email_service.py
│   │   ├── utils/               # Utilitaires
│   │   │   └── security.py      # JWT, hachage
│   │   └── main.py              # Routes API
│   ├── uploads/                 # Images uploadées
│   ├── requirements.txt
│   └── .env
│
└── README.md
```

## 🚀 Installation

### Prérequis

- **Node.js** 18+ et npm
- **Python** 3.9+
- **MongoDB** 6.0+

### 1. Cloner le projet

```bash
git clone https://github.com/votre-repo/makiti-marketplace.git
cd makiti-marketplace
```

### 2. Installation du Backend

```bash
# Aller dans le dossier backend
cd backend

# Créer un environnement virtuel
python -m venv venv

# Activer l'environnement virtuel
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt
```

### 3. Installation du Frontend

```bash
# Aller dans le dossier frontend
cd frontend

# Installer les dépendances
npm install
```

## ⚙️ Configuration

### Backend (.env)

Créer un fichier `.env` dans le dossier `backend/` :

```env
# Base de données MongoDB
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=makiti_marketplace

# JWT
SECRET_KEY=votre_cle_secrete_tres_longue_et_complexe
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Email (optionnel)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre_email@gmail.com
SMTP_PASSWORD=votre_mot_de_passe_app
```

### Frontend

L'URL de l'API est configurée dans `frontend/src/api/axios.js` :

```javascript
const api = axios.create({
  baseURL: 'http://localhost:8000',
});
```

## 🎮 Utilisation

### Démarrer le Backend

```bash
cd backend
# Activer l'environnement virtuel si nécessaire
uvicorn app.main:app --reload --port 8000
```

L'API sera accessible sur : `http://localhost:8000`

Documentation Swagger : `http://localhost:8000/docs`

### Démarrer le Frontend

```bash
cd frontend
npm start
```

L'application sera accessible sur : `http://localhost:3000`

## 📡 API Endpoints

### Authentification
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/auth/register` | Inscription |
| POST | `/auth/login` | Connexion |
| GET | `/users/me` | Profil utilisateur |

### Produits
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/products` | Liste des produits |
| GET | `/products/{id}` | Détail d'un produit |
| POST | `/seller/products` | Créer un produit |
| PUT | `/seller/products/{id}` | Modifier un produit |
| DELETE | `/seller/products/{id}` | Supprimer un produit |

### Panier
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/cart` | Voir le panier |
| POST | `/cart/add` | Ajouter au panier |
| PUT | `/cart/update` | Modifier quantité |
| DELETE | `/cart/remove/{id}` | Retirer du panier |

### Commandes
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/checkout` | Passer commande |
| GET | `/orders/my-orders` | Mes commandes |
| GET | `/seller/orders` | Commandes vendeur |

### Messagerie
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/conversations` | Liste conversations |
| POST | `/conversations` | Nouvelle conversation |
| GET | `/conversations/{id}/messages` | Messages |
| POST | `/conversations/{id}/messages` | Envoyer message |

## 📸 Captures d'écran

### Page d'accueil
Page d'accueil avec les produits en vedette et les catégories.

### Catalogue produits
Liste des produits avec filtres et recherche.

### Détail produit
Page détaillée avec images, description, avis et bouton d'achat.

### Panier
Gestion du panier avec modification des quantités.

### Checkout
Choix entre livraison et retrait en magasin.

### Tableau de bord vendeur
Statistiques, gestion des produits et commandes.

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Forkez le projet
2. Créez une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Committez vos changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Pushez la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👨‍💻 Auteur

**TRAORE Abdoulaye** - Projet de stage Session 6

---

⭐ Si ce projet vous a été utile, n'hésitez pas à me donner une étoile !
