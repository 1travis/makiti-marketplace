# INSTITUT TECCART

## Rapport de stage de fin d'étude

**Présenté en vue de l'obtention de l'attestation d'études collégiales (AEC)**

### TECHNIQUE DE L'INFORMATIQUE

---

**PAR TRAORE ABDOULAYE**

## Développement d'une plateforme e-commerce multi-vendeurs : Makiti Marketplace

**Encadrant:** M. Safouen Bani | **Session:** Automne 2025

---

# REMERCIEMENTS

Je tiens à exprimer ma profonde gratitude à toute l'équipe pédagogique de l'Institut Teccart pour la qualité de l'enseignement et le soutien apporté tout au long de mon parcours académique.

Je remercie particulièrement mon encadrant, M. Safouen Bani, pour ses conseils avisés, sa disponibilité et son accompagnement durant la réalisation de ce projet de fin d'études.

Mes remerciements vont également à ma famille et à mes proches pour leur encouragement constant.

---

# Chapitre I : ÉTUDE DE L'EXISTANT

## I. Introduction

Ce chapitre établit les bases nécessaires pour comprendre le projet **Makiti Marketplace**, en identifiant les enjeux, les besoins et les limites des solutions e-commerce existantes.

## II. Contexte et analyse critique

Le commerce électronique connaît une croissance exponentielle. Cependant, les solutions existantes présentent plusieurs limitations :

| Problème | Description |
|----------|-------------|
| **Coûts élevés** | Frais d'abonnement et commissions importantes |
| **Complexité technique** | Compétences requises pour la mise en place |
| **Communication limitée** | Pas de contact direct client-vendeur |
| **Modes de livraison** | Absence d'option retrait en magasin |

## III. Justification du projet

**Makiti Marketplace** répond à ces limites en proposant :
- Interface intuitive sans compétences techniques requises
- Messagerie intégrée client-vendeur
- Choix livraison ou retrait en magasin (pickup)
- Système de validation des vendeurs
- Tableaux de bord analytiques

## IV. Technologies utilisées

### Frontend
| Technologie | Utilisation |
|-------------|-------------|
| React 18 | Framework UI |
| Redux Toolkit | Gestion d'état |
| Chakra UI | Composants UI |
| Axios | Client HTTP |

### Backend
| Technologie | Utilisation |
|-------------|-------------|
| FastAPI | Framework API |
| MongoDB | Base de données |
| JWT | Authentification |
| Pydantic | Validation |

---

# Chapitre II : Analyse et Spécification des Besoins

## I. Identification des acteurs

| Acteur | Description |
|--------|-------------|
| **Visiteur** | Parcourt le catalogue, crée un compte |
| **Client** | Achète, laisse des avis, communique |
| **Vendeur** | Gère boutique, produits, commandes |
| **Admin** | Supervise, approuve les vendeurs |

## II. Exigences fonctionnelles (extrait)

| ID | Description | Priorité |
|----|-------------|----------|
| EF1 | Inscription avec email et mot de passe | Haute |
| EF2 | Connexion sécurisée avec JWT | Haute |
| EF9 | Ajouter produit au panier | Haute |
| EF13 | Choix livraison ou pickup | Haute |
| EF20 | Messagerie client-vendeur | Haute |
| EF38 | Admin approuve demande vendeur | Haute |

## III. Exigences non fonctionnelles

| ID | Description | Priorité |
|----|-------------|----------|
| ENF1 | Mots de passe cryptés Bcrypt | Haute |
| ENF9 | Interface responsive | Haute |
| ENF12 | Mode clair/sombre | Moyenne |
| ENF20 | Documentation Swagger | Haute |

---

# Chapitre III : Étude conceptuelle

## I. Architecture du système

```
FRONTEND (React) ←→ API REST ←→ BACKEND (FastAPI) ←→ MongoDB
```

**3 couches principales :**
1. **Frontend** : React 18, Chakra UI, Redux (22 pages)
2. **Backend** : FastAPI, JWT, Pydantic
3. **Database** : MongoDB (8 collections)

## II. Collections MongoDB

| Collection | Description |
|------------|-------------|
| users | Utilisateurs et rôles |
| products | Catalogue produits |
| shops | Boutiques vendeurs |
| orders | Commandes |
| carts | Paniers |
| reviews | Avis clients |
| conversations | Messagerie |
| notifications | Alertes |

---

# Chapitre IV : SPRINTS DU PROJET

## SPRINT 1 : Authentification & Catalogue

**Période:** 23 Sept - 10 Oct 2025

| Tâche | Statut |
|-------|--------|
| Configuration React + FastAPI | ✅ |
| Authentification JWT | ✅ |
| Pages Login/Register | ✅ |
| Catalogue produits | ✅ |
| Filtres et recherche | ✅ |

## SPRINT 2 : Panier & Espace Vendeur

**Période:** 11 Oct - 05 Nov 2025

| Tâche | Statut |
|-------|--------|
| Système de panier | ✅ |
| Checkout (livraison/pickup) | ✅ |
| Historique commandes | ✅ |
| Système d'avis | ✅ |
| Espace vendeur complet | ✅ |

## SPRINT 3 : Admin & Messagerie

**Période:** 06 Nov - 20 Nov 2025

| Tâche | Statut |
|-------|--------|
| Gestion utilisateurs admin | ✅ |
| Approbation vendeurs | ✅ |
| Messagerie intégrée | ✅ |
| Notifications | ✅ |
| Tests finaux | ✅ |

---

# Chapitre V : CONCLUSION GÉNÉRALE

Ce projet a permis de développer **Makiti Marketplace**, une plateforme e-commerce multi-vendeurs complète.

## Réalisations techniques

- **Frontend** : 22 pages React avec Chakra UI
- **Backend** : API REST FastAPI avec 50+ endpoints
- **Base de données** : MongoDB avec 8 collections
- **Sécurité** : JWT, Bcrypt, validation Pydantic

## Compétences acquises

- Développement Full Stack (React + FastAPI)
- Architecture client-serveur découplée
- Gestion de base de données NoSQL
- Méthodologie Agile (Sprints)
- Authentification et sécurité web

## Perspectives d'évolution

- Application mobile (React Native)
- Paiement en ligne intégré
- Système de chat en temps réel (WebSocket)
- Analytics avancés

**Makiti Marketplace** constitue une solution fonctionnelle prête à évoluer, démontrant ma capacité à mener des projets d'envergure.

---

**TRAORE Abdoulaye** - Institut Teccart - Automne 2025
