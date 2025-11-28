/**
 * ============================================================================
 * STORE.JS - CONFIGURATION DU STORE REDUX
 * ============================================================================
 * Ce fichier configure le store Redux qui gère l'état global de l'application.
 * Redux permet de partager des données entre tous les composants sans
 * avoir à les passer via les props.
 * ============================================================================
 */

// configureStore : Fonction Redux Toolkit pour créer le store
import { configureStore } from '@reduxjs/toolkit';

// ==================== IMPORTS DES REDUCERS ====================

// Reducer d'authentification (gère token, utilisateur connecté)
import authReducer from './slices/authSlice';

// Reducer des boutiques (gère les données des boutiques)
import shopReducer from './shopSlice';

// Reducer admin (gère les données d'administration)
import adminReducer from './slices/adminSlice';

// Reducer vendeur (gère les données spécifiques aux vendeurs)
import sellerReducer from './slices/sellerSlice';

// Reducer produits (gère le catalogue de produits)
import productReducer from './slices/productSlice';

// ==================== CRÉATION DU STORE ====================

/**
 * Configuration du store Redux
 * Chaque reducer gère une partie de l'état global :
 * - auth : Authentification (token, user, isAuthenticated)
 * - shops : Boutiques
 * - admin : Données d'administration
 * - seller : Données vendeur
 * - products : Catalogue produits
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,       // state.auth
    shops: shopReducer,      // state.shops
    admin: adminReducer,     // state.admin
    seller: sellerReducer,   // state.seller
    products: productReducer, // state.products
  },
});