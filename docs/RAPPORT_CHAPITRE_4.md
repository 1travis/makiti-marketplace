# Chapitre IV : RÉSUMÉ ET DÉTAILS DES SPRINTS DU PROJET

## I. SPRINT 1 : Authentification, Catalogue et Structure de Base

### 1. Tableau Backlog Produit du projet

| ID | Description de l'exigence (User Story) | Priorité |
|----|----------------------------------------|----------|
| US01 | En tant qu'utilisateur, je veux m'inscrire via un formulaire sécurisé pour créer mon compte | Haute |
| US02 | En tant qu'utilisateur, je veux me connecter avec mes identifiants pour accéder au système selon mon rôle | Haute |
| US03 | En tant qu'utilisateur, je veux voir une page d'accueil adaptée à mon rôle (Client, Vendeur, Admin) | Moyenne |
| US04 | En tant qu'utilisateur, je veux pouvoir me déconnecter de manière sécurisée | Haute |
| US05 | En tant qu'utilisateur, je veux modifier mes informations personnelles depuis mon profil | Moyenne |
| US06 | En tant que visiteur, je veux parcourir le catalogue de produits sans m'inscrire | Haute |
| US07 | En tant que visiteur, je veux rechercher des produits par nom ou mot-clé | Haute |
| US08 | En tant que visiteur, je veux filtrer les produits par catégorie | Haute |
| US09 | En tant que visiteur, je veux consulter les détails complets d'un produit | Haute |
| US10 | En tant que client, je veux ajouter des produits à mon panier | Haute |
| US11 | En tant que client, je veux modifier les quantités dans mon panier | Haute |
| US12 | En tant que client, je veux supprimer des articles de mon panier | Haute |
| US13 | En tant que client, je veux passer une commande avec choix du mode de livraison | Haute |
| US14 | En tant que client, je veux choisir entre livraison à domicile et retrait en magasin | Haute |
| US15 | En tant que client, je veux consulter l'historique de mes commandes | Haute |
| US16 | En tant que client, je veux laisser un avis et une note sur un produit | Haute |
| US17 | En tant que client, je veux ajouter des produits à ma liste de souhaits | Moyenne |
| US18 | En tant que client, je veux contacter un vendeur via la messagerie | Haute |
| US19 | En tant qu'utilisateur, je veux soumettre une demande pour devenir vendeur | Haute |
| US20 | En tant que vendeur approuvé, je veux créer et configurer ma boutique | Haute |
| US21 | En tant que vendeur, je veux ajouter des produits à mon catalogue | Haute |
| US22 | En tant que vendeur, je veux modifier et supprimer mes produits | Haute |
| US23 | En tant que vendeur, je veux consulter et gérer les commandes reçues | Haute |
| US24 | En tant que vendeur, je veux mettre à jour le statut des commandes | Haute |
| US25 | En tant que vendeur, je veux répondre aux avis des clients | Moyenne |
| US26 | En tant que vendeur, je veux consulter mon tableau de bord avec statistiques | Haute |
| US27 | En tant que vendeur, je veux répondre aux messages des clients | Haute |
| US28 | En tant qu'admin, je veux consulter la liste de tous les utilisateurs | Haute |
| US29 | En tant qu'admin, je veux modifier le rôle d'un utilisateur | Haute |
| US30 | En tant qu'admin, je veux supprimer un utilisateur | Haute |
| US31 | En tant qu'admin, je veux consulter les demandes de compte vendeur en attente | Haute |
| US32 | En tant qu'admin, je veux approuver une demande de compte vendeur | Haute |
| US33 | En tant qu'admin, je veux refuser une demande avec motif | Haute |
| US34 | En tant qu'admin, je veux consulter les statistiques globales de la plateforme | Moyenne |
| US35 | En tant qu'utilisateur, je veux recevoir des notifications pour les événements importants | Haute |

### 2. Sélection du Sprint 1

Le Sprint 1 couvre les **US01 à US09**, visant à mettre en place l'architecture de base, le système d'authentification sécurisé et le catalogue de produits avec recherche et filtrage.

**Période :** 23 Septembre 2025 au 10 Octobre 2025

### 3. Diagramme de Cas d'Utilisation (Sprint 1)

```
                    ┌─────────────────────────────────────────┐
                    │     SPRINT 1 - Authentification &       │
                    │            Catalogue                     │
                    └─────────────────────────────────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        │                             │                             │
        ▼                             ▼                             ▼
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│   VISITEUR    │           │    CLIENT     │           │   SYSTÈME     │
└───────┬───────┘           └───────┬───────┘           └───────┬───────┘
        │                           │                           │
        ├──► S'inscrire             ├──► Se connecter           ├──► Valider JWT
        │                           │                           │
        ├──► Parcourir produits     ├──► Se déconnecter         ├──► Hasher mot
        │                           │                           │    de passe
        ├──► Rechercher produit     ├──► Modifier profil        │
        │                           │                           ├──► Générer token
        ├──► Filtrer par catégorie  ├──► Parcourir produits     │
        │                           │                           │
        └──► Voir détail produit    └──► Voir détail produit    │
```

### 4. Diagramme de Classes (Sprint 1)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        DIAGRAMME DE CLASSES - SPRINT 1                  │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌──────────────────────┐
│        User          │         │       Product        │
├──────────────────────┤         ├──────────────────────┤
│ - _id: ObjectId      │         │ - _id: ObjectId      │
│ - email: String      │         │ - name: String       │
│ - full_name: String  │         │ - description: String│
│ - hashed_password: S │         │ - price: Number      │
│ - role: UserRole     │         │ - stock_quantity: Int│
│ - is_active: Boolean │         │ - category: String   │
│ - created_at: Date   │         │ - images: String[]   │
│ - updated_at: Date   │    ┌───►│ - seller_id: String  │
├──────────────────────┤    │    │ - average_rating: Num│
│ + register()         │    │    │ - created_at: Date   │
│ + login()            │    │    ├──────────────────────┤
│ + logout()           │    │    │ + create()           │
│ + updateProfile()    │    │    │ + update()           │
│ + verifyPassword()   │────┘    │ + delete()           │
└──────────────────────┘         │ + search()           │
                                 │ + filterByCategory() │
┌──────────────────────┐         └──────────────────────┘
│      UserRole        │
├──────────────────────┤
│ <<enumeration>>      │
│ CUSTOMER             │
│ SELLER               │
│ ADMIN                │
└──────────────────────┘
```

### 5. Diagramme de Gantt (Sprint 1)

| Tâches | Début | Fin | Responsable | Statut |
|--------|-------|-----|-------------|--------|
| Configuration du projet React (Create React App) | 23 Sept 2025 | 24 Sept 2025 | A. Traore | Terminé |
| Configuration du projet FastAPI et structure | 24 Sept 2025 | 25 Sept 2025 | A. Traore | Terminé |
| Configuration de MongoDB et connexion Motor | 25 Sept 2025 | 26 Sept 2025 | A. Traore | Terminé |
| Implémentation du modèle User (Pydantic) | 26 Sept 2025 | 27 Sept 2025 | A. Traore | Terminé |
| Développement du service d'authentification JWT | 27 Sept 2025 | 29 Sept 2025 | A. Traore | Terminé |
| Création des routes /auth/register et /auth/login | 29 Sept 2025 | 30 Sept 2025 | A. Traore | Terminé |
| Création de LoginForm.jsx et RegisterForm.jsx | 30 Sept 2025 | 02 Oct 2025 | A. Traore | Terminé |
| Configuration Redux et authSlice.js | 02 Oct 2025 | 03 Oct 2025 | A. Traore | Terminé |
| Création de Navbar.jsx avec navigation | 03 Oct 2025 | 04 Oct 2025 | A. Traore | Terminé |
| Implémentation du modèle Product | 04 Oct 2025 | 05 Oct 2025 | A. Traore | Terminé |
| Création des routes /products (CRUD) | 05 Oct 2025 | 06 Oct 2025 | A. Traore | Terminé |
| Création de ProductsPage.jsx avec filtres | 06 Oct 2025 | 08 Oct 2025 | A. Traore | Terminé |
| Création de ProductDetailPage.jsx | 08 Oct 2025 | 09 Oct 2025 | A. Traore | Terminé |
| Tests unitaires et corrections Sprint 1 | 09 Oct 2025 | 10 Oct 2025 | A. Traore | Terminé |

### 6. Captures d'écran des pages réalisées (Sprint 1)

#### PAGE DE CONNEXION (LoginForm.jsx)

La page de connexion est le point d'entrée sécurisé de l'application. Elle permet aux utilisateurs de s'authentifier avec leur email et mot de passe.

**Fonctionnalités :**
- Formulaire avec validation des champs
- Affichage des erreurs de connexion
- Lien vers la page d'inscription
- Redirection automatique selon le rôle après connexion

#### PAGE D'INSCRIPTION (RegisterForm.jsx)

Le formulaire d'inscription permet de créer un nouveau compte utilisateur.

**Fonctionnalités :**
- Saisie de l'email, nom complet et mot de passe
- Choix du rôle (Client ou Vendeur)
- Validation en temps réel des champs
- Vérification de la force du mot de passe

#### CATALOGUE DE PRODUITS (ProductsPage.jsx)

La page catalogue affiche tous les produits disponibles sur la plateforme.

**Fonctionnalités :**
- Affichage en grille responsive
- Barre de recherche par mot-clé
- Filtrage par catégorie
- Affichage du prix, note moyenne et stock
- Bouton d'ajout au panier (si connecté)

#### DÉTAIL PRODUIT (ProductDetailPage.jsx)

La page de détail affiche toutes les informations d'un produit spécifique.

**Fonctionnalités :**
- Galerie d'images du produit
- Nom, description détaillée, prix
- Quantité en stock disponible
- Note moyenne et nombre d'avis
- Bouton "Ajouter au panier"
- Bouton "Contacter le vendeur"
- Lien vers le profil du vendeur

---

## II. SPRINT 2 : Panier, Commandes et Espace Vendeur

### 1. Sélection du Sprint 2

Le Sprint 2 couvre les **US10 à US27**, visant à implémenter le système complet de panier et commandes, ainsi que l'espace vendeur avec gestion des produits et commandes.

**Période :** 11 Octobre 2025 au 05 Novembre 2025

### 2. Diagramme de Cas d'Utilisation (Sprint 2)

```
                    ┌─────────────────────────────────────────┐
                    │   SPRINT 2 - Panier, Commandes &        │
                    │          Espace Vendeur                  │
                    └─────────────────────────────────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        │                             │                             │
        ▼                             ▼                             ▼
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│    CLIENT     │           │    VENDEUR    │           │   SYSTÈME     │
└───────┬───────┘           └───────┬───────┘           └───────┬───────┘
        │                           │                           │
        ├──► Ajouter au panier      ├──► Créer boutique         ├──► Calculer total
        │                           │                           │
        ├──► Modifier panier        ├──► Ajouter produit        ├──► Vérifier stock
        │                           │                           │
        ├──► Passer commande        ├──► Modifier produit       ├──► Créer commande
        │                           │                           │
        ├──► Choisir livraison      ├──► Supprimer produit      ├──► Notifier vendeur
        │    ou pickup              │                           │
        │                           ├──► Gérer commandes        ├──► Mettre à jour
        ├──► Voir historique        │                           │    statut
        │                           ├──► Mettre à jour statut   │
        ├──► Laisser avis           │                           │
        │                           ├──► Répondre aux avis      │
        ├──► Gérer favoris          │                           │
        │                           ├──► Voir tableau de bord   │
        └──► Contacter vendeur      │                           │
                                    └──► Répondre messages      │
```

### 3. Diagramme de Classes (Sprint 2)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        DIAGRAMME DE CLASSES - SPRINT 2                  │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌──────────────────────┐
│        Cart          │         │        Order         │
├──────────────────────┤         ├──────────────────────┤
│ - _id: ObjectId      │         │ - _id: ObjectId      │
│ - user_id: String    │         │ - customer_id: String│
│ - items: CartItem[]  │         │ - seller_id: String  │
│ - total: Number      │         │ - items: OrderItem[] │
│ - updated_at: Date   │         │ - total: Number      │
├──────────────────────┤         │ - status: OrderStatus│
│ + addItem()          │         │ - delivery_method: S │
│ + removeItem()       │         │ - shipping_address: O│
│ + updateQuantity()   │         │ - payment_method: S  │
│ + calculateTotal()   │         │ - created_at: Date   │
│ + clear()            │         ├──────────────────────┤
└──────────────────────┘         │ + create()           │
                                 │ + updateStatus()     │
┌──────────────────────┐         │ + cancel()           │
│      CartItem        │         └──────────────────────┘
├──────────────────────┤
│ - product_id: String │         ┌──────────────────────┐
│ - quantity: Integer  │         │     OrderStatus      │
└──────────────────────┘         ├──────────────────────┤
                                 │ <<enumeration>>      │
┌──────────────────────┐         │ PENDING              │
│        Shop          │         │ CONFIRMED            │
├──────────────────────┤         │ SHIPPED              │
│ - _id: ObjectId      │         │ DELIVERED            │
│ - name: String       │         │ CANCELLED            │
│ - description: String│         └──────────────────────┘
│ - address: Address   │
│ - phone: String      │         ┌──────────────────────┐
│ - seller_id: String  │         │       Review         │
│ - images: String[]   │         ├──────────────────────┤
│ - created_at: Date   │         │ - _id: ObjectId      │
├──────────────────────┤         │ - product_id: String │
│ + create()           │         │ - customer_id: String│
│ + update()           │         │ - rating: Integer    │
└──────────────────────┘         │ - comment: String    │
                                 │ - seller_reply: S    │
                                 │ - created_at: Date   │
                                 ├──────────────────────┤
                                 │ + create()           │
                                 │ + addReply()         │
                                 └──────────────────────┘
```

### 4. Diagramme de Séquence (Sprint 2 - Passer Commande)

```
┌────────┐     ┌──────────┐     ┌─────────┐     ┌──────────┐     ┌─────────┐
│ Client │     │ Frontend │     │   API   │     │ MongoDB  │     │ Vendeur │
└───┬────┘     └────┬─────┘     └────┬────┘     └────┬─────┘     └────┬────┘
    │               │                │               │                │
    │ Clic Commander│                │               │                │
    │──────────────►│                │               │                │
    │               │ GET /cart      │               │                │
    │               │───────────────►│               │                │
    │               │                │ Récupérer     │                │
    │               │                │──────────────►│                │
    │               │                │◄──────────────│                │
    │               │◄───────────────│               │                │
    │◄──────────────│ Afficher       │               │                │
    │               │ checkout       │               │                │
    │               │                │               │                │
    │ Choisir mode  │                │               │                │
    │ livraison     │                │               │                │
    │──────────────►│                │               │                │
    │               │                │               │                │
    │ Saisir adresse│                │               │                │
    │──────────────►│                │               │                │
    │               │                │               │                │
    │ Confirmer     │                │               │                │
    │──────────────►│                │               │                │
    │               │ POST /checkout │               │                │
    │               │───────────────►│               │                │
    │               │                │ Créer commande│                │
    │               │                │──────────────►│                │
    │               │                │ Vider panier  │                │
    │               │                │──────────────►│                │
    │               │                │ Créer notif   │                │
    │               │                │──────────────►│                │
    │               │                │◄──────────────│                │
    │               │◄───────────────│               │                │
    │◄──────────────│ Confirmation   │               │ Notification   │
    │               │                │               │───────────────►│
    │               │                │               │                │
```

### 5. Diagramme de Gantt (Sprint 2)

| Tâches | Début | Fin | Responsable | Statut |
|--------|-------|-----|-------------|--------|
| Implémentation du système de panier (API) | 11 Oct 2025 | 13 Oct 2025 | A. Traore | Terminé |
| Création de CartPage.jsx | 13 Oct 2025 | 15 Oct 2025 | A. Traore | Terminé |
| Implémentation du checkout avec livraison/pickup | 15 Oct 2025 | 18 Oct 2025 | A. Traore | Terminé |
| Création de CheckoutPage.jsx | 18 Oct 2025 | 20 Oct 2025 | A. Traore | Terminé |
| Implémentation des commandes (API) | 20 Oct 2025 | 22 Oct 2025 | A. Traore | Terminé |
| Création de OrderHistoryPage.jsx | 22 Oct 2025 | 24 Oct 2025 | A. Traore | Terminé |
| Système d'avis - API et ProductReviews.jsx | 24 Oct 2025 | 26 Oct 2025 | A. Traore | Terminé |
| Création de ReviewModal.jsx | 26 Oct 2025 | 27 Oct 2025 | A. Traore | Terminé |
| Demande vendeur et SellerRequestPage.jsx | 27 Oct 2025 | 29 Oct 2025 | A. Traore | Terminé |
| Création boutique - API et CreateShopPage.jsx | 29 Oct 2025 | 30 Oct 2025 | A. Traore | Terminé |
| Gestion produits vendeur - CreateProductPage.jsx | 30 Oct 2025 | 01 Nov 2025 | A. Traore | Terminé |
| EditProductPage.jsx | 01 Nov 2025 | 02 Nov 2025 | A. Traore | Terminé |
| SellerDashboard.jsx et statistiques | 02 Nov 2025 | 03 Nov 2025 | A. Traore | Terminé |
| SellerOrdersPage.jsx - gestion commandes | 03 Nov 2025 | 04 Nov 2025 | A. Traore | Terminé |
| Tests et corrections Sprint 2 | 04 Nov 2025 | 05 Nov 2025 | A. Traore | Terminé |

### 6. Captures d'écran des pages réalisées (Sprint 2)

#### PAGE PANIER (CartPage.jsx)

La page panier affiche tous les articles ajoutés par le client, groupés par vendeur.

**Fonctionnalités :**
- Liste des articles avec image, nom, prix
- Modification de la quantité avec contrôle du stock
- Suppression d'articles
- Calcul automatique du sous-total et total
- Groupement par vendeur
- Bouton "Passer commande"

#### PAGE CHECKOUT (CheckoutPage.jsx)

La page de finalisation permet de compléter la commande.

**Fonctionnalités :**
- Récapitulatif du panier
- Choix du mode de livraison (Livraison / Retrait en magasin)
- Si livraison : formulaire d'adresse complète
- Si pickup : affichage des informations du magasin avec téléphone et bouton chat
- Choix du mode de paiement
- Bouton de confirmation

#### TABLEAU DE BORD VENDEUR (SellerDashboard.jsx)

Le tableau de bord offre une vue synthétique des performances du vendeur.

**Fonctionnalités :**
- Nombre total de commandes
- Chiffre d'affaires total
- Nombre de produits en catalogue
- Commandes récentes
- Graphiques de tendances
- Accès rapide aux fonctionnalités

#### GESTION DES COMMANDES VENDEUR (SellerOrdersPage.jsx)

Cette page permet au vendeur de gérer toutes ses commandes.

**Fonctionnalités :**
- Liste des commandes avec filtrage par statut
- Détails de chaque commande (client, articles, adresse)
- Mise à jour du statut (Confirmé → Expédié → Livré)
- Notification automatique au client

---

## III. SPRINT 3 : Administration, Messagerie et Notifications

### 1. Sélection du Sprint 3

Le Sprint 3 couvre les **US28 à US35**, finalisant l'application avec l'espace administrateur complet, la messagerie intégrée et le système de notifications.

**Période :** 06 Novembre 2025 au 20 Novembre 2025

### 2. Diagramme de Cas d'Utilisation (Sprint 3)

```
                    ┌─────────────────────────────────────────┐
                    │   SPRINT 3 - Administration,            │
                    │   Messagerie & Notifications            │
                    └─────────────────────────────────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        │                             │                             │
        ▼                             ▼                             ▼
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│     ADMIN     │           │ CLIENT/VENDEUR│           │   SYSTÈME     │
└───────┬───────┘           └───────┬───────┘           └───────┬───────┘
        │                           │                           │
        ├──► Gérer utilisateurs     ├──► Envoyer message        ├──► Créer notif
        │                           │                           │
        ├──► Modifier rôle          ├──► Voir conversations     ├──► Envoyer email
        │                           │                           │
        ├──► Supprimer utilisateur  ├──► Répondre message       ├──► Marquer lu
        │                           │                           │
        ├──► Voir demandes vendeur  ├──► Voir notifications     │
        │                           │                           │
        ├──► Approuver vendeur      ├──► Marquer notif lue      │
        │                           │                           │
        ├──► Refuser vendeur        │                           │
        │                           │                           │
        └──► Voir statistiques      │                           │
             globales               │                           │
```

### 3. Diagramme de Classes (Sprint 3)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        DIAGRAMME DE CLASSES - SPRINT 3                  │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌──────────────────────┐
│    Conversation      │         │       Message        │
├──────────────────────┤         ├──────────────────────┤
│ - _id: ObjectId      │         │ - sender_id: String  │
│ - customer_id: String│◄───────►│ - content: String    │
│ - seller_id: String  │         │ - is_read: Boolean   │
│ - product_id: String │         │ - created_at: Date   │
│ - messages: Message[]│         └──────────────────────┘
│ - last_message_at: D │
│ - created_at: Date   │
├──────────────────────┤
│ + create()           │
│ + addMessage()       │
│ + markAsRead()       │
└──────────────────────┘

┌──────────────────────┐         ┌──────────────────────┐
│    Notification      │         │  NotificationType    │
├──────────────────────┤         ├──────────────────────┤
│ - _id: ObjectId      │         │ <<enumeration>>      │
│ - user_id: String    │         │ NEW_ORDER            │
│ - type: NotifType    │         │ ORDER_STATUS         │
│ - title: String      │         │ NEW_MESSAGE          │
│ - message: String    │         │ NEW_REVIEW           │
│ - data: Object       │         │ SELLER_APPROVED      │
│ - is_read: Boolean   │         │ SELLER_REJECTED      │
│ - created_at: Date   │         └──────────────────────┘
├──────────────────────┤
│ + create()           │
│ + markAsRead()       │
└──────────────────────┘

┌──────────────────────┐
│   SellerRequest      │
├──────────────────────┤
│ - business_name: S   │
│ - business_desc: S   │
│ - business_addr: S   │
│ - business_phone: S  │
│ - document_url: S    │
│ - submitted_at: Date │
│ - reviewed_at: Date  │
│ - reviewed_by: S     │
│ - rejection_reason: S│
├──────────────────────┤
│ + submit()           │
│ + approve()          │
│ + reject()           │
└──────────────────────┘
```

### 4. Diagramme de Séquence (Sprint 3 - Approbation Vendeur)

```
┌────────────┐  ┌──────────┐  ┌─────────┐  ┌──────────┐  ┌───────────┐
│ Utilisateur│  │ Frontend │  │   API   │  │ MongoDB  │  │   Admin   │
└─────┬──────┘  └────┬─────┘  └────┬────┘  └────┬─────┘  └─────┬─────┘
      │              │             │            │               │
      │ Soumettre    │             │            │               │
      │ demande      │             │            │               │
      │─────────────►│             │            │               │
      │              │ POST /seller│            │               │
      │              │ /request    │            │               │
      │              │────────────►│            │               │
      │              │             │ Créer      │               │
      │              │             │ demande    │               │
      │              │             │───────────►│               │
      │              │             │◄───────────│               │
      │              │◄────────────│            │               │
      │◄─────────────│ Confirmation│            │               │
      │              │             │            │               │
      │              │             │            │ Consulter     │
      │              │             │            │ demandes      │
      │              │             │            │◄──────────────│
      │              │             │◄───────────│               │
      │              │             │────────────│──────────────►│
      │              │             │            │               │
      │              │             │            │ Approuver     │
      │              │             │            │◄──────────────│
      │              │             │ POST       │               │
      │              │             │ /approve   │               │
      │              │             │◄───────────│───────────────│
      │              │             │ Update     │               │
      │              │             │ status     │               │
      │              │             │───────────►│               │
      │              │             │ Update     │               │
      │              │             │ role       │               │
      │              │             │───────────►│               │
      │              │             │ Send email │               │
      │◄─────────────│─────────────│────────────│               │
      │ Email        │             │            │               │
      │ approbation  │             │            │               │
```

### 5. Diagramme de Gantt (Sprint 3)

| Tâches | Début | Fin | Responsable | Statut |
|--------|-------|-----|-------------|--------|
| Gestion utilisateurs admin - API | 06 Nov 2025 | 07 Nov 2025 | A. Traore | Terminé |
| AdminDashboard.jsx | 07 Nov 2025 | 08 Nov 2025 | A. Traore | Terminé |
| Gestion demandes vendeur - API | 08 Nov 2025 | 09 Nov 2025 | A. Traore | Terminé |
| AdminSellerRequests.jsx | 09 Nov 2025 | 10 Nov 2025 | A. Traore | Terminé |
| Service d'envoi d'emails | 10 Nov 2025 | 11 Nov 2025 | A. Traore | Terminé |
| Système de messagerie - API | 11 Nov 2025 | 13 Nov 2025 | A. Traore | Terminé |
| MessagesPage.jsx | 13 Nov 2025 | 15 Nov 2025 | A. Traore | Terminé |
| Système de notifications - API | 15 Nov 2025 | 16 Nov 2025 | A. Traore | Terminé |
| NotificationBell.jsx | 16 Nov 2025 | 17 Nov 2025 | A. Traore | Terminé |
| AdminAnalytics.jsx - statistiques globales | 17 Nov 2025 | 18 Nov 2025 | A. Traore | Terminé |
| SellerPublicPage.jsx - profil public vendeur | 18 Nov 2025 | 19 Nov 2025 | A. Traore | Terminé |
| Tests d'intégration et corrections finales | 19 Nov 2025 | 20 Nov 2025 | A. Traore | Terminé |

### 6. Captures d'écran des pages réalisées (Sprint 3)

#### TABLEAU DE BORD ADMIN (AdminDashboard.jsx)

Le tableau de bord administrateur offre une vue globale de la plateforme.

**Fonctionnalités :**
- Nombre total d'utilisateurs
- Nombre de vendeurs (approuvés/en attente)
- Nombre de produits sur la plateforme
- Nombre de commandes
- Demandes vendeur en attente
- Accès rapide à la gestion

#### GESTION DES DEMANDES VENDEUR (AdminSellerRequests.jsx)

Cette page permet à l'admin de traiter les demandes de compte vendeur.

**Fonctionnalités :**
- Liste des demandes en attente
- Détails de chaque demande (entreprise, description, documents)
- Bouton "Approuver" avec confirmation
- Bouton "Refuser" avec saisie du motif
- Envoi automatique d'email au demandeur

#### PAGE MESSAGERIE (MessagesPage.jsx)

La messagerie permet la communication directe entre clients et vendeurs.

**Fonctionnalités :**
- Liste des conversations
- Indicateur de messages non lus
- Interface de chat en temps réel
- Affichage du produit concerné
- Historique des messages

#### CENTRE DE NOTIFICATIONS (NotificationBell.jsx)

Le composant de notifications informe les utilisateurs des événements importants.

**Fonctionnalités :**
- Icône cloche avec compteur de non lues
- Liste déroulante des notifications
- Types : nouvelle commande, message, avis, approbation
- Marquage comme lu
- Lien vers l'élément concerné
