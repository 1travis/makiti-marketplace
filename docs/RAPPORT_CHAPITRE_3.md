# Chapitre III : Étude conceptuelle

## I. Introduction

Compte tenu de l'analyse fonctionnelle effectuée précédemment et des besoins identifiés pour **Makiti Marketplace**, il est essentiel d'établir une étude conceptuelle rigoureuse afin d'assurer la transition entre la phase de spécification et celle de la réalisation.

Dans ce chapitre, nous abordons deux aspects fondamentaux du développement du système : d'une part, nous modélisons l'architecture du système pour assurer une structuration optimale des composants et, d'autre part, nous réalisons une conception détaillée en nous appuyant sur la méthodologie UML pour illustrer les principaux diagrammes conceptuels.

De plus, nous définissons la structure de la base de données, élément central du système, afin de garantir une gestion efficace des utilisateurs, produits, commandes et communications.

## II. Architecture Générale du système

### 1. Vue d'ensemble de l'architecture

L'application **Makiti Marketplace** repose sur une architecture **client-serveur découplée** moderne et éprouvée, garantissant performance, maintenabilité et scalabilité. Les trois principales couches du système sont :

**Frontend (Interface Utilisateur)** : Développé avec React 18 et Chakra UI, assurant une interface utilisateur responsive et moderne, générée côté client pour une expérience utilisateur fluide et réactive.

**Backend (Logique Métier)** : Repose sur le framework FastAPI (Python), gérant la logique métier, l'authentification des utilisateurs via JWT, le traitement des commandes et les notifications.

**Base de données** : Stockage des informations dans MongoDB, une base de données NoSQL permettant une gestion flexible et scalable des données de la marketplace.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React 18)                              │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────────────┐ │
│  │    Pages     │  │  Components  │  │         Redux Store            │ │
│  │  (22 pages)  │  │   (Navbar,   │  │  (authSlice, productSlice,     │ │
│  │              │  │   Reviews)   │  │   sellerSlice, adminSlice)     │ │
│  └──────────────┘  └──────────────┘  └────────────────────────────────┘ │
│                              │                                           │
│                         Axios (HTTP Client)                              │
└──────────────────────────────┼───────────────────────────────────────────┘
                               │
                        API REST (JSON)
                               │
┌──────────────────────────────┼───────────────────────────────────────────┐
│                         BACKEND (FastAPI)                                │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────────────┐ │
│  │    Routes    │  │   Services   │  │          Security              │ │
│  │  (main.py)   │  │   (email)    │  │    (JWT, Bcrypt, CORS)         │ │
│  │  50+ endpoints│ │              │  │                                │ │
│  └──────────────┘  └──────────────┘  └────────────────────────────────┘ │
│                              │                                           │
│                      Motor (Async MongoDB Driver)                        │
└──────────────────────────────┼───────────────────────────────────────────┘
                               │
┌──────────────────────────────┼───────────────────────────────────────────┐
│                         DATABASE (MongoDB)                               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │  users  │ │products │ │  shops  │ │ orders  │ │  carts  │           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
│  ┌─────────┐ ┌─────────┐ ┌───────────────┐                              │
│  │ reviews │ │messages │ │ notifications │                              │
│  └─────────┘ └─────────┘ └───────────────┘                              │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2. Communication entre les composants

L'architecture découplée adoptée assure une communication fluide et standardisée entre les différentes couches.

**Le Frontend (React)** envoie des requêtes HTTP (GET, POST, PUT, DELETE) au serveur via Axios. Chaque requête inclut le token JWT dans l'en-tête Authorization pour les routes protégées.

**Le Backend (FastAPI)** traite ces requêtes via des routes définies dans main.py. Il applique les règles de gestion (validation Pydantic, vérification des permissions), gère l'authentification via les dépendances FastAPI et communique avec la base de données.

**La couche de données (Motor)** agit comme un driver asynchrone pour MongoDB. Elle traduit les opérations Python en requêtes MongoDB et retourne les résultats au Backend pour l'affichage.

### 3. Structure du Frontend

```
frontend/src/
├── api/                    # Configuration Axios et appels API
│   ├── axios.js           # Instance Axios avec intercepteurs
│   ├── auth.js            # Appels API authentification
│   ├── products.js        # Appels API produits
│   └── shops.js           # Appels API boutiques
├── components/            # Composants réutilisables
│   ├── Navbar.jsx         # Barre de navigation
│   ├── NotificationBell.jsx # Cloche de notifications
│   ├── ProductReviews.jsx # Affichage des avis
│   └── ReviewModal.jsx    # Modal pour laisser un avis
├── features/              # Fonctionnalités par domaine
│   ├── auth/              # Authentification
│   │   ├── LoginForm.jsx
│   │   └── RegisterForm.jsx
│   └── shops/             # Boutiques
│       └── CreateShopForm.jsx
├── pages/                 # Pages de l'application (22 pages)
│   ├── HomePage.jsx
│   ├── ProductsPage.jsx
│   ├── ProductDetailPage.jsx
│   ├── CartPage.jsx
│   ├── CheckoutPage.jsx
│   ├── OrderHistoryPage.jsx
│   ├── MessagesPage.jsx
│   ├── WishlistPage.jsx
│   ├── ProfilePage.jsx
│   ├── SellerHomePage.jsx
│   ├── SellerDashboard.jsx
│   ├── SellerOrdersPage.jsx
│   ├── SellerReviewsPage.jsx
│   ├── SellerAnalytics.jsx
│   ├── SellerPublicPage.jsx
│   ├── SellerRequestPage.jsx
│   ├── CreateProductPage.jsx
│   ├── EditProductPage.jsx
│   ├── CreateShopPage.jsx
│   ├── AdminDashboard.jsx
│   ├── AdminSellerRequests.jsx
│   └── AdminAnalytics.jsx
├── store/                 # Redux Store
│   ├── store.js           # Configuration du store
│   └── slices/
│       ├── authSlice.js   # État authentification
│       ├── productSlice.js # État produits
│       ├── sellerSlice.js # État vendeur
│       └── adminSlice.js  # État admin
├── App.js                 # Composant principal avec routage
└── index.js               # Point d'entrée
```

### 4. Structure du Backend

```
backend/app/
├── config/                # Configuration
│   ├── database.py       # Connexion MongoDB
│   └── settings.py       # Paramètres (env variables)
├── models/               # Modèles Pydantic
│   ├── user.py          # Modèle utilisateur
│   ├── product.py       # Modèle produit
│   └── shop.py          # Modèle boutique
├── services/            # Services métier
│   └── email_service.py # Envoi d'emails
├── utils/               # Utilitaires
│   └── security.py      # JWT, hachage, auth
├── main.py              # Routes API (50+ endpoints)
└── requirements.txt     # Dépendances Python
```

### 5. Hébergement et déploiement

Le déploiement de **Makiti Marketplace** est conçu pour être flexible, pouvant s'adapter à une infrastructure locale ou cloud :

**Développement local** :
- Frontend : `npm start` sur le port 3000
- Backend : `uvicorn app.main:app --reload` sur le port 8000
- MongoDB : Instance locale ou MongoDB Atlas

**Production** :
- Frontend : Build statique déployable sur Netlify, Vercel ou serveur web
- Backend : Déployable sur Heroku, Railway, ou serveur avec Docker
- Base de données : MongoDB Atlas pour la haute disponibilité

## III. Conception de base de données

### 1. Diagramme de la base de données

La base de données MongoDB a été conçue pour centraliser l'ensemble des opérations de la marketplace. Elle structure les relations entre les utilisateurs, les produits, les boutiques, les commandes et les communications.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        DIAGRAMME ENTITÉ-RELATION                        │
└─────────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
    │    USERS     │         │   PRODUCTS   │         │    SHOPS     │
    ├──────────────┤         ├──────────────┤         ├──────────────┤
    │ _id          │────┐    │ _id          │    ┌────│ _id          │
    │ email        │    │    │ name         │    │    │ name         │
    │ full_name    │    │    │ description  │    │    │ description  │
    │ hashed_pwd   │    │    │ price        │    │    │ address      │
    │ role         │    │    │ stock_qty    │    │    │ phone        │
    │ seller_status│    │    │ category     │    │    │ seller_id    │────┐
    │ seller_req   │    │    │ images       │    │    │ images       │    │
    │ created_at   │    └───►│ seller_id    │◄───┘    │ created_at   │    │
    └──────────────┘         │ avg_rating   │         └──────────────┘    │
           │                 │ created_at   │                              │
           │                 └──────────────┘                              │
           │                        │                                      │
           │                        │                                      │
           ▼                        ▼                                      │
    ┌──────────────┐         ┌──────────────┐                              │
    │    CARTS     │         │   REVIEWS    │                              │
    ├──────────────┤         ├──────────────┤                              │
    │ _id          │         │ _id          │                              │
    │ user_id      │◄────────│ product_id   │                              │
    │ items[]      │         │ customer_id  │◄─────────────────────────────┤
    │ total        │         │ rating       │                              │
    │ updated_at   │         │ comment      │                              │
    └──────────────┘         │ seller_reply │                              │
                             │ created_at   │                              │
                             └──────────────┘                              │
                                                                           │
    ┌──────────────┐         ┌──────────────┐         ┌──────────────┐    │
    │   ORDERS     │         │ CONVERSATIONS│         │NOTIFICATIONS │    │
    ├──────────────┤         ├──────────────┤         ├──────────────┤    │
    │ _id          │         │ _id          │         │ _id          │    │
    │ customer_id  │◄────────│ customer_id  │◄────────│ user_id      │◄───┘
    │ seller_id    │         │ seller_id    │         │ type         │
    │ items[]      │         │ product_id   │         │ title        │
    │ total        │         │ messages[]   │         │ message      │
    │ status       │         │ last_msg_at  │         │ is_read      │
    │ delivery_mth │         │ created_at   │         │ created_at   │
    │ ship_address │         └──────────────┘         └──────────────┘
    │ payment_mth  │
    │ created_at   │
    └──────────────┘
```

### 2. Description détaillée des collections

#### Collection `users`

Stocke tous les utilisateurs de la plateforme (clients, vendeurs, administrateurs).

| Champ | Type | Description | Obligatoire |
|-------|------|-------------|-------------|
| `_id` | ObjectId | Identifiant unique MongoDB | ✅ Auto |
| `email` | String | Adresse email (unique) | ✅ |
| `full_name` | String | Nom complet de l'utilisateur | ✅ |
| `phone` | String | Numéro de téléphone | ❌ |
| `hashed_password` | String | Mot de passe hashé avec Bcrypt | ✅ |
| `role` | String | Rôle : `customer`, `seller`, `admin` | ✅ |
| `is_active` | Boolean | Compte actif ou désactivé | ✅ |
| `seller_approval_status` | String | Statut : `none`, `pending`, `approved`, `rejected` | ✅ |
| `seller_request` | Object | Informations de la demande vendeur | ❌ |
| `seller_request.business_name` | String | Nom de l'entreprise | ❌ |
| `seller_request.business_description` | String | Description de l'activité | ❌ |
| `seller_request.business_address` | String | Adresse de l'entreprise | ❌ |
| `seller_request.business_phone` | String | Téléphone professionnel | ❌ |
| `seller_request.document_url` | String | URL du document justificatif | ❌ |
| `seller_request.submitted_at` | DateTime | Date de soumission | ❌ |
| `seller_request.reviewed_at` | DateTime | Date de traitement | ❌ |
| `seller_request.rejection_reason` | String | Motif de refus | ❌ |
| `created_at` | DateTime | Date de création du compte | ✅ Auto |
| `updated_at` | DateTime | Date de dernière modification | ✅ Auto |

**Exemple de document :**
```json
{
  "_id": ObjectId("6745a1b2c3d4e5f6a7b8c9d0"),
  "email": "vendeur@example.com",
  "full_name": "Jean Dupont",
  "phone": "+1234567890",
  "hashed_password": "$2b$12$...",
  "role": "seller",
  "is_active": true,
  "seller_approval_status": "approved",
  "seller_request": {
    "business_name": "Boutique Jean",
    "business_description": "Vente de vêtements africains",
    "business_address": "123 Rue du Commerce, Montréal",
    "business_phone": "+1234567890",
    "submitted_at": "2024-01-15T10:30:00Z",
    "reviewed_at": "2024-01-16T14:00:00Z"
  },
  "created_at": "2024-01-10T08:00:00Z",
  "updated_at": "2024-01-16T14:00:00Z"
}
```

#### Collection `products`

Stocke tous les produits mis en vente sur la plateforme.

| Champ | Type | Description | Obligatoire |
|-------|------|-------------|-------------|
| `_id` | ObjectId | Identifiant unique | ✅ Auto |
| `name` | String | Nom du produit | ✅ |
| `description` | String | Description détaillée | ✅ |
| `price` | Number | Prix en dollars | ✅ |
| `stock_quantity` | Integer | Quantité disponible en stock | ✅ |
| `category` | String | Catégorie du produit | ✅ |
| `images` | Array[String] | URLs des images du produit | ✅ |
| `seller_id` | String | ID du vendeur propriétaire | ✅ |
| `average_rating` | Number | Note moyenne (1-5) | ❌ |
| `review_count` | Integer | Nombre d'avis reçus | ❌ |
| `created_at` | DateTime | Date de création | ✅ Auto |
| `updated_at` | DateTime | Date de modification | ✅ Auto |

**Exemple de document :**
```json
{
  "_id": ObjectId("6745b2c3d4e5f6a7b8c9d0e1"),
  "name": "Robe Africaine Traditionnelle",
  "description": "Magnifique robe en wax authentique...",
  "price": 89.99,
  "stock_quantity": 25,
  "category": "Vêtements",
  "images": [
    "http://localhost:8000/uploads/robe1.jpg",
    "http://localhost:8000/uploads/robe2.jpg"
  ],
  "seller_id": "6745a1b2c3d4e5f6a7b8c9d0",
  "average_rating": 4.5,
  "review_count": 12,
  "created_at": "2024-02-01T09:00:00Z",
  "updated_at": "2024-02-15T11:30:00Z"
}
```

#### Collection `shops`

Stocke les boutiques créées par les vendeurs.

| Champ | Type | Description | Obligatoire |
|-------|------|-------------|-------------|
| `_id` | ObjectId | Identifiant unique | ✅ Auto |
| `name` | String | Nom de la boutique | ✅ |
| `description` | String | Description de la boutique | ✅ |
| `address` | Object | Adresse complète | ✅ |
| `address.street` | String | Rue et numéro | ✅ |
| `address.city` | String | Ville | ✅ |
| `address.postal_code` | String | Code postal | ✅ |
| `address.country` | String | Pays | ✅ |
| `phone` | String | Téléphone de la boutique | ✅ |
| `seller_id` | String | ID du vendeur propriétaire | ✅ |
| `images` | Array[String] | Photos de la boutique | ❌ |
| `created_at` | DateTime | Date de création | ✅ Auto |

#### Collection `carts`

Stocke les paniers des clients.

| Champ | Type | Description | Obligatoire |
|-------|------|-------------|-------------|
| `_id` | ObjectId | Identifiant unique | ✅ Auto |
| `user_id` | String | ID du client propriétaire | ✅ |
| `items` | Array[Object] | Articles dans le panier | ✅ |
| `items[].product_id` | String | ID du produit | ✅ |
| `items[].quantity` | Integer | Quantité | ✅ |
| `total` | Number | Total calculé | ✅ |
| `updated_at` | DateTime | Dernière modification | ✅ Auto |

#### Collection `orders`

Stocke les commandes passées par les clients.

| Champ | Type | Description | Obligatoire |
|-------|------|-------------|-------------|
| `_id` | ObjectId | Identifiant unique | ✅ Auto |
| `customer_id` | String | ID du client | ✅ |
| `seller_id` | String | ID du vendeur | ✅ |
| `items` | Array[Object] | Articles commandés | ✅ |
| `items[].product_id` | String | ID du produit | ✅ |
| `items[].product_name` | String | Nom (snapshot) | ✅ |
| `items[].price` | Number | Prix unitaire | ✅ |
| `items[].quantity` | Integer | Quantité | ✅ |
| `items[].image` | String | Image du produit | ❌ |
| `total` | Number | Montant total | ✅ |
| `status` | String | Statut de la commande | ✅ |
| `delivery_method` | String | `delivery` ou `pickup` | ✅ |
| `shipping_address` | Object | Adresse de livraison | ✅ |
| `shipping_address.full_name` | String | Nom du destinataire | ✅ |
| `shipping_address.address` | String | Adresse | ✅ |
| `shipping_address.city` | String | Ville | ✅ |
| `shipping_address.postal_code` | String | Code postal | ✅ |
| `shipping_address.phone` | String | Téléphone | ✅ |
| `payment_method` | String | Mode de paiement | ✅ |
| `created_at` | DateTime | Date de commande | ✅ Auto |

**Statuts possibles :** `pending` → `confirmed` → `shipped` → `delivered` | `cancelled`

#### Collection `reviews`

Stocke les avis laissés par les clients sur les produits.

| Champ | Type | Description | Obligatoire |
|-------|------|-------------|-------------|
| `_id` | ObjectId | Identifiant unique | ✅ Auto |
| `product_id` | String | ID du produit évalué | ✅ |
| `customer_id` | String | ID du client auteur | ✅ |
| `customer_name` | String | Nom affiché | ✅ |
| `rating` | Integer | Note de 1 à 5 | ✅ |
| `comment` | String | Commentaire textuel | ✅ |
| `seller_reply` | String | Réponse du vendeur | ❌ |
| `created_at` | DateTime | Date de l'avis | ✅ Auto |

#### Collection `conversations`

Stocke les conversations entre clients et vendeurs.

| Champ | Type | Description | Obligatoire |
|-------|------|-------------|-------------|
| `_id` | ObjectId | Identifiant unique | ✅ Auto |
| `customer_id` | String | ID du client | ✅ |
| `seller_id` | String | ID du vendeur | ✅ |
| `product_id` | String | ID du produit concerné | ❌ |
| `messages` | Array[Object] | Liste des messages | ✅ |
| `messages[].sender_id` | String | ID de l'expéditeur | ✅ |
| `messages[].content` | String | Contenu du message | ✅ |
| `messages[].is_read` | Boolean | Message lu | ✅ |
| `messages[].created_at` | DateTime | Date d'envoi | ✅ |
| `last_message_at` | DateTime | Date du dernier message | ✅ |
| `created_at` | DateTime | Date de création | ✅ Auto |

#### Collection `notifications`

Stocke les notifications envoyées aux utilisateurs.

| Champ | Type | Description | Obligatoire |
|-------|------|-------------|-------------|
| `_id` | ObjectId | Identifiant unique | ✅ Auto |
| `user_id` | String | ID du destinataire | ✅ |
| `type` | String | Type de notification | ✅ |
| `title` | String | Titre | ✅ |
| `message` | String | Contenu | ✅ |
| `data` | Object | Données additionnelles | ❌ |
| `is_read` | Boolean | Notification lue | ✅ |
| `created_at` | DateTime | Date de création | ✅ Auto |

**Types de notifications :** `new_order`, `order_status`, `new_message`, `new_review`, `seller_approved`, `seller_rejected`

### 3. Index recommandés

Pour optimiser les performances des requêtes fréquentes :

```javascript
// Collection users
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "role": 1 })
db.users.createIndex({ "seller_approval_status": 1 })

// Collection products
db.products.createIndex({ "seller_id": 1 })
db.products.createIndex({ "category": 1 })
db.products.createIndex({ "name": "text", "description": "text" })

// Collection orders
db.orders.createIndex({ "customer_id": 1 })
db.orders.createIndex({ "seller_id": 1 })
db.orders.createIndex({ "status": 1 })
db.orders.createIndex({ "created_at": -1 })

// Collection carts
db.carts.createIndex({ "user_id": 1 }, { unique: true })

// Collection reviews
db.reviews.createIndex({ "product_id": 1 })
db.reviews.createIndex({ "customer_id": 1 })

// Collection notifications
db.notifications.createIndex({ "user_id": 1, "is_read": 1 })
db.notifications.createIndex({ "created_at": -1 })

// Collection conversations
db.conversations.createIndex({ "customer_id": 1 })
db.conversations.createIndex({ "seller_id": 1 })
```

## IV. Conclusion

Ce chapitre a présenté l'architecture générale de l'application **Makiti Marketplace**, ainsi que la conception détaillée de la base de données.

L'utilisation de MongoDB couplée à la puissance de FastAPI et React permet une gestion efficace des données de la marketplace, garantissant à la fois flexibilité, rapidité d'accès et capacité d'évolution pour les besoins futurs.

L'architecture découplée (frontend/backend) assure une maintenabilité optimale et permet des évolutions indépendantes de chaque couche. La structure modulaire du code facilite l'ajout de nouvelles fonctionnalités.
