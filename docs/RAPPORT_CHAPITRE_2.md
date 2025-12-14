# Chapitre II : Analyse et Spécification des Besoins

## I. Introduction

Ce chapitre définit les besoins fonctionnels et non fonctionnels du système **Makiti Marketplace**. Il décrit les fonctionnalités principales offertes par l'application, ainsi que les interactions possibles entre les différents utilisateurs et le système.

L'objectif est d'établir une vision claire des attentes et exigences, afin de garantir une mise en œuvre efficace et adaptée aux besoins des utilisateurs.

En intégrant des fonctionnalités avancées telles que la gestion des boutiques multi-vendeurs, le système d'avis avec réponses, la messagerie intégrée, le choix de mode de livraison et les notifications automatiques, cette application vise à améliorer l'expérience d'achat en ligne et à faciliter la gestion pour les vendeurs.

## II. Étude des besoins

Dans cette section, seront exposés les besoins des utilisateurs à travers l'identification des acteurs, ainsi que les spécifications fonctionnelles et non fonctionnelles, afin d'aboutir à une application performante et adaptée aux attentes du marché.

### 1. Identification des acteurs

Un acteur est défini comme une entité externe interagissant avec le système. Dans l'application Makiti Marketplace, nous avons identifié quatre acteurs principaux :

➢ **Visiteur** : Peut parcourir le catalogue de produits, consulter les détails des produits, voir les avis, et créer un compte. Il a un accès limité aux fonctionnalités publiques de la plateforme.

➢ **Client (Customer)** : Peut acheter des produits, gérer son panier, passer des commandes avec choix du mode de livraison, consulter l'historique de ses commandes, laisser des avis sur les produits, gérer sa liste de souhaits et communiquer directement avec les vendeurs via la messagerie intégrée.

➢ **Vendeur (Seller)** : Peut créer et configurer sa boutique, ajouter et gérer ses produits, consulter et traiter les commandes reçues, répondre aux avis des clients, communiquer avec les clients, et accéder à un tableau de bord avec statistiques de ventes.

➢ **Administrateur (Admin)** : Peut gérer tous les utilisateurs de la plateforme, approuver ou refuser les demandes de compte vendeur, superviser l'ensemble des activités, et accéder aux statistiques globales de la plateforme.

### 2. Exigences fonctionnelles

Les fonctionnalités de l'application ont été définies en s'appuyant sur les besoins des utilisateurs et les processus d'un marketplace e-commerce moderne.

| ID | Description de l'exigence fonctionnelle | Priorité |
|----|----------------------------------------|----------|
| EF1 | L'utilisateur peut s'inscrire avec email, nom complet et mot de passe | Haute |
| EF2 | L'utilisateur peut choisir son rôle lors de l'inscription (client ou vendeur) | Haute |
| EF3 | L'utilisateur peut se connecter avec ses identifiants (email et mot de passe) | Haute |
| EF4 | L'utilisateur peut se déconnecter du système à tout moment | Haute |
| EF5 | L'utilisateur peut modifier ses informations personnelles depuis son profil | Moyenne |
| EF6 | Le visiteur peut parcourir le catalogue de produits sans authentification | Haute |
| EF7 | Le visiteur peut rechercher des produits par nom ou mot-clé | Haute |
| EF8 | Le visiteur peut filtrer les produits par catégorie | Haute |
| EF9 | Le visiteur peut consulter les détails complets d'un produit | Haute |
| EF10 | Le visiteur peut voir les avis et la note moyenne d'un produit | Haute |
| EF11 | Le client peut ajouter un produit au panier | Haute |
| EF12 | Le client peut modifier la quantité d'un article dans le panier | Haute |
| EF13 | Le client peut supprimer un article du panier | Haute |
| EF14 | Le client peut consulter son panier avec le total calculé | Haute |
| EF15 | Le système affiche les articles du panier groupés par vendeur | Moyenne |
| EF16 | Le client peut choisir entre livraison à domicile et retrait en magasin | Haute |
| EF17 | Le client peut saisir son adresse de livraison complète | Haute |
| EF18 | Le client peut voir les informations du point de retrait (pickup) | Haute |
| EF19 | Le client peut choisir son mode de paiement | Haute |
| EF20 | Le client peut confirmer et passer sa commande | Haute |
| EF21 | Le système génère automatiquement un numéro unique pour chaque commande | Haute |
| EF22 | Le client peut consulter l'historique de ses commandes | Haute |
| EF23 | Le client peut suivre le statut de ses commandes en temps réel | Haute |
| EF24 | Le client peut laisser un avis et une note (1-5 étoiles) sur un produit | Haute |
| EF25 | Le client peut ajouter des produits à sa liste de souhaits (favoris) | Moyenne |
| EF26 | Le client peut retirer des produits de sa liste de souhaits | Moyenne |
| EF27 | Le client peut envoyer un message à un vendeur depuis la page produit | Haute |
| EF28 | Le client peut consulter ses conversations avec les vendeurs | Haute |
| EF29 | Le client peut consulter le profil public d'un vendeur | Moyenne |
| EF30 | L'utilisateur peut soumettre une demande pour devenir vendeur | Haute |
| EF31 | L'utilisateur peut fournir les informations de son entreprise dans la demande | Haute |
| EF32 | L'utilisateur peut uploader un document justificatif avec sa demande | Moyenne |
| EF33 | Le vendeur approuvé peut créer et configurer sa boutique | Haute |
| EF34 | Le vendeur peut ajouter un nouveau produit avec images | Haute |
| EF35 | Le vendeur peut modifier les informations d'un produit existant | Haute |
| EF36 | Le vendeur peut supprimer un produit de son catalogue | Haute |
| EF37 | Le vendeur peut consulter la liste de tous ses produits | Haute |
| EF38 | Le vendeur peut gérer le stock de ses produits | Haute |
| EF39 | Le vendeur peut consulter les commandes reçues | Haute |
| EF40 | Le vendeur peut mettre à jour le statut d'une commande | Haute |
| EF41 | Le vendeur peut répondre aux avis laissés par les clients | Moyenne |
| EF42 | Le vendeur peut consulter son tableau de bord avec statistiques | Haute |
| EF43 | Le vendeur peut voir ses revenus et nombre de commandes | Haute |
| EF44 | Le vendeur peut répondre aux messages des clients | Haute |
| EF45 | L'administrateur peut consulter la liste de tous les utilisateurs | Haute |
| EF46 | L'administrateur peut modifier le rôle d'un utilisateur | Haute |
| EF47 | L'administrateur peut supprimer un utilisateur | Haute |
| EF48 | L'administrateur peut consulter les demandes de compte vendeur en attente | Haute |
| EF49 | L'administrateur peut approuver une demande de compte vendeur | Haute |
| EF50 | L'administrateur peut refuser une demande avec motif de refus | Haute |
| EF51 | L'administrateur peut consulter les statistiques globales de la plateforme | Moyenne |
| EF52 | Le système envoie des notifications pour les nouvelles commandes | Haute |
| EF53 | Le système envoie des notifications pour les nouveaux messages | Haute |
| EF54 | Le système envoie des notifications pour les changements de statut de commande | Haute |
| EF55 | L'utilisateur peut consulter toutes ses notifications | Haute |
| EF56 | L'utilisateur peut marquer une notification comme lue | Moyenne |
| EF57 | Le système envoie un email lors de l'approbation d'une demande vendeur | Moyenne |
| EF58 | Le système envoie un email lors du refus d'une demande vendeur | Moyenne |

### 3. Exigences non fonctionnelles

Les besoins non fonctionnels définissent les exigences techniques et ergonomiques de l'application afin d'assurer une expérience fluide, sécurisée et performante.

| ID | Description de l'exigence non fonctionnelle | Priorité |
|----|---------------------------------------------|----------|
| ENF1 | Les mots de passe doivent être cryptés avec l'algorithme Bcrypt | Haute |
| ENF2 | L'authentification doit utiliser des tokens JWT sécurisés | Haute |
| ENF3 | Le système doit gérer strictement les droits d'accès selon le rôle de chaque utilisateur | Haute |
| ENF4 | L'application doit être protégée contre les injections SQL et les attaques XSS | Haute |
| ENF5 | Les sessions utilisateur (tokens) doivent expirer automatiquement après 24 heures | Moyenne |
| ENF6 | Le temps de réponse de l'API doit être inférieur à 2 secondes pour les requêtes standards | Haute |
| ENF7 | Les requêtes à la base de données MongoDB doivent être optimisées avec des index | Haute |
| ENF8 | Le système doit mettre en cache les données fréquemment consultées | Moyenne |
| ENF9 | L'application doit supporter au minimum 100 utilisateurs connectés simultanément | Haute |
| ENF10 | L'interface web doit être responsive (compatible ordinateur, tablette, smartphone) | Haute |
| ENF11 | La navigation doit être intuitive et réduire le besoin de formation | Haute |
| ENF12 | Les messages d'erreur doivent être clairs et informatifs en français | Moyenne |
| ENF13 | L'interface doit supporter le mode clair et le mode sombre | Moyenne |
| ENF14 | L'interface doit être entièrement en français | Haute |
| ENF15 | Les images uploadées doivent être stockées de manière sécurisée sur le serveur | Haute |
| ENF16 | Le système doit valider le format et la taille des images uploadées | Moyenne |
| ENF17 | Le système doit gérer les erreurs avec des messages appropriés pour l'utilisateur | Haute |
| ENF18 | La disponibilité du système doit être d'au moins 99% | Haute |
| ENF19 | Le système doit pouvoir récupérer automatiquement en cas de panne mineure | Moyenne |
| ENF20 | Le code doit être structuré selon une architecture modulaire | Haute |
| ENF21 | Une documentation technique complète doit accompagner le projet | Moyenne |
| ENF22 | Le code doit utiliser des conventions de nommage cohérentes | Moyenne |
| ENF23 | L'API doit fournir une documentation Swagger automatique | Haute |
| ENF24 | Le code doit être commenté en français pour faciliter la maintenance | Moyenne |

## III. Cas d'utilisation

### Cas d'utilisation 1 : S'inscrire sur la plateforme

| Élément | Description |
|---------|-------------|
| **Titre** | S'inscrire sur la plateforme |
| **Intention** | Permettre à un visiteur de créer un compte pour accéder aux fonctionnalités de la plateforme |
| **Acteurs** | Visiteur |
| **Pré-conditions** | Le visiteur n'a pas de compte existant avec cet email |
| **Commence quand** | Le visiteur clique sur le bouton "S'inscrire" |
| **Enchaînements** | 1. Le système affiche le formulaire d'inscription<br>2. Le visiteur saisit son email, nom complet et mot de passe<br>3. Le visiteur choisit son rôle (client ou vendeur)<br>4. Le système valide le format des données saisies<br>5. Le système vérifie que l'email n'est pas déjà utilisé<br>6. Le système crée le compte avec mot de passe hashé<br>7. Le système redirige vers la page de connexion |
| **Finit quand** | Le compte est créé avec succès |
| **Exception(s)** | • Email déjà utilisé : message d'erreur affiché<br>• Données invalides : validation échouée<br>• Mot de passe trop faible : message d'erreur |
| **Post-conditions** | Nouveau compte utilisateur créé dans la base de données |

### Cas d'utilisation 2 : Se connecter au système

| Élément | Description |
|---------|-------------|
| **Titre** | Se connecter au système |
| **Intention** | Permettre à l'utilisateur de s'authentifier pour accéder à son espace personnel |
| **Acteurs** | Client, Vendeur, Administrateur |
| **Pré-conditions** | L'utilisateur possède un compte valide dans le système |
| **Commence quand** | L'utilisateur accède à la page de connexion |
| **Enchaînements** | 1. L'utilisateur saisit son email et mot de passe<br>2. Le système vérifie les identifiants dans la base de données<br>3. Le système valide le mot de passe avec Bcrypt<br>4. Le système génère un token JWT<br>5. Le token est stocké dans le localStorage<br>6. Le système récupère les informations du profil<br>7. Redirection vers l'interface adaptée au rôle |
| **Finit quand** | L'utilisateur est authentifié et accède à son espace |
| **Exception(s)** | • Identifiants incorrects : message d'erreur<br>• Compte désactivé : notification appropriée<br>• Problème de connexion : message d'erreur |
| **Post-conditions** | Session utilisateur active avec token JWT valide |

### Cas d'utilisation 3 : Modifier le profil utilisateur

| Élément | Description |
|---------|-------------|
| **Titre** | Modifier le profil utilisateur |
| **Intention** | Permettre à l'utilisateur de mettre à jour ses informations personnelles |
| **Acteurs** | Client, Vendeur, Administrateur |
| **Pré-conditions** | Utilisateur authentifié et session active |
| **Commence quand** | L'utilisateur clique sur "Mon profil" dans le menu |
| **Enchaînements** | 1. Le système affiche le formulaire de profil avec les données actuelles<br>2. L'utilisateur modifie les champs souhaités (nom, téléphone)<br>3. Le système valide la syntaxe des nouvelles données<br>4. L'utilisateur confirme les modifications<br>5. Le système enregistre les nouvelles informations |
| **Finit quand** | Les informations du profil sont mises à jour avec succès |
| **Exception(s)** | • Données invalides<br>• Erreur lors de la sauvegarde |
| **Post-conditions** | Le profil utilisateur contient les informations mises à jour |

### Cas d'utilisation 4 : Se déconnecter du système

| Élément | Description |
|---------|-------------|
| **Titre** | Se déconnecter du système |
| **Intention** | Permettre à l'utilisateur de terminer sa session de manière sécurisée |
| **Acteurs** | Client, Vendeur, Administrateur |
| **Pré-conditions** | Utilisateur authentifié et session active |
| **Commence quand** | L'utilisateur clique sur le bouton "Déconnexion" |
| **Enchaînements** | 1. Le système supprime le token du localStorage<br>2. Le système réinitialise l'état Redux<br>3. Redirection vers la page d'accueil |
| **Finit quand** | La session est fermée et l'utilisateur retourne à l'accueil |
| **Exception(s)** | • Session déjà expirée |
| **Post-conditions** | Session utilisateur terminée, accès aux fonctionnalités restreint |

### Cas d'utilisation 5 : Parcourir le catalogue de produits

| Élément | Description |
|---------|-------------|
| **Titre** | Parcourir le catalogue de produits |
| **Intention** | Permettre de visualiser les produits disponibles sur la plateforme |
| **Acteurs** | Visiteur, Client |
| **Pré-conditions** | Aucune |
| **Commence quand** | L'utilisateur accède à la page "Produits" |
| **Enchaînements** | 1. Le système récupère la liste des produits depuis l'API<br>2. Le système affiche les produits sous forme de grille<br>3. L'utilisateur peut filtrer par catégorie<br>4. L'utilisateur peut rechercher par mot-clé<br>5. L'utilisateur peut cliquer sur un produit pour voir les détails |
| **Finit quand** | L'utilisateur visualise les produits souhaités |
| **Exception(s)** | • Aucun produit disponible<br>• Erreur de chargement |
| **Post-conditions** | Liste de produits affichée selon les filtres appliqués |

### Cas d'utilisation 6 : Consulter les détails d'un produit

| Élément | Description |
|---------|-------------|
| **Titre** | Consulter les détails d'un produit |
| **Intention** | Afficher toutes les informations d'un produit spécifique |
| **Acteurs** | Visiteur, Client |
| **Pré-conditions** | Produit existant dans le catalogue |
| **Commence quand** | L'utilisateur clique sur un produit |
| **Enchaînements** | 1. Le système récupère les détails du produit<br>2. Affichage des images du produit<br>3. Affichage du nom, description, prix<br>4. Affichage de la quantité en stock<br>5. Affichage de la note moyenne et des avis<br>6. Affichage du lien vers le profil du vendeur |
| **Finit quand** | Les détails complets du produit sont affichés |
| **Exception(s)** | • Produit non trouvé<br>• Erreur de chargement |
| **Post-conditions** | Informations complètes du produit visibles |

### Cas d'utilisation 7 : Ajouter un produit au panier

| Élément | Description |
|---------|-------------|
| **Titre** | Ajouter un produit au panier |
| **Intention** | Permettre au client d'ajouter un produit à son panier d'achat |
| **Acteurs** | Client |
| **Pré-conditions** | Client authentifié, produit disponible en stock |
| **Commence quand** | Le client clique sur "Ajouter au panier" |
| **Enchaînements** | 1. Le système vérifie que l'utilisateur est connecté<br>2. Le système vérifie la disponibilité du stock<br>3. Le système ajoute le produit au panier via l'API<br>4. Le système met à jour le compteur du panier dans la navbar<br>5. Notification de confirmation affichée |
| **Finit quand** | Le produit est ajouté au panier |
| **Exception(s)** | • Stock insuffisant<br>• Utilisateur non connecté : redirection vers login |
| **Post-conditions** | Panier mis à jour avec le nouveau produit |

### Cas d'utilisation 8 : Gérer le panier

| Élément | Description |
|---------|-------------|
| **Titre** | Gérer le panier |
| **Intention** | Permettre au client de modifier les quantités ou supprimer des articles |
| **Acteurs** | Client |
| **Pré-conditions** | Client authentifié, panier non vide |
| **Commence quand** | Le client accède à la page "Panier" |
| **Enchaînements** | 1. Le système affiche les articles du panier groupés par vendeur<br>2. Le client peut modifier la quantité d'un article<br>3. Le client peut supprimer un article<br>4. Le système recalcule le total automatiquement<br>5. Le client peut continuer ses achats ou passer commande |
| **Finit quand** | Le panier reflète les modifications souhaitées |
| **Exception(s)** | • Quantité supérieure au stock<br>• Erreur de mise à jour |
| **Post-conditions** | Panier mis à jour avec les nouvelles quantités |

### Cas d'utilisation 9 : Passer une commande

| Élément | Description |
|---------|-------------|
| **Titre** | Passer une commande |
| **Intention** | Permettre au client de finaliser son achat |
| **Acteurs** | Client |
| **Pré-conditions** | Client authentifié, panier non vide |
| **Commence quand** | Le client clique sur "Commander" depuis le panier |
| **Enchaînements** | 1. Le système affiche le récapitulatif du panier<br>2. Le client choisit le mode de livraison (livraison ou pickup)<br>3. Si livraison : saisie de l'adresse complète<br>4. Si pickup : affichage des informations du magasin<br>5. Le client choisit le mode de paiement<br>6. Le client confirme la commande<br>7. Le système crée la commande et vide le panier<br>8. Notification envoyée au vendeur |
| **Finit quand** | La commande est créée avec succès |
| **Exception(s)** | • Stock insuffisant<br>• Données de livraison invalides |
| **Post-conditions** | Commande créée, panier vidé, vendeur notifié |

### Cas d'utilisation 10 : Choisir le mode de livraison

| Élément | Description |
|---------|-------------|
| **Titre** | Choisir entre livraison et retrait en magasin |
| **Intention** | Offrir au client la flexibilité du mode de réception |
| **Acteurs** | Client |
| **Pré-conditions** | Client en cours de checkout |
| **Commence quand** | Le client arrive à l'étape du mode de livraison |
| **Enchaînements** | 1. Le système affiche les deux options (livraison/pickup)<br>2. Si livraison sélectionnée : formulaire d'adresse affiché<br>3. Si pickup sélectionné : informations du magasin affichées<br>4. Affichage du numéro de téléphone du vendeur<br>5. Option de contacter le vendeur par chat ou téléphone |
| **Finit quand** | Le mode de livraison est sélectionné |
| **Exception(s)** | • Boutique sans adresse configurée |
| **Post-conditions** | Mode de livraison enregistré pour la commande |

### Cas d'utilisation 11 : Consulter l'historique des commandes

| Élément | Description |
|---------|-------------|
| **Titre** | Consulter l'historique des commandes |
| **Intention** | Permettre au client de voir toutes ses commandes passées |
| **Acteurs** | Client |
| **Pré-conditions** | Client authentifié |
| **Commence quand** | Le client accède à "Mes commandes" |
| **Enchaînements** | 1. Le système récupère les commandes du client<br>2. Affichage de la liste avec numéro, date, total, statut<br>3. Le client peut cliquer pour voir les détails<br>4. Affichage des articles, adresse, mode de livraison |
| **Finit quand** | L'historique des commandes est affiché |
| **Exception(s)** | • Aucune commande passée |
| **Post-conditions** | Vue complète de l'historique des commandes |

### Cas d'utilisation 12 : Laisser un avis sur un produit

| Élément | Description |
|---------|-------------|
| **Titre** | Laisser un avis sur un produit |
| **Intention** | Permettre au client de partager son expérience |
| **Acteurs** | Client |
| **Pré-conditions** | Client authentifié |
| **Commence quand** | Le client clique sur "Laisser un avis" |
| **Enchaînements** | 1. Le système affiche le formulaire d'avis<br>2. Le client attribue une note (1-5 étoiles)<br>3. Le client rédige son commentaire<br>4. Le client soumet l'avis<br>5. Le système enregistre l'avis<br>6. Le système recalcule la note moyenne du produit |
| **Finit quand** | L'avis est publié sur la page produit |
| **Exception(s)** | • Commentaire vide<br>• Note non sélectionnée |
| **Post-conditions** | Avis visible, note moyenne mise à jour |

### Cas d'utilisation 13 : Gérer la liste de souhaits

| Élément | Description |
|---------|-------------|
| **Titre** | Gérer la liste de souhaits (favoris) |
| **Intention** | Permettre au client de sauvegarder des produits pour plus tard |
| **Acteurs** | Client |
| **Pré-conditions** | Client authentifié |
| **Commence quand** | Le client clique sur l'icône cœur d'un produit |
| **Enchaînements** | 1. Le système ajoute/retire le produit des favoris<br>2. Mise à jour du localStorage<br>3. Mise à jour du compteur dans la navbar<br>4. Le client peut consulter sa liste de souhaits |
| **Finit quand** | La liste de souhaits est mise à jour |
| **Exception(s)** | • Produit déjà dans les favoris |
| **Post-conditions** | Liste de souhaits reflétant les préférences |

### Cas d'utilisation 14 : Contacter un vendeur

| Élément | Description |
|---------|-------------|
| **Titre** | Contacter un vendeur |
| **Intention** | Permettre au client de communiquer avec un vendeur |
| **Acteurs** | Client |
| **Pré-conditions** | Client authentifié |
| **Commence quand** | Le client clique sur "Contacter" depuis une page produit |
| **Enchaînements** | 1. Le système crée ou récupère la conversation existante<br>2. Le système affiche l'interface de messagerie<br>3. Le client rédige son message<br>4. Le client envoie le message<br>5. Le système notifie le vendeur |
| **Finit quand** | Le message est envoyé au vendeur |
| **Exception(s)** | • Message vide<br>• Erreur d'envoi |
| **Post-conditions** | Message enregistré, vendeur notifié |

### Cas d'utilisation 15 : Consulter le profil public d'un vendeur

| Élément | Description |
|---------|-------------|
| **Titre** | Consulter le profil public d'un vendeur |
| **Intention** | Permettre de voir les informations et produits d'un vendeur |
| **Acteurs** | Visiteur, Client |
| **Pré-conditions** | Vendeur existant et approuvé |
| **Commence quand** | L'utilisateur clique sur le nom du vendeur |
| **Enchaînements** | 1. Le système récupère les informations du vendeur<br>2. Affichage de la bio et description de la boutique<br>3. Affichage de l'adresse de la boutique<br>4. Affichage de tous les produits du vendeur<br>5. Affichage des avis reçus par le vendeur |
| **Finit quand** | Le profil public est affiché |
| **Exception(s)** | • Vendeur non trouvé |
| **Post-conditions** | Informations du vendeur visibles |

### Cas d'utilisation 16 : Soumettre une demande vendeur

| Élément | Description |
|---------|-------------|
| **Titre** | Soumettre une demande pour devenir vendeur |
| **Intention** | Permettre à un utilisateur de demander un compte vendeur |
| **Acteurs** | Client (souhaitant devenir vendeur) |
| **Pré-conditions** | Utilisateur authentifié |
| **Commence quand** | L'utilisateur accède à "Devenir vendeur" |
| **Enchaînements** | 1. Le système affiche le formulaire de demande<br>2. L'utilisateur saisit le nom de son entreprise<br>3. L'utilisateur saisit la description de son activité<br>4. L'utilisateur saisit l'adresse et le téléphone<br>5. L'utilisateur peut uploader un document justificatif<br>6. L'utilisateur soumet la demande<br>7. Le système enregistre avec statut "pending" |
| **Finit quand** | La demande est soumise et en attente |
| **Exception(s)** | • Demande déjà en cours<br>• Données incomplètes |
| **Post-conditions** | Demande créée, administrateur notifié |

### Cas d'utilisation 17 : Créer une boutique (Vendeur)

| Élément | Description |
|---------|-------------|
| **Titre** | Créer et configurer sa boutique |
| **Intention** | Permettre au vendeur approuvé de créer sa boutique |
| **Acteurs** | Vendeur |
| **Pré-conditions** | Vendeur authentifié et approuvé |
| **Commence quand** | Le vendeur accède à "Créer ma boutique" |
| **Enchaînements** | 1. Le système affiche le formulaire de création<br>2. Le vendeur saisit le nom de la boutique<br>3. Le vendeur saisit la description<br>4. Le vendeur saisit l'adresse complète<br>5. Le vendeur saisit le numéro de téléphone<br>6. Le vendeur peut uploader des images<br>7. Le système crée la boutique |
| **Finit quand** | La boutique est créée et visible |
| **Exception(s)** | • Données invalides<br>• Boutique déjà existante |
| **Post-conditions** | Boutique créée et associée au vendeur |

### Cas d'utilisation 18 : Créer un produit (Vendeur)

| Élément | Description |
|---------|-------------|
| **Titre** | Créer un nouveau produit |
| **Intention** | Permettre au vendeur d'ajouter un produit à son catalogue |
| **Acteurs** | Vendeur |
| **Pré-conditions** | Vendeur authentifié et approuvé |
| **Commence quand** | Le vendeur clique sur "Nouveau produit" |
| **Enchaînements** | 1. Le système affiche le formulaire de création<br>2. Le vendeur saisit le nom du produit<br>3. Le vendeur saisit la description détaillée<br>4. Le vendeur définit le prix<br>5. Le vendeur sélectionne la catégorie<br>6. Le vendeur définit la quantité en stock<br>7. Le vendeur uploade les images<br>8. Le système crée le produit |
| **Finit quand** | Le produit est créé et visible dans le catalogue |
| **Exception(s)** | • Données invalides<br>• Images trop volumineuses |
| **Post-conditions** | Produit créé et associé au vendeur |

### Cas d'utilisation 19 : Modifier un produit (Vendeur)

| Élément | Description |
|---------|-------------|
| **Titre** | Modifier un produit existant |
| **Intention** | Permettre au vendeur de mettre à jour les informations d'un produit |
| **Acteurs** | Vendeur |
| **Pré-conditions** | Vendeur authentifié, produit lui appartenant |
| **Commence quand** | Le vendeur clique sur "Modifier" sur un produit |
| **Enchaînements** | 1. Le système affiche le formulaire pré-rempli<br>2. Le vendeur modifie les champs souhaités<br>3. Le vendeur peut changer les images<br>4. Le vendeur soumet les modifications<br>5. Le système met à jour le produit |
| **Finit quand** | Le produit est mis à jour |
| **Exception(s)** | • Données invalides<br>• Produit non trouvé |
| **Post-conditions** | Produit mis à jour dans le catalogue |

### Cas d'utilisation 20 : Gérer les commandes (Vendeur)

| Élément | Description |
|---------|-------------|
| **Titre** | Gérer les commandes reçues |
| **Intention** | Permettre au vendeur de traiter ses commandes |
| **Acteurs** | Vendeur |
| **Pré-conditions** | Vendeur authentifié et approuvé |
| **Commence quand** | Le vendeur accède à "Mes commandes" |
| **Enchaînements** | 1. Le système affiche la liste des commandes<br>2. Le vendeur peut filtrer par statut<br>3. Le vendeur consulte les détails d'une commande<br>4. Le vendeur met à jour le statut (Confirmé → Expédié → Livré)<br>5. Le système notifie le client du changement |
| **Finit quand** | Le statut de la commande est mis à jour |
| **Exception(s)** | • Commande déjà annulée |
| **Post-conditions** | Statut mis à jour, client notifié |

### Cas d'utilisation 21 : Répondre aux avis (Vendeur)

| Élément | Description |
|---------|-------------|
| **Titre** | Répondre aux avis des clients |
| **Intention** | Permettre au vendeur de répondre aux commentaires |
| **Acteurs** | Vendeur |
| **Pré-conditions** | Vendeur authentifié, avis existant sur ses produits |
| **Commence quand** | Le vendeur accède à "Avis reçus" |
| **Enchaînements** | 1. Le système affiche les avis sur ses produits<br>2. Le vendeur sélectionne un avis<br>3. Le vendeur rédige sa réponse<br>4. Le vendeur soumet la réponse<br>5. La réponse est affichée sous l'avis |
| **Finit quand** | La réponse est publiée |
| **Exception(s)** | • Réponse déjà existante |
| **Post-conditions** | Réponse visible sous l'avis client |

### Cas d'utilisation 22 : Consulter le tableau de bord (Vendeur)

| Élément | Description |
|---------|-------------|
| **Titre** | Consulter le tableau de bord vendeur |
| **Intention** | Visualiser les statistiques et performances |
| **Acteurs** | Vendeur |
| **Pré-conditions** | Vendeur authentifié et approuvé |
| **Commence quand** | Le vendeur accède à son tableau de bord |
| **Enchaînements** | 1. Le système calcule les statistiques<br>2. Affichage du nombre total de commandes<br>3. Affichage du chiffre d'affaires<br>4. Affichage du nombre de produits<br>5. Affichage des commandes récentes<br>6. Graphiques de tendances |
| **Finit quand** | Le tableau de bord est affiché |
| **Exception(s)** | • Données insuffisantes |
| **Post-conditions** | Vision synthétique des performances |

### Cas d'utilisation 23 : Gérer les utilisateurs (Admin)

| Élément | Description |
|---------|-------------|
| **Titre** | Gérer les utilisateurs |
| **Intention** | Permettre à l'admin de superviser les comptes |
| **Acteurs** | Administrateur |
| **Pré-conditions** | Admin authentifié |
| **Commence quand** | L'admin accède à "Gestion des utilisateurs" |
| **Enchaînements** | 1. Le système affiche la liste des utilisateurs<br>2. L'admin peut rechercher par nom ou email<br>3. L'admin peut modifier le rôle d'un utilisateur<br>4. L'admin peut supprimer un utilisateur<br>5. Le système met à jour les données |
| **Finit quand** | Les modifications sont enregistrées |
| **Exception(s)** | • Auto-suppression interdite<br>• Auto-modification du rôle interdite |
| **Post-conditions** | Liste des utilisateurs mise à jour |

### Cas d'utilisation 24 : Approuver une demande vendeur (Admin)

| Élément | Description |
|---------|-------------|
| **Titre** | Approuver une demande de compte vendeur |
| **Intention** | Permettre à l'admin de valider un nouveau vendeur |
| **Acteurs** | Administrateur |
| **Pré-conditions** | Admin authentifié, demande en attente |
| **Commence quand** | L'admin accède aux demandes vendeurs |
| **Enchaînements** | 1. Le système affiche les demandes en attente<br>2. L'admin consulte les détails d'une demande<br>3. L'admin vérifie les informations et documents<br>4. L'admin clique sur "Approuver"<br>5. Le système change le statut en "approved"<br>6. Le système change le rôle en "seller"<br>7. Email de confirmation envoyé au vendeur |
| **Finit quand** | Le vendeur est approuvé |
| **Exception(s)** | • Documents invalides |
| **Post-conditions** | Vendeur approuvé, peut créer sa boutique |

### Cas d'utilisation 25 : Refuser une demande vendeur (Admin)

| Élément | Description |
|---------|-------------|
| **Titre** | Refuser une demande de compte vendeur |
| **Intention** | Permettre à l'admin de rejeter une demande |
| **Acteurs** | Administrateur |
| **Pré-conditions** | Admin authentifié, demande en attente |
| **Commence quand** | L'admin examine une demande |
| **Enchaînements** | 1. L'admin consulte les détails de la demande<br>2. L'admin clique sur "Refuser"<br>3. L'admin saisit le motif du refus<br>4. Le système change le statut en "rejected"<br>5. Email de refus envoyé avec le motif |
| **Finit quand** | La demande est refusée |
| **Exception(s)** | • Motif non fourni |
| **Post-conditions** | Demande refusée, utilisateur informé |

### Cas d'utilisation 26 : Consulter les statistiques (Admin)

| Élément | Description |
|---------|-------------|
| **Titre** | Consulter les statistiques globales |
| **Intention** | Visualiser les métriques de la plateforme |
| **Acteurs** | Administrateur |
| **Pré-conditions** | Admin authentifié |
| **Commence quand** | L'admin accède au tableau de bord admin |
| **Enchaînements** | 1. Le système calcule les statistiques globales<br>2. Affichage du nombre total d'utilisateurs<br>3. Affichage du nombre de vendeurs<br>4. Affichage du nombre de produits<br>5. Affichage du nombre de commandes<br>6. Graphiques et tendances |
| **Finit quand** | Les statistiques sont affichées |
| **Exception(s)** | • Données insuffisantes |
| **Post-conditions** | Vision globale de la plateforme |

### Cas d'utilisation 27 : Recevoir des notifications

| Élément | Description |
|---------|-------------|
| **Titre** | Recevoir des notifications |
| **Intention** | Informer l'utilisateur des événements importants |
| **Acteurs** | Client, Vendeur, Administrateur |
| **Pré-conditions** | Utilisateur authentifié |
| **Commence quand** | Un événement déclencheur se produit |
| **Enchaînements** | 1. Le système détecte l'événement (nouvelle commande, message, etc.)<br>2. Le système crée une notification<br>3. Le compteur de notifications est mis à jour<br>4. L'utilisateur voit l'indicateur dans la navbar<br>5. L'utilisateur peut cliquer pour voir les détails |
| **Finit quand** | La notification est créée et visible |
| **Exception(s)** | • Utilisateur déconnecté |
| **Post-conditions** | Notification enregistrée et affichée |

### Cas d'utilisation 28 : Consulter les notifications

| Élément | Description |
|---------|-------------|
| **Titre** | Consulter les notifications |
| **Intention** | Permettre de voir toutes les notifications reçues |
| **Acteurs** | Client, Vendeur, Administrateur |
| **Pré-conditions** | Utilisateur authentifié |
| **Commence quand** | L'utilisateur clique sur l'icône de notification |
| **Enchaînements** | 1. Le système affiche la liste des notifications<br>2. Les notifications non lues sont mises en évidence<br>3. L'utilisateur peut cliquer pour voir les détails<br>4. L'utilisateur peut marquer comme lu |
| **Finit quand** | Les notifications sont consultées |
| **Exception(s)** | • Aucune notification |
| **Post-conditions** | Notifications marquées comme lues |

### Cas d'utilisation 29 : Répondre aux messages (Vendeur)

| Élément | Description |
|---------|-------------|
| **Titre** | Répondre aux messages des clients |
| **Intention** | Permettre au vendeur de communiquer avec ses clients |
| **Acteurs** | Vendeur |
| **Pré-conditions** | Vendeur authentifié, message reçu |
| **Commence quand** | Le vendeur accède à ses messages |
| **Enchaînements** | 1. Le système affiche les conversations<br>2. Le vendeur sélectionne une conversation<br>3. Le vendeur lit les messages du client<br>4. Le vendeur rédige sa réponse<br>5. Le vendeur envoie le message<br>6. Le client est notifié |
| **Finit quand** | La réponse est envoyée |
| **Exception(s)** | • Message vide |
| **Post-conditions** | Message envoyé, client notifié |

### Cas d'utilisation 30 : Uploader des images

| Élément | Description |
|---------|-------------|
| **Titre** | Uploader des images |
| **Intention** | Permettre d'ajouter des images aux produits ou boutiques |
| **Acteurs** | Vendeur |
| **Pré-conditions** | Vendeur authentifié |
| **Commence quand** | Le vendeur clique sur "Ajouter une image" |
| **Enchaînements** | 1. Le système ouvre le sélecteur de fichiers<br>2. Le vendeur sélectionne une image<br>3. Le système valide le format (jpg, png, webp)<br>4. Le système valide la taille (max 5MB)<br>5. Le système uploade l'image sur le serveur<br>6. L'URL de l'image est enregistrée |
| **Finit quand** | L'image est uploadée avec succès |
| **Exception(s)** | • Format non supporté<br>• Taille trop grande |
| **Post-conditions** | Image stockée et URL disponible |

## IV. Conclusion

Dans ce chapitre, nous avons décrit le système **Makiti Marketplace** en détaillant les différents besoins fonctionnels et non fonctionnels identifiés à partir de l'analyse des processus e-commerce et des attentes des utilisateurs.

Cette étude nous a permis de définir les fonctionnalités essentielles qui seront intégrées dans l'application, notamment :
- La gestion complète des utilisateurs avec quatre rôles distincts
- Le catalogue de produits avec recherche et filtrage avancés
- Le système de panier et de commandes avec choix du mode de livraison
- La messagerie intégrée entre clients et vendeurs
- Le système d'avis et de notes avec réponses des vendeurs
- Les tableaux de bord analytiques pour vendeurs et administrateurs
- Le système de notifications automatiques

Ces éléments seront approfondis dans le prochain chapitre, consacré à la conception du système et à l'architecture technique de l'application.
