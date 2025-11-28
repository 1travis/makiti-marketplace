/**
 * ============================================================================
 * NAVBAR.JSX - BARRE DE NAVIGATION PRINCIPALE
 * ============================================================================
 * Ce composant affiche la barre de navigation en haut de l'application.
 * Il s'adapte selon le rôle de l'utilisateur (client, vendeur, admin)
 * et affiche les liens et fonctionnalités appropriés.
 * 
 * Fonctionnalités :
 * - Logo et navigation vers l'accueil
 * - Liens vers les produits
 * - Panier (clients)
 * - Favoris (clients)
 * - Messages
 * - Notifications
 * - Menu utilisateur (profil, déconnexion)
 * - Bouton mode clair/sombre
 * ============================================================================
 */

// ==================== IMPORTS ====================

// Hooks Redux pour accéder au store et dispatcher des actions
import { useDispatch, useSelector } from 'react-redux';

// Hooks de navigation React Router
import { useNavigate, Link as RouterLink } from 'react-router-dom';

// Action de déconnexion
import { logout } from '../store/slices/authSlice';

// Composants Chakra UI
import {
  Box,              // Conteneur de base
  Flex,             // Conteneur flexible
  Button,           // Bouton
  Text,             // Texte
  HStack,           // Stack horizontal
  Avatar,           // Avatar utilisateur
  Menu,             // Menu déroulant
  MenuButton,       // Bouton du menu
  MenuList,         // Liste du menu
  MenuItem,         // Élément du menu
  MenuDivider,      // Séparateur du menu
  Badge,            // Badge (compteur)
  Container,        // Conteneur centré
  IconButton,       // Bouton avec icône
  useColorMode,     // Hook pour le mode clair/sombre
  useColorModeValue, // Hook pour les couleurs adaptatives
  Tooltip,          // Info-bulle
} from '@chakra-ui/react';

// Icônes Chakra UI
import { ChevronDownIcon, MoonIcon, SunIcon } from '@chakra-ui/icons';

// Icônes React Icons (Feather)
import { FiHeart, FiPackage, FiMessageSquare } from 'react-icons/fi';

// Hooks React
import { useState, useEffect } from 'react';

// Instance Axios pour les appels API
import api from '../api/axios';

// Composant de notification
import NotificationBell from './NotificationBell';

// ==================== COMPOSANT PRINCIPAL ====================

/**
 * Navbar - Barre de navigation principale
 * Affiche les liens et fonctionnalités selon le rôle de l'utilisateur
 */
const Navbar = () => {
  // ==================== HOOKS ====================
  
  // Hook pour dispatcher des actions Redux
  const dispatch = useDispatch();
  
  // Hook pour la navigation programmatique
  const navigate = useNavigate();
  
  // Récupère l'utilisateur et l'état d'authentification depuis Redux
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  // ==================== ÉTATS LOCAUX ====================
  
  // Nombre d'articles dans le panier
  const [cartCount, setCartCount] = useState(0);
  
  // Nombre d'articles dans les favoris
  const [wishlistCount, setWishlistCount] = useState(0);
  
  // Nombre de messages non lus
  const [unreadMessages, setUnreadMessages] = useState(0);
  
  // ==================== MODE CLAIR/SOMBRE ====================
  
  // Hook pour basculer entre mode clair et sombre
  const { colorMode, toggleColorMode } = useColorMode();
  
  // Couleurs adaptatives selon le mode
  const bgColor = useColorModeValue('blue.600', 'blue.800');   // Fond de la navbar
  const hoverBg = useColorModeValue('blue.500', 'blue.700');   // Fond au survol

  // ==================== EFFET POUR CHARGER LES COMPTEURS ====================

  /**
   * Effet exécuté au montage et quand l'authentification change
   * Charge les compteurs du panier, favoris et messages
   */
  useEffect(() => {
    /**
     * Récupère le nombre d'articles dans le panier
     * Uniquement pour les clients authentifiés
     */
    const fetchCartCount = async () => {
      if (isAuthenticated && user?.role === 'customer') {
        try {
          const response = await api.get('/cart');
          setCartCount(response.data.items?.length || 0);
        } catch (error) {
          console.log('Erreur panier:', error);
        }
      }
    };
    
    /**
     * Récupère le nombre d'articles dans les favoris
     * Stockés dans le localStorage
     */
    const fetchWishlistCount = () => {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setWishlistCount(wishlist.length);
    };

    /**
     * Récupère le nombre de messages non lus
     * Pour tous les utilisateurs authentifiés
     */
    const fetchUnreadMessages = async () => {
      if (isAuthenticated) {
        try {
          const response = await api.get('/conversations/unread/count');
          setUnreadMessages(response.data.unread_count || 0);
        } catch (error) {
          console.log('Erreur messages:', error);
        }
      }
    };
    
    fetchCartCount();
    fetchWishlistCount();
    fetchUnreadMessages();

    // Polling pour les messages non lus
    const messageInterval = setInterval(fetchUnreadMessages, 30000);
    
    // Écouter les changements du localStorage
    window.addEventListener('storage', fetchWishlistCount);
    return () => {
      window.removeEventListener('storage', fetchWishlistCount);
      clearInterval(messageInterval);
    };
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'red';
      case 'seller':
        return 'green';
      case 'customer':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrateur';
      case 'seller':
        return 'Vendeur';
      case 'customer':
        return 'Client';
      default:
        return role;
    }
  };

  // Navbar publique pour les utilisateurs non connectés
  if (!isAuthenticated) {
    return (
      <Box bg={bgColor} px={4} py={3} shadow="md">
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center">
            <Text
              as={RouterLink}
              to="/"
              fontSize="xl"
              fontWeight="bold"
              color="white"
              _hover={{ textDecoration: 'none' }}
            >
              🛒 Makiti
            </Text>
            <HStack spacing={4}>
              <Button
                as={RouterLink}
                to="/"
                variant="ghost"
                color="white"
                _hover={{ bg: hoverBg }}
                size="sm"
              >
                Accueil
              </Button>
              <Button
                as={RouterLink}
                to="/products"
                variant="ghost"
                color="white"
                _hover={{ bg: hoverBg }}
                size="sm"
              >
                Produits
              </Button>
              <Tooltip label={colorMode === 'light' ? 'Mode sombre' : 'Mode clair'}>
                <IconButton
                  icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                  variant="ghost"
                  color="white"
                  _hover={{ bg: hoverBg }}
                  onClick={toggleColorMode}
                  aria-label="Toggle color mode"
                  size="sm"
                />
              </Tooltip>
              <Button
                as={RouterLink}
                to="/login"
                variant="ghost"
                color="white"
                _hover={{ bg: hoverBg }}
                size="sm"
              >
                Connexion
              </Button>
              <Button
                as={RouterLink}
                to="/register"
                colorScheme="whiteAlpha"
                size="sm"
              >
                Inscription
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} px={4} py={3} shadow="md">
      <Container maxW="container.xl">
        <Flex justify="space-between" align="center">
          {/* Logo / Nom de l'application */}
          <Text
            as={RouterLink}
            to="/"
            fontSize="xl"
            fontWeight="bold"
            color="white"
            _hover={{ textDecoration: 'none' }}
          >
            🛒 Makiti
          </Text>

          {/* Navigation */}
          <HStack spacing={4}>
            <Button
              as={RouterLink}
              to="/"
              variant="ghost"
              color="white"
              _hover={{ bg: hoverBg }}
              size="sm"
            >
              Accueil
            </Button>

            <Button
              as={RouterLink}
              to="/products"
              variant="ghost"
              color="white"
              _hover={{ bg: hoverBg }}
              size="sm"
            >
              Produits
            </Button>

            {/* Boutons pour les clients */}
            {user?.role === 'customer' && (
              <>
                <Tooltip label="Mes favoris">
                  <Button
                    as={RouterLink}
                    to="/wishlist"
                    variant="ghost"
                    color="white"
                    _hover={{ bg: hoverBg }}
                    size="sm"
                    position="relative"
                  >
                    <FiHeart />
                    {wishlistCount > 0 && (
                      <Badge
                        colorScheme="pink"
                        borderRadius="full"
                        position="absolute"
                        top="-1"
                        right="-1"
                        fontSize="xs"
                      >
                        {wishlistCount}
                      </Badge>
                    )}
                  </Button>
                </Tooltip>
                <Tooltip label="Mes commandes">
                  <Button
                    as={RouterLink}
                    to="/orders"
                    variant="ghost"
                    color="white"
                    _hover={{ bg: hoverBg }}
                    size="sm"
                  >
                    <FiPackage />
                  </Button>
                </Tooltip>
                <Tooltip label="Messages">
                  <Button
                    as={RouterLink}
                    to="/messages"
                    variant="ghost"
                    color="white"
                    _hover={{ bg: hoverBg }}
                    size="sm"
                    position="relative"
                  >
                    <FiMessageSquare />
                    {unreadMessages > 0 && (
                      <Badge
                        colorScheme="red"
                        borderRadius="full"
                        position="absolute"
                        top="-1"
                        right="-1"
                        fontSize="xs"
                      >
                        {unreadMessages}
                      </Badge>
                    )}
                  </Button>
                </Tooltip>
                <Button
                  as={RouterLink}
                  to="/cart"
                  variant="ghost"
                  color="white"
                  _hover={{ bg: hoverBg }}
                  size="sm"
                  position="relative"
                >
                  🛒 Panier
                  {cartCount > 0 && (
                    <Badge
                      colorScheme="red"
                      borderRadius="full"
                      position="absolute"
                      top="-1"
                      right="-1"
                      fontSize="xs"
                    >
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </>
            )}

            {user?.role === 'seller' && (
              <>
                <Button
                  as={RouterLink}
                  to="/seller/request"
                  variant="ghost"
                  color="white"
                  _hover={{ bg: hoverBg }}
                  size="sm"
                >
                  Demande Vendeur
                  {user?.seller_approval_status === 'pending' && (
                    <Badge ml={2} colorScheme="yellow" fontSize="xs">En attente</Badge>
                  )}
                  {user?.seller_approval_status === 'approved' && (
                    <Badge ml={2} colorScheme="green" fontSize="xs">Approuvé</Badge>
                  )}
                </Button>
                {user?.seller_approval_status === 'approved' && (
                  <>
                    <Button
                      as={RouterLink}
                      to="/seller/dashboard"
                      variant="ghost"
                      color="white"
                      _hover={{ bg: hoverBg }}
                      size="sm"
                    >
                      Ma Boutique
                    </Button>
                    <Button
                      as={RouterLink}
                      to="/seller/products/new"
                      variant="ghost"
                      color="white"
                      _hover={{ bg: hoverBg }}
                      size="sm"
                    >
                      + Produit
                    </Button>
                    <Button
                      as={RouterLink}
                      to="/seller/orders"
                      variant="ghost"
                      color="white"
                      _hover={{ bg: hoverBg }}
                      size="sm"
                    >
                      📦 Commandes
                    </Button>
                    <Button
                      as={RouterLink}
                      to="/seller/reviews"
                      variant="ghost"
                      color="white"
                      _hover={{ bg: hoverBg }}
                      size="sm"
                    >
                      ⭐ Avis
                    </Button>
                    <Button
                      as={RouterLink}
                      to="/seller/analytics"
                      variant="ghost"
                      color="white"
                      _hover={{ bg: hoverBg }}
                      size="sm"
                    >
                      Analytics
                    </Button>
                    <Tooltip label="Messages">
                      <Button
                        as={RouterLink}
                        to="/messages"
                        variant="ghost"
                        color="white"
                        _hover={{ bg: hoverBg }}
                        size="sm"
                        position="relative"
                      >
                        <FiMessageSquare />
                        {unreadMessages > 0 && (
                          <Badge
                            colorScheme="red"
                            borderRadius="full"
                            position="absolute"
                            top="-1"
                            right="-1"
                            fontSize="xs"
                          >
                            {unreadMessages}
                          </Badge>
                        )}
                      </Button>
                    </Tooltip>
                  </>
                )}
              </>
            )}

            {user?.role === 'admin' && (
              <>
                <Button
                  as={RouterLink}
                  to="/admin"
                  variant="ghost"
                  color="white"
                  _hover={{ bg: hoverBg }}
                  size="sm"
                >
                  Utilisateurs
                </Button>
                <Button
                  as={RouterLink}
                  to="/admin/seller-requests"
                  variant="ghost"
                  color="white"
                  _hover={{ bg: hoverBg }}
                  size="sm"
                >
                  Demandes Vendeurs
                </Button>
                <Button
                  as={RouterLink}
                  to="/admin/analytics"
                  variant="ghost"
                  color="white"
                  _hover={{ bg: hoverBg }}
                  size="sm"
                >
                  Analytics
                </Button>
              </>
            )}
          </HStack>

          {/* Notifications et Menu utilisateur */}
          <HStack spacing={2}>
            <Tooltip label={colorMode === 'light' ? 'Mode sombre' : 'Mode clair'}>
              <IconButton
                icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                variant="ghost"
                color="white"
                _hover={{ bg: hoverBg }}
                onClick={toggleColorMode}
                aria-label="Toggle color mode"
                size="sm"
              />
            </Tooltip>
            <NotificationBell />
            
            <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              variant="ghost"
              color="white"
              _hover={{ bg: hoverBg }}
              _active={{ bg: hoverBg }}
            >
              <HStack spacing={2}>
                <Avatar size="sm" name={user?.full_name} />
                <Text display={{ base: 'none', md: 'block' }}>
                  {user?.full_name || 'Utilisateur'}
                </Text>
              </HStack>
            </MenuButton>
            <MenuList>
              <Box px={4} py={2}>
                <Text fontWeight="bold">{user?.full_name}</Text>
                <Text fontSize="sm" color="gray.500">{user?.email}</Text>
                <Badge mt={1} colorScheme={getRoleBadgeColor(user?.role)}>
                  {getRoleLabel(user?.role)}
                </Badge>
              </Box>
              <MenuDivider />
              <MenuItem as={RouterLink} to="/profile">
                Mon Profil
              </MenuItem>
              <MenuDivider />
              <MenuItem onClick={handleLogout} color="red.500">
                Se déconnecter
              </MenuItem>
            </MenuList>
          </Menu>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

export default Navbar;
