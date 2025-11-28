/**
 * ============================================================================
 * APP.JS - COMPOSANT PRINCIPAL DE L'APPLICATION
 * ============================================================================
 * Ce fichier est le point d'entrée principal de l'application React.
 * Il gère le routage (navigation entre les pages) et la structure globale.
 * ============================================================================
 */

// ==================== IMPORTS ====================

// Hook useEffect pour exécuter du code après le rendu du composant
import { useEffect } from 'react';

// Composants de routage React Router
// - Routes : Conteneur pour toutes les routes
// - Route : Définit une route individuelle
// - Navigate : Redirige vers une autre route
import { Routes, Route, Navigate } from 'react-router-dom';

// Hooks Redux pour accéder au store global
// - useSelector : Lire les données du store
// - useDispatch : Envoyer des actions au store
import { useSelector, useDispatch } from 'react-redux';

// Action pour récupérer les infos de l'utilisateur connecté
import { fetchCurrentUser } from './store/slices/authSlice';

// ==================== IMPORTS DES PAGES ====================

// Pages d'authentification
import LoginForm from './features/auth/LoginForm';           // Formulaire de connexion
import RegisterForm from './features/auth/RegisterForm';     // Formulaire d'inscription

// Pages publiques
import HomePage from './pages/HomePage';                     // Page d'accueil
import ProductsPage from './pages/ProductsPage';             // Liste des produits
import ProductDetailPage from './pages/ProductDetailPage';   // Détail d'un produit
import SellerPublicPage from './pages/SellerPublicPage';     // Profil public d'un vendeur

// Pages client (authentifié)
import ProfilePage from './pages/ProfilePage';               // Profil utilisateur
import CartPage from './pages/CartPage';                     // Panier d'achat
import CheckoutPage from './pages/CheckoutPage';             // Finalisation de commande
import WishlistPage from './pages/WishlistPage';             // Liste de souhaits
import OrderHistoryPage from './pages/OrderHistoryPage';     // Historique des commandes
import MessagesPage from './pages/MessagesPage';             // Messagerie

// Pages vendeur
import SellerHomePage from './pages/SellerHomePage';         // Accueil vendeur
import CreateShopPage from './pages/CreateShopPage';         // Création de boutique
import SellerRequestPage from './pages/SellerRequestPage';   // Demande de compte vendeur
import SellerDashboard from './pages/SellerDashboard';       // Tableau de bord vendeur
import SellerAnalytics from './pages/SellerAnalytics';       // Statistiques vendeur
import CreateProductPage from './pages/CreateProductPage';   // Création de produit
import EditProductPage from './pages/EditProductPage';       // Modification de produit
import SellerOrdersPage from './pages/SellerOrdersPage';     // Commandes du vendeur
import SellerReviewsPage from './pages/SellerReviewsPage';   // Avis reçus par le vendeur

// Pages administrateur
import AdminDashboard from './pages/AdminDashboard';         // Tableau de bord admin
import AdminSellerRequests from './pages/AdminSellerRequests'; // Gestion des demandes vendeur
import AdminAnalytics from './pages/AdminAnalytics';         // Statistiques admin

// Composants partagés
import Navbar from './components/Navbar';                    // Barre de navigation

// Composants Chakra UI pour le style
import { Box, useColorModeValue } from '@chakra-ui/react';

// ==================== COMPOSANT DE REDIRECTION ====================

/**
 * DashboardRedirect - Redirige l'utilisateur vers le bon tableau de bord
 * selon son rôle (vendeur, admin ou client)
 */
const DashboardRedirect = () => {
  // Récupère les infos de l'utilisateur depuis le store Redux
  const { user } = useSelector((state) => state.auth);
  
  // Redirection selon le rôle
  if (user?.role === 'seller') {
    // Si vendeur -> page d'accueil vendeur
    return <SellerHomePage />;
  } else if (user?.role === 'admin') {
    // Si admin -> tableau de bord admin
    return <Navigate to="/admin" />;
  }
  // Par défaut (client) -> page d'accueil
  return <HomePage />;
};

// ==================== COMPOSANT PRINCIPAL ====================

/**
 * App - Composant racine de l'application
 * Gère le routage et la structure globale
 */
function App() {
  // Hook pour envoyer des actions au store Redux
  const dispatch = useDispatch();
  
  // Récupère le token et l'utilisateur depuis le store Redux
  const { token, user } = useSelector((state) => state.auth);

  // ==================== EFFET AU CHARGEMENT ====================
  
  /**
   * Effet exécuté au montage du composant
   * Si un token existe mais pas d'utilisateur, on récupère ses infos
   * Cela permet de maintenir la session après un rafraîchissement de page
   */
  useEffect(() => {
    if (token && !user) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, token, user]);

  // ==================== STYLES ====================
  
  // Couleur de fond adaptative (clair/sombre)
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  // ==================== RENDU ====================
  
  return (
    <Box minH="100vh" bg={bgColor}>
      {/* Barre de navigation présente sur toutes les pages */}
      <Navbar />
      
      {/* Définition de toutes les routes de l'application */}
      <Routes>
        
        {/* ========== ROUTES PUBLIQUES ========== */}
        {/* Accessibles sans authentification */}
        
        <Route path="/" element={<HomePage />} />
        
        {/* Connexion - redirige vers dashboard si déjà connecté */}
        <Route path="/login" element={!token ? <LoginForm /> : <Navigate to="/dashboard" />} />
        
        {/* Inscription - redirige vers dashboard si déjà connecté */}
        <Route path="/register" element={!token ? <RegisterForm /> : <Navigate to="/dashboard" />} />
        
        {/* Catalogue de produits */}
        <Route path="/products" element={<ProductsPage />} />
        
        {/* Détail d'un produit (avec paramètre productId) */}
        <Route path="/products/:productId" element={<ProductDetailPage />} />
        
        {/* Profil public d'un vendeur (avec paramètre sellerId) */}
        <Route path="/seller/:sellerId" element={<SellerPublicPage />} />
        
        {/* ========== ROUTES AUTHENTIFIÉES ========== */}
        {/* Nécessitent une connexion, sinon redirection vers login */}
        
        {/* Dashboard - redirige selon le rôle */}
        <Route path="/dashboard" element={token ? <DashboardRedirect /> : <Navigate to="/login" />} />
        
        {/* Profil utilisateur */}
        <Route path="/profile" element={token ? <ProfilePage /> : <Navigate to="/login" />} />
        
        {/* Panier d'achat */}
        <Route path="/cart" element={token ? <CartPage /> : <Navigate to="/login" />} />
        
        {/* Page de paiement/checkout */}
        <Route path="/checkout" element={token ? <CheckoutPage /> : <Navigate to="/login" />} />
        
        {/* Liste de souhaits (favoris) */}
        <Route path="/wishlist" element={token ? <WishlistPage /> : <Navigate to="/login" />} />
        
        {/* Historique des commandes */}
        <Route path="/orders" element={token ? <OrderHistoryPage /> : <Navigate to="/login" />} />
        
        {/* Messagerie */}
        <Route path="/messages" element={token ? <MessagesPage /> : <Navigate to="/login" />} />
        
        {/* ========== ROUTES VENDEUR ========== */}
        {/* Réservées aux utilisateurs avec le rôle "seller" */}
        
        {/* Page d'accueil vendeur */}
        <Route path="/seller" element={token ? <SellerHomePage /> : <Navigate to="/login" />} />
        
        {/* Création d'une nouvelle boutique */}
        <Route path="/shops/new" element={token ? <CreateShopPage /> : <Navigate to="/login" />} />
        
        {/* Demande pour devenir vendeur */}
        <Route path="/seller/request" element={token ? <SellerRequestPage /> : <Navigate to="/login" />} />
        
        {/* Tableau de bord vendeur */}
        <Route path="/seller/dashboard" element={token ? <SellerDashboard /> : <Navigate to="/login" />} />
        
        {/* Création d'un nouveau produit */}
        <Route path="/seller/products/new" element={token ? <CreateProductPage /> : <Navigate to="/login" />} />
        
        {/* Modification d'un produit existant */}
        <Route path="/seller/products/:productId/edit" element={token ? <EditProductPage /> : <Navigate to="/login" />} />
        
        {/* Statistiques et analytics vendeur */}
        <Route path="/seller/analytics" element={token ? <SellerAnalytics /> : <Navigate to="/login" />} />
        
        {/* Gestion des commandes reçues */}
        <Route path="/seller/orders" element={token ? <SellerOrdersPage /> : <Navigate to="/login" />} />
        
        {/* Gestion des avis clients */}
        <Route path="/seller/reviews" element={token ? <SellerReviewsPage /> : <Navigate to="/login" />} />
        
        {/* ========== ROUTES ADMINISTRATEUR ========== */}
        {/* Réservées aux utilisateurs avec le rôle "admin" */}
        
        {/* Tableau de bord administrateur */}
        <Route path="/admin" element={token ? <AdminDashboard /> : <Navigate to="/login" />} />
        
        {/* Gestion des demandes de compte vendeur */}
        <Route path="/admin/seller-requests" element={token ? <AdminSellerRequests /> : <Navigate to="/login" />} />
        
        {/* Statistiques globales de la plateforme */}
        <Route path="/admin/analytics" element={token ? <AdminAnalytics /> : <Navigate to="/login" />} />
        
      </Routes>
    </Box>
  );
}

// Export du composant pour utilisation dans index.js
export default App;