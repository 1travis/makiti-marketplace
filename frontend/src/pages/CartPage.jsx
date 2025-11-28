/**
 * ============================================================================
 * CARTPAGE.JSX - PAGE DU PANIER D'ACHAT
 * ============================================================================
 * Cette page affiche le contenu du panier de l'utilisateur.
 * Elle permet de modifier les quantités, supprimer des articles
 * et passer à la commande.
 * ============================================================================
 */

// ==================== IMPORTS ====================

// Hooks React pour la gestion d'état et les effets
import { useState, useEffect } from 'react';

// Hook Redux pour accéder au store (récupérer le token)
import { useSelector } from 'react-redux';

// Hooks de navigation React Router
import { useNavigate, Link as RouterLink } from 'react-router-dom';

// Instance Axios configurée pour les appels API
import api from '../api/axios';

// Composants Chakra UI pour l'interface
import {
  Box,           // Conteneur de base
  Container,     // Conteneur centré avec largeur max
  Heading,       // Titre
  VStack,        // Stack vertical (éléments empilés)
  HStack,        // Stack horizontal (éléments côte à côte)
  Text,          // Texte
  Button,        // Bouton
  Image,         // Image
  IconButton,    // Bouton avec icône
  Divider,       // Ligne de séparation
  useToast,      // Hook pour les notifications toast
  Spinner,       // Indicateur de chargement
  Alert,         // Message d'alerte
  AlertIcon,     // Icône d'alerte
  Badge,         // Badge/étiquette
  Flex,          // Conteneur flexible
  NumberInput,   // Champ numérique
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';

// Icônes Chakra UI
import { DeleteIcon, ArrowBackIcon } from '@chakra-ui/icons';

// ==================== COMPOSANT PRINCIPAL ====================

/**
 * CartPage - Composant de la page panier
 * Affiche les articles du panier avec options de modification
 */
const CartPage = () => {
  // ==================== HOOKS ====================
  
  // Hook pour la navigation programmatique
  const navigate = useNavigate();
  
  // Hook pour afficher des notifications toast
  const toast = useToast();
  
  // Récupère le token d'authentification depuis Redux
  const { token } = useSelector((state) => state.auth);

  // ==================== ÉTATS LOCAUX ====================
  
  // État du panier (liste d'articles et total)
  const [cart, setCart] = useState({ items: [], total: 0 });
  
  // État de chargement initial
  const [loading, setLoading] = useState(true);
  
  // État de mise à jour (pour désactiver les boutons pendant une action)
  const [updating, setUpdating] = useState(false);

  // ==================== EFFET AU MONTAGE ====================
  
  /**
   * Effet exécuté au montage du composant
   * Vérifie l'authentification et charge le panier
   */
  useEffect(() => {
    // Si pas de token, redirige vers la connexion
    if (!token) {
      navigate('/login');
      return;
    }
    // Charge le contenu du panier
    fetchCart();
  }, [token, navigate]);

  // ==================== FONCTIONS API ====================

  /**
   * fetchCart - Récupère le contenu du panier depuis l'API
   */
  const fetchCart = async () => {
    try {
      setLoading(true);
      // Appel GET à l'endpoint /cart
      const response = await api.get('/cart');
      // Met à jour l'état avec les données reçues
      setCart(response.data);
    } catch (error) {
      // Affiche une notification d'erreur
      toast({
        title: 'Erreur',
        description: 'Impossible de charger le panier',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * updateQuantity - Met à jour la quantité d'un article
   * @param {string} productId - ID du produit à modifier
   * @param {number} newQuantity - Nouvelle quantité
   */
  const updateQuantity = async (productId, newQuantity) => {
    try {
      setUpdating(true);
      // Appel PUT à l'endpoint /cart/update
      await api.put('/cart/update', {
        product_id: productId,
        quantity: newQuantity,
      });
      // Recharge le panier pour avoir les données à jour
      await fetchCart();
      // Notification de succès
      toast({
        title: 'Panier mis à jour',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      // Notification d'erreur avec message du serveur si disponible
      toast({
        title: 'Erreur',
        description: error.response?.data?.detail || 'Impossible de mettre à jour',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUpdating(false);
    }
  };

  /**
   * removeItem - Supprime un article du panier
   * @param {string} productId - ID du produit à supprimer
   */
  const removeItem = async (productId) => {
    try {
      setUpdating(true);
      // Appel DELETE à l'endpoint /cart/remove/{productId}
      await api.delete(`/cart/remove/${productId}`);
      // Recharge le panier
      await fetchCart();
      // Notification de succès
      toast({
        title: 'Produit retiré',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de retirer le produit',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUpdating(false);
    }
  };

  /**
   * clearCart - Vide entièrement le panier
   */
  const clearCart = async () => {
    try {
      setUpdating(true);
      // Appel DELETE à l'endpoint /cart/clear
      await api.delete('/cart/clear');
      // Réinitialise l'état local
      setCart({ items: [], total: 0 });
      // Notification de succès
      toast({
        title: 'Panier vidé',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de vider le panier',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUpdating(false);
    }
  };

  // ==================== CALCULS ====================

  /**
   * Groupe les articles par vendeur
   * Utile pour afficher un message si plusieurs vendeurs
   */
  const groupedBySeller = cart.items.reduce((acc, item) => {
    const sellerId = item.product.seller_id;
    // Crée un tableau pour ce vendeur s'il n'existe pas
    if (!acc[sellerId]) {
      acc[sellerId] = [];
    }
    // Ajoute l'article au tableau du vendeur
    acc[sellerId].push(item);
    return acc;
  }, {});

  if (loading) {
    return (
      <Container maxW="container.lg" py={10}>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Chargement du panier...</Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.lg" py={6}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <HStack>
            <IconButton
              icon={<ArrowBackIcon />}
              variant="ghost"
              onClick={() => navigate('/products')}
              aria-label="Retour"
            />
            <Heading size="lg">Mon Panier</Heading>
            {cart.items.length > 0 && (
              <Badge colorScheme="blue" fontSize="md" px={2}>
                {cart.items.length} article{cart.items.length > 1 ? 's' : ''}
              </Badge>
            )}
          </HStack>
          {cart.items.length > 0 && (
            <Button
              variant="ghost"
              colorScheme="red"
              size="sm"
              onClick={clearCart}
              isLoading={updating}
            >
              Vider le panier
            </Button>
          )}
        </HStack>

        {cart.items.length === 0 ? (
          <Box bg="white" p={10} rounded="lg" shadow="md" textAlign="center">
            <VStack spacing={4}>
              <Text fontSize="xl" color="gray.500">
                Votre panier est vide
              </Text>
              <Text color="gray.400">
                Parcourez nos produits et ajoutez-les à votre panier
              </Text>
              <Button
                as={RouterLink}
                to="/products"
                colorScheme="blue"
                size="lg"
              >
                Voir les produits
              </Button>
            </VStack>
          </Box>
        ) : (
          <Flex gap={6} direction={{ base: 'column', lg: 'row' }}>
            {/* Liste des produits */}
            <Box flex={2}>
              <VStack spacing={4} align="stretch">
                {Object.keys(groupedBySeller).length > 1 && (
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    Votre panier contient des produits de {Object.keys(groupedBySeller).length} vendeurs différents
                  </Alert>
                )}

                {cart.items.map((item) => (
                  <Box
                    key={item.product_id}
                    bg="white"
                    p={4}
                    rounded="lg"
                    shadow="sm"
                    borderWidth={1}
                  >
                    <Flex gap={4} align="center">
                      {/* Image */}
                      <Image
                        src={item.product.images?.[0] || 'https://via.placeholder.com/100'}
                        alt={item.product.name}
                        boxSize="100px"
                        objectFit="cover"
                        borderRadius="md"
                        fallbackSrc="https://via.placeholder.com/100?text=Produit"
                      />

                      {/* Détails */}
                      <Box flex={1}>
                        <Text
                          fontWeight="bold"
                          fontSize="lg"
                          as={RouterLink}
                          to={`/products/${item.product_id}`}
                          _hover={{ color: 'blue.500' }}
                        >
                          {item.product.name}
                        </Text>
                        <Text color="blue.600" fontWeight="bold" fontSize="lg">
                          {item.product.price.toFixed(2)} €
                        </Text>
                        {item.product.stock_quantity < 10 && (
                          <Text fontSize="sm" color="orange.500">
                            Plus que {item.product.stock_quantity} en stock
                          </Text>
                        )}
                      </Box>

                      {/* Quantité */}
                      <VStack>
                        <Text fontSize="sm" color="gray.500">Quantité</Text>
                        <NumberInput
                          size="sm"
                          maxW={20}
                          min={1}
                          max={item.product.stock_quantity}
                          value={item.quantity}
                          onChange={(_, value) => {
                            if (value && value !== item.quantity) {
                              updateQuantity(item.product_id, value);
                            }
                          }}
                          isDisabled={updating}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </VStack>

                      {/* Sous-total */}
                      <VStack align="end" minW="100px">
                        <Text fontSize="sm" color="gray.500">Sous-total</Text>
                        <Text fontWeight="bold" fontSize="lg">
                          {item.item_total.toFixed(2)} €
                        </Text>
                      </VStack>

                      {/* Supprimer */}
                      <IconButton
                        icon={<DeleteIcon />}
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => removeItem(item.product_id)}
                        isLoading={updating}
                        aria-label="Supprimer"
                      />
                    </Flex>
                  </Box>
                ))}
              </VStack>
            </Box>

            {/* Résumé */}
            <Box flex={1}>
              <Box bg="white" p={6} rounded="lg" shadow="md" position="sticky" top={4}>
                <Heading size="md" mb={4}>Résumé</Heading>
                
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between">
                    <Text color="gray.600">Sous-total</Text>
                    <Text fontWeight="medium">{cart.total.toFixed(2)} €</Text>
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text color="gray.600">Livraison</Text>
                    <Text fontWeight="medium" color="green.500">Gratuite</Text>
                  </HStack>

                  <Divider />

                  <HStack justify="space-between">
                    <Text fontWeight="bold" fontSize="lg">Total</Text>
                    <Text fontWeight="bold" fontSize="xl" color="blue.600">
                      {cart.total.toFixed(2)} €
                    </Text>
                  </HStack>

                  <Button
                    colorScheme="blue"
                    size="lg"
                    w="100%"
                    mt={4}
                    onClick={() => navigate('/checkout')}
                  >
                    Passer la commande
                  </Button>

                  <Button
                    as={RouterLink}
                    to="/products"
                    variant="outline"
                    size="sm"
                    w="100%"
                  >
                    Continuer mes achats
                  </Button>
                </VStack>
              </Box>
            </Box>
          </Flex>
        )}
      </VStack>
    </Container>
  );
};

export default CartPage;
