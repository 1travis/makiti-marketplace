/**
 * ============================================================================
 * AXIOS.JS - CONFIGURATION DU CLIENT HTTP
 * ============================================================================
 * Ce fichier configure Axios pour communiquer avec l'API backend.
 * Il gère automatiquement l'authentification JWT et les erreurs.
 * ============================================================================
 */

import axios from 'axios';

// ==================== CRÉATION DE L'INSTANCE AXIOS ====================

/**
 * Création d'une instance Axios personnalisée
 * - baseURL : URL de base de l'API backend (FastAPI)
 * - headers : En-têtes par défaut pour toutes les requêtes
 */
const api = axios.create({
  baseURL: 'http://localhost:8000', // URL du serveur FastAPI
  headers: {
    'Content-Type': 'application/json', // Format JSON pour les données
  },
});

// ==================== INTERCEPTEUR DE REQUÊTES ====================

/**
 * Intercepteur exécuté AVANT chaque requête
 * Ajoute automatiquement le token JWT dans les en-têtes
 * pour authentifier l'utilisateur auprès de l'API
 */
api.interceptors.request.use(
  (config) => {
    // Récupère le token stocké dans le localStorage
    const token = localStorage.getItem('token');
    
    // Si un token existe, l'ajoute dans l'en-tête Authorization
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    // En cas d'erreur, rejette la promesse
    return Promise.reject(error);
  }
);

// ==================== INTERCEPTEUR DE RÉPONSES ====================

/**
 * Intercepteur exécuté APRÈS chaque réponse
 * Gère les erreurs d'authentification (401)
 * et redirige vers la page de connexion si nécessaire
 */
api.interceptors.response.use(
  // Si la réponse est OK, la retourne telle quelle
  (response) => response,
  
  // Si erreur, traitement spécial
  (error) => {
    // Liste des routes publiques (pas besoin d'authentification)
    const publicRoutes = ['/products', '/register', '/login'];
    
    // Vérifie si la route actuelle est publique
    const isPublicRoute = publicRoutes.some(route => 
      error.config?.url?.startsWith(route)
    );
    
    // Si erreur 401 (non authentifié) sur une route protégée
    if (error.response?.status === 401 && !isPublicRoute) {
      // Supprime le token invalide
      localStorage.removeItem('token');
      // Redirige vers la page de connexion
      window.location.href = '/login';
    }
    
    // Rejette l'erreur pour qu'elle soit gérée par le code appelant
    return Promise.reject(error);
  }
);

// Export de l'instance configurée
export default api;