# INSTITUT TECCART

# Rapport de stage de fin d'étude

**Présenté en vue de l'obtention de l'attestation d'études collégiales (AEC)**

## TECHNIQUE DE L'INFORMATIQUE

---

### PAR

# TRAORE ABDOULAYE

---

## Développement d'une plateforme e-commerce multi-vendeurs : Makiti Marketplace

---

| | |
|---|---|
| **Encadrant à l'institut:** | M. Safouen Bani |
| **Session:** | Automne |
| **Année:** | 2025 |

---

# REMERCIEMENTS

Je tiens à exprimer ma profonde gratitude à toute l'équipe pédagogique de l'Institut Teccart pour la qualité de l'enseignement et le soutien apporté tout au long de mon parcours académique.

Je remercie particulièrement mon encadrant, M. Safouen Bani, pour ses conseils avisés, sa disponibilité et son accompagnement durant la réalisation de ce projet de fin d'études. Son expertise technique m'a permis de surmonter les défis rencontrés et d'atteindre les objectifs fixés.

Mes remerciements vont également à ma famille et à mes proches pour leur encouragement constant et leur soutien moral inébranlable.

---

# Table des matières

| Chapitre | Page |
|----------|------|
| **Chapitre I : ÉTUDE DE L'EXISTANT** | 4 |
| I. Introduction | 4 |
| II. Contexte et analyse critique de la situation | 4 |
| III. Justification et introduction au projet | 5 |
| IV. Méthodes et paramètres de programmation | 6 |
| V. Conclusion | 7 |
| **Chapitre II : Analyse et Spécification des Besoins** | 8 |
| I. Introduction | 8 |
| II. Étude des besoins | 8 |
| III. Cas d'utilisation | 13 |
| IV. Conclusion | 43 |
| **Chapitre III : Étude conceptuelle** | 44 |
| I. Introduction | 44 |
| II. Architecture Générale du système | 44 |
| III. Conception de base de données | 45 |
| IV. Conclusion | 46 |
| **Chapitre IV : RÉSUMÉ ET DÉTAILS DES SPRINTS DU PROJET** | 47 |
| I. SPRINT 1 | 47 |
| II. SPRINT 2 | 52 |
| III. SPRINT 3 | 58 |
| **Chapitre V : CONCLUSION GÉNÉRALE** | 63 |

---

# Chapitre I : ÉTUDE DE L'EXISTANT

## I. Introduction

Ce chapitre occupe une place essentielle dans la compréhension globale du projet, car il établit les bases nécessaires pour saisir ses objectifs et sa pertinence. Il permet de replacer l'application **Makiti Marketplace** dans son environnement, en identifiant les enjeux, les besoins et les limites des solutions déjà existantes sur le marché du commerce électronique.

À travers cette section, nous présenterons le contexte critique et la justification du projet, en expliquant pourquoi une telle solution s'avère indispensable. Nous procéderons également à une analyse critique de ce qui était en place avant son développement, afin de mettre en lumière les améliorations visées.

Ce chapitre introduira ensuite le projet dans ses grandes lignes, tout en détaillant les méthodes et paramètres de programmation retenus pour assurer son bon fonctionnement et sa pertinence technique.

## II. Contexte et analyse critique de la situation

Le commerce électronique connaît une croissance exponentielle à l'échelle mondiale, et de plus en plus de petits commerçants, artisans et entrepreneurs souhaitent vendre leurs produits en ligne. Cependant, les solutions existantes présentent plusieurs limitations qui freinent leur adoption, particulièrement pour les petits vendeurs et les marchés de niche.

Dans la réalité, on observe que la mise en place d'une boutique en ligne repose souvent sur des plateformes coûteuses ou des outils techniques complexes. Ces méthodes, bien qu'efficaces pour les grandes entreprises, présentent de sérieuses limites en termes d'accessibilité, de coût et de flexibilité pour les petits commerçants.

**Un problème récurrent réside dans les coûts élevés des plateformes existantes.** Les grandes plateformes comme Amazon, Shopify ou WooCommerce imposent souvent des frais d'abonnement mensuels élevés, des commissions importantes sur chaque vente (parfois jusqu'à 15-20%), ou nécessitent l'achat d'extensions payantes pour des fonctionnalités de base. Ces coûts constituent une barrière significative pour les petits commerçants qui débutent leur activité en ligne avec des marges réduites.

**La complexité technique constitue également un frein majeur.** La mise en place d'une boutique en ligne sur des plateformes comme WooCommerce ou PrestaShop nécessite des connaissances techniques en hébergement web, configuration de serveurs, gestion de bases de données et maintenance. Beaucoup de vendeurs potentiels abandonnent face à cette complexité ou doivent investir dans des services de développement coûteux.

**Le manque de communication directe entre clients et vendeurs** est un autre point faible des solutions existantes. Sur de nombreuses plateformes, la communication directe entre acheteurs et vendeurs est restreinte ou inexistante. Les clients ne peuvent pas poser de questions détaillées sur les produits avant l'achat, négocier les prix ou demander des personnalisations. Cette limitation génère de la méfiance et réduit les taux de conversion.

**L'absence de flexibilité dans les modes de livraison** pose également problème. La plupart des plateformes imposent uniquement la livraison à domicile, sans offrir l'option de retrait en magasin (pickup). Cette option est pourtant très appréciée par de nombreux clients souhaitant économiser sur les frais de livraison ou récupérer rapidement leurs achats.

**Enfin, les processus de validation des vendeurs sont souvent inadaptés.** Certaines plateformes permettent à n'importe qui de vendre sans vérification, ce qui peut entraîner des problèmes de qualité, de fraude et de confiance. À l'inverse, d'autres plateformes ont des processus de validation trop longs et complexes qui découragent les vendeurs légitimes.

Dans ce contexte, il est clair que les solutions existantes, bien que fonctionnelles pour les grandes entreprises disposant de ressources importantes, ne répondent pas efficacement aux besoins des petits vendeurs et des marchés de niche qui recherchent une solution accessible, abordable et complète.

## III. Justification et introduction au projet

Face aux nombreuses limites identifiées dans les solutions e-commerce existantes, le projet **Makiti Marketplace** se positionne comme une réponse technologique adaptée et innovante. Son objectif premier est de proposer une plateforme de commerce électronique multi-vendeurs accessible, intuitive et complète, permettant aux petits commerçants de vendre en ligne sans barrières techniques ou financières.

Face à ces lacunes, **Makiti Marketplace** a été conçue comme une application web responsive, robuste et intuitive, permettant de gérer le cycle de vie complet d'une transaction commerciale, de la découverte du produit jusqu'à la livraison. En intégrant des fonctionnalités de communication directe et de suivi en temps réel, l'application assure une expérience utilisateur optimale tant pour les acheteurs que pour les vendeurs.

L'objectif est de fournir un espace de travail digital et interconnecté, facilitant :
- La création et gestion de boutiques en ligne sans compétences techniques
- La communication directe entre clients et vendeurs via une messagerie intégrée
- Le choix flexible entre livraison à domicile et retrait en magasin
- Le suivi précis des commandes et des stocks
- La réception d'alertes automatiques et de notifications

Cette solution vise à démocratiser l'accès au commerce électronique, réduire les barrières à l'entrée pour les nouveaux vendeurs, et renforcer la confiance entre acheteurs et vendeurs grâce à un système de validation et d'avis.

Dans ce projet, la distinction des rôles est pleinement implémentée, garantissant que chaque acteur (Client, Vendeur, Administrateur) accède aux outils adaptés à ses fonctions :

| Rôle | Fonctionnalités principales |
|------|----------------------------|
| **Client** | Parcourir produits, acheter, laisser avis, contacter vendeurs |
| **Vendeur** | Gérer boutique, produits, commandes, répondre aux avis |
| **Administrateur** | Gérer utilisateurs, approuver vendeurs, superviser plateforme |

Par ailleurs, **Makiti Marketplace** centralise toutes les informations dans une base de données MongoDB sécurisée, assurant la cohérence des données et facilitant la génération de tableaux de bord analytiques. Cette interconnexion numérique fluidifie la communication et accélère la prise de décision.

En résumé, **Makiti Marketplace** est une solution pragmatique et performante, qui modernise l'accès au commerce électronique grâce à l'automatisation des processus, à la centralisation des données et à une interface conviviale. Ce projet constitue un levier stratégique pour permettre aux petits commerçants de développer leur activité en ligne.

## IV. Méthodes et paramètres de programmation

Pour assurer la réussite et la qualité du développement de l'application **Makiti Marketplace**, j'ai choisi d'adopter la **méthode Agile**, une approche itérative et collaborative qui favorise l'adaptabilité et la réactivité face aux besoins évolutifs du projet.

Cette méthode m'a permis de planifier le travail en cycles courts (sprints), durant lesquels des fonctionnalités précises (authentification, puis catalogue, puis panier/commandes, puis espace vendeur) étaient développées, testées et validées avant de passer à la phase suivante.

Sur le plan technologique, **Makiti Marketplace** est une application web full-stack, conçue pour être accessible depuis n'importe quel navigateur moderne sur ordinateur, tablette ou smartphone.

### Architecture Frontend

| Technologie | Version | Utilisation |
|-------------|---------|-------------|
| **React** | 18.x | Framework JavaScript pour l'interface utilisateur |
| **Redux Toolkit** | 2.x | Gestion de l'état global de l'application |
| **React Router** | 6.x | Navigation et routage entre les pages |
| **Chakra UI** | 2.x | Bibliothèque de composants UI modernes |
| **Axios** | 1.x | Client HTTP pour les appels API |
| **Framer Motion** | 11.x | Animations fluides et transitions |
| **Recharts** | 3.x | Graphiques et visualisations de données |

Ce choix s'est imposé pour la réactivité de React, sa communauté active et sa capacité à créer des interfaces utilisateur performantes. Chakra UI garantit une interface responsive, moderne et ergonomique, adaptée aux différents écrans, avec support natif du mode clair/sombre.

### Architecture Backend

| Technologie | Version | Utilisation |
|-------------|---------|-------------|
| **FastAPI** | 0.100+ | Framework Python moderne pour les API REST |
| **MongoDB** | 6.x | Base de données NoSQL flexible |
| **Motor** | 3.x | Driver MongoDB asynchrone pour Python |
| **JWT (python-jose)** | 3.x | Authentification sécurisée par tokens |
| **Pydantic** | 2.x | Validation et sérialisation des données |
| **Uvicorn** | 0.21+ | Serveur ASGI haute performance |
| **Passlib/Bcrypt** | 1.7+ | Hachage sécurisé des mots de passe |

FastAPI a été sélectionné pour sa rapidité de développement, sa documentation automatique (Swagger/OpenAPI), et ses performances exceptionnelles grâce à l'asynchronisme natif. MongoDB offre une flexibilité idéale pour un projet e-commerce où les structures de données peuvent évoluer.

### Sécurité

En termes de sécurité, l'application intègre un système d'authentification robuste :
- **Hachage des mots de passe** avec Bcrypt (coût 12)
- **Tokens JWT** avec expiration configurable (24h par défaut)
- **Validation des données** côté serveur avec Pydantic
- **Protection CORS** configurée pour le frontend
- **Gestion des rôles** et permissions strictes

### Bonnes pratiques

Enfin, tout au long du développement, j'ai veillé à respecter les bonnes pratiques de programmation :
- **Architecture modulaire** : séparation claire des responsabilités (pages, composants, store, API)
- **Code commenté** : documentation en français pour faciliter la maintenance
- **Composants réutilisables** : factorisation du code frontend
- **Gestion d'erreurs** : messages clairs et informatifs pour l'utilisateur

Cette rigueur assure un produit final stable, performant et prêt à être déployé.

## V. Conclusion

En conclusion, ce premier chapitre a permis de poser les fondations nécessaires à la compréhension du projet **Makiti Marketplace**. L'analyse critique du contexte a mis en lumière les faiblesses des solutions e-commerce existantes pour les petits vendeurs, soulignant le besoin d'une plateforme accessible, abordable et complète.

**Makiti Marketplace** s'est alors imposée comme une réponse innovante, alliant la puissance de React et FastAPI à une interface web moderne, pour offrir une expérience utilisateur optimale tant pour les clients que pour les vendeurs.

La démarche Agile et les choix technologiques robustes garantissent la fiabilité et l'évolutivité de la solution. Ainsi, ce chapitre prépare le terrain pour les étapes suivantes du rapport, où nous détaillerons l'analyse fonctionnelle approfondie et la conception technique du système.
