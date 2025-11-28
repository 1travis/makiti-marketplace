/**
 * ============================================================================
 * AUTHSLICE.JS - GESTION DE L'AUTHENTIFICATION REDUX
 * ============================================================================
 * Ce fichier gère tout l'état lié à l'authentification :
 * - Connexion (login)
 * - Inscription (register)
 * - Déconnexion (logout)
 * - Récupération du profil utilisateur
 * 
 * Il utilise Redux Toolkit avec createSlice et createAsyncThunk
 * pour gérer les actions asynchrones (appels API).
 * ============================================================================
 */

// createSlice : Crée un slice Redux avec reducers et actions
// createAsyncThunk : Crée des actions asynchrones (pour les appels API)
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Instance Axios configurée pour les appels API
import api from '../../api/axios';

// ==================== ACTIONS ASYNCHRONES (THUNKS) ====================

/**
 * login - Action de connexion
 * Envoie les identifiants au serveur et stocke le token JWT
 * 
 * @param {Object} credentials - { email, password }
 * @returns {Object} Données de connexion (token)
 */
export const login = createAsyncThunk(
  'auth/login', // Nom de l'action
  async (credentials, { rejectWithValue, dispatch }) => {
    try {
      // Prépare les données au format FormData (requis par OAuth2)
      const formData = new FormData();
      formData.append('username', credentials.email);
      formData.append('password', credentials.password);
      
      // Appel API de connexion
      const response = await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Stocke le token dans le localStorage pour persistance
      localStorage.setItem('token', response.data.access_token);
      
      // Récupère les informations complètes de l'utilisateur
      dispatch(fetchCurrentUser());
      
      return response.data;
    } catch (error) {
      // Gestion des erreurs de validation FastAPI
      const detail = error.response?.data?.detail;
      if (Array.isArray(detail)) {
        return rejectWithValue(detail.map(err => err.msg).join(', '));
      }
      return rejectWithValue(detail || 'Erreur de connexion');
    }
  }
);

/**
 * fetchCurrentUser - Récupère les infos de l'utilisateur connecté
 * Appelé après connexion ou au chargement de l'app si un token existe
 * 
 * @returns {Object} Données de l'utilisateur
 */
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      // Appel API pour récupérer le profil
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      const detail = error.response?.data?.detail;
      if (Array.isArray(detail)) {
        return rejectWithValue(detail.map(err => err.msg).join(', '));
      }
      return rejectWithValue(detail || 'Erreur lors de la récupération du profil');
    }
  }
);

/**
 * register - Action d'inscription
 * Crée un nouveau compte utilisateur
 * 
 * @param {Object} userData - { email, password, full_name, role }
 * @returns {Object} Données de l'utilisateur créé
 */
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      // Appel API d'inscription
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      const detail = error.response?.data?.detail;
      if (Array.isArray(detail)) {
        // Erreur de validation FastAPI - extraire les messages
        return rejectWithValue(detail.map(err => err.msg).join(', '));
      }
      return rejectWithValue(detail || "Erreur lors de l'inscription");
    }
  }
);

// ==================== ÉTAT INITIAL ====================

/**
 * État initial du slice auth
 * - user : Informations de l'utilisateur connecté (null si déconnecté)
 * - token : Token JWT (récupéré du localStorage au démarrage)
 * - isAuthenticated : Booléen indiquant si l'utilisateur est connecté
 * - loading : Indique si une action est en cours
 * - error : Message d'erreur éventuel
 */
const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// ==================== CRÉATION DU SLICE ====================

/**
 * Slice Redux pour l'authentification
 * Contient les reducers synchrones et gère les actions asynchrones
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  
  // ==================== REDUCERS SYNCHRONES ====================
  reducers: {
    /**
     * logout - Déconnexion de l'utilisateur
     * Supprime le token et réinitialise l'état
     */
    logout: (state) => {
      localStorage.removeItem('token');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    
    /**
     * clearError - Efface le message d'erreur
     * Utile pour réinitialiser l'état après affichage d'une erreur
     */
    clearError: (state) => {
      state.error = null;
    },
  },
  
  // ==================== GESTION DES ACTIONS ASYNCHRONES ====================
  extraReducers: (builder) => {
    // ========== LOGIN ==========
    builder
      // Connexion en cours
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Connexion réussie
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.access_token;
        state.user = action.payload.user;
      })
      // Connexion échouée
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // ========== REGISTER ==========
      // Inscription en cours
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Inscription réussie
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        // L'utilisateur doit se connecter après inscription
      })
      // Inscription échouée
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // ========== FETCH CURRENT USER ==========
      // Récupération du profil en cours
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      // Profil récupéré avec succès
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      // Échec de récupération du profil
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export des actions synchrones
export const { logout, clearError } = authSlice.actions;

// Export du reducer pour le store
export default authSlice.reducer;