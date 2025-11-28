/**
 * ============================================================================
 * CHECKOUTPAGE.JSX - PAGE DE FINALISATION DE COMMANDE
 * ============================================================================
 * Cette page permet au client de finaliser sa commande.
 * Elle offre le choix entre livraison à domicile et retrait en magasin,
 * la saisie des informations de livraison et le choix du mode de paiement.
 * ============================================================================
 */

// ==================== IMPORTS ====================

// Hooks React pour la gestion d'état et les effets
import { useState, useEffect } from 'react';

// Hook Redux pour accéder au store (token et infos utilisateur)
import { useSelector } from 'react-redux';

// Hook de navigation React Router
import { useNavigate } from 'react-router-dom';

// Instance Axios configurée pour les appels API
import api from '../api/axios';

// Composants Chakra UI pour l'interface
import {
  Box,              // Conteneur de base
  Container,        // Conteneur centré avec largeur max
  Heading,          // Titre
  VStack,           // Stack vertical
  HStack,           // Stack horizontal
  Text,             // Texte
  Button,           // Bouton
  FormControl,      // Conteneur de champ de formulaire
  FormLabel,        // Label de champ
  Input,            // Champ de saisie
  Divider,          // Ligne de séparation
  useToast,         // Hook pour les notifications
  Spinner,          // Indicateur de chargement
  Alert,            // Message d'alerte
  AlertIcon,        // Icône d'alerte
  Radio,            // Bouton radio
  RadioGroup,       // Groupe de boutons radio
  Stack,            // Stack générique
  Image,            // Image
  Badge,            // Badge/étiquette
  Flex,             // Conteneur flexible
  Icon,             // Icône
  useColorModeValue, // Hook pour les couleurs adaptatives (mode clair/sombre)
  Card,             // Carte
  CardBody,         // Corps de carte
} from '@chakra-ui/react';

// Icônes Chakra UI
import { CheckCircleIcon, ArrowBackIcon } from '@chakra-ui/icons';

// Icônes React Icons (Feather)
import { FiTruck, FiMapPin, FiPhone, FiMessageSquare } from 'react-icons/fi';

// ==================== COMPOSANT PRINCIPAL ====================

/**
 * CheckoutPage - Composant de la page de checkout
 * Gère tout le processus de finalisation de commande
 */
const CheckoutPage = () => {
  // ==================== HOOKS ====================
  
  // Hook pour la navigation programmatique
  const navigate = useNavigate();
  
  // Hook pour afficher des notifications toast
  const toast = useToast();
  
  // Récupère le token et les infos utilisateur depuis Redux
  const { token, user } = useSelector((state) => state.auth);

  // ==================== ÉTATS LOCAUX ====================

  // Contenu du panier (articles et total)
  const [cart, setCart] = useState({ items: [], total: 0 });
  
  // État de chargement initial
  const [loading, setLoading] = useState(true);
  
  // État de traitement de la commande
  const [processing, setProcessing] = useState(false);
  
  // Indique si la commande est terminée avec succès
  const [orderComplete, setOrderComplete] = useState(false);
  
  // ID de la commande créée
  const [orderId, setOrderId] = useState(null);
  
  // Liste des boutiques pour le retrait en magasin
  const [shops, setShops] = useState([]);

  // Mode de livraison sélectionné ('delivery' = livraison, 'pickup' = retrait)
  const [deliveryMethod, setDeliveryMethod] = useState('delivery');

  // Données du formulaire d'adresse de livraison
  const [shippingAddress, setShippingAddress] = useState({
    full_name: user?.full_name || '',  // Pré-rempli avec le nom de l'utilisateur
    address: '',
    city: '',
    postal_code: '',
    phone: '',
  });

  // Mode de paiement sélectionné
  const [paymentMethod, setPaymentMethod] = useState('card');
  
  // ==================== STYLES ADAPTATIFS ====================
  // Ces couleurs s'adaptent automatiquement au mode clair/sombre
  
  const cardBg = useColorModeValue('white', 'gray.800');           // Fond des cartes
  const selectedBg = useColorModeValue('blue.50', 'blue.900');     // Fond élément sélectionné
  const borderColor = useColorModeValue('gray.200', 'gray.600');   // Couleur des bordures
  const pickupInfoBg = useColorModeValue('gray.50', 'gray.700');   // Fond info pickup
  const successBg = useColorModeValue('green.50', 'green.900');    // Fond succès

  // ==================== FONCTIONS UTILITAIRES ====================

  /**
   * formatAddress - Formate une adresse pour l'affichage
   * Gère les cas où l'adresse est une chaîne ou un objet
   * @param {string|object} address - L'adresse à formater
   * @returns {string} L'adresse formatée
   */
  const formatAddress = (address) => {
    // Si pas d'adresse, retourne un message par défaut
    if (!address) return 'Adresse non renseignée';
    
    // Si c'est déjà une chaîne, la retourne telle quelle
    if (typeof address === 'string') return address;
    
    // Si c'est un objet, concatène les propriétés
    if (typeof address === 'object') {
      const parts = [
        address.street,
        address.city,
        address.postal_code,
        address.country
      ].filter(Boolean); // Filtre les valeurs vides
      return parts.length > 0 ? parts.join(', ') : 'Adresse non renseignée';
    }
    
    return 'Adresse non renseignée';
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [token, navigate]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cart');
      if (response.data.items.length === 0) {
        navigate('/cart');
        return;
      }
      setCart(response.data);
      
      // Récupérer les infos des boutiques pour le pickup
      const sellerIds = [...new Set(response.data.items.map(item => item.product?.seller_id).filter(Boolean))];
      const shopsData = [];
      for (const sellerId of sellerIds) {
        try {
          const shopRes = await api.get(`/shops/seller/${sellerId}`);
          if (shopRes.data) {
            shopsData.push(shopRes.data);
          }
        } catch (e) {
          console.log('Shop not found for seller:', sellerId);
        }
      }
      setShops(shopsData);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger le panier',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      navigate('/cart');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const { full_name, phone } = shippingAddress;
    
    // Pour le pickup, seuls nom et téléphone sont requis
    if (deliveryMethod === 'pickup') {
      if (!full_name || !phone) {
        toast({
          title: 'Formulaire incomplet',
          description: 'Veuillez remplir votre nom et téléphone',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return false;
      }
      return true;
    }
    
    // Pour la livraison, tous les champs sont requis
    const { address, city, postal_code } = shippingAddress;
    if (!full_name || !address || !city || !postal_code || !phone) {
      toast({
        title: 'Formulaire incomplet',
        description: 'Veuillez remplir tous les champs',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setProcessing(true);
      const response = await api.post('/checkout', {
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        delivery_method: deliveryMethod,
      });

      setOrderId(response.data.order_id);
      setOrderComplete(true);

      toast({
        title: 'Commande confirmée !',
        description: `Votre commande #${response.data.order_id.slice(-8)} a été créée`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.detail || 'Impossible de créer la commande',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Container maxW="container.lg" py={10}>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Chargement...</Text>
        </VStack>
      </Container>
    );
  }

  // Page de confirmation de commande
  if (orderComplete) {
    return (
      <Container maxW="container.md" py={10}>
        <Box bg="white" p={10} rounded="lg" shadow="md" textAlign="center">
          <Icon as={CheckCircleIcon} boxSize={20} color="green.500" mb={6} />
          <Heading size="xl" mb={4} color="green.600">
            Commande confirmée !
          </Heading>
          <Text fontSize="lg" color="gray.600" mb={2}>
            Merci pour votre achat
          </Text>
          <Text color="gray.500" mb={6}>
            Numéro de commande : <strong>#{orderId?.slice(-8)}</strong>
          </Text>
          
          <Divider my={6} />
          
          <VStack spacing={3}>
            <Text color="gray.600">
              Un email de confirmation vous sera envoyé.
            </Text>
            <Text color="gray.600">
              Vous pouvez suivre votre commande dans votre profil.
            </Text>
          </VStack>

          <HStack spacing={4} justify="center" mt={8}>
            <Button
              variant="outline"
              onClick={() => navigate('/profile')}
            >
              Voir mes commandes
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => navigate('/products')}
            >
              Continuer mes achats
            </Button>
          </HStack>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={6}>
      <Button
        leftIcon={<ArrowBackIcon />}
        variant="ghost"
        onClick={() => navigate('/cart')}
        mb={4}
      >
        Retour au panier
      </Button>

      <Heading size="lg" mb={6}>Finaliser la commande</Heading>

      <Flex gap={8} direction={{ base: 'column', lg: 'row' }}>
        {/* Formulaire */}
        <Box flex={2}>
          <VStack spacing={6} align="stretch">
            {/* Mode de livraison */}
            <Box bg={cardBg} p={6} rounded="lg" shadow="sm">
              <Heading size="md" mb={4}>🚚 Mode de réception</Heading>
              
              <HStack spacing={4}>
                <Card
                  flex={1}
                  cursor="pointer"
                  onClick={() => setDeliveryMethod('delivery')}
                  bg={deliveryMethod === 'delivery' ? selectedBg : cardBg}
                  borderWidth={2}
                  borderColor={deliveryMethod === 'delivery' ? 'blue.500' : borderColor}
                  _hover={{ borderColor: 'blue.300' }}
                  transition="all 0.2s"
                >
                  <CardBody textAlign="center" py={6}>
                    <Icon as={FiTruck} boxSize={8} color={deliveryMethod === 'delivery' ? 'blue.500' : 'gray.400'} mb={3} />
                    <Text fontWeight="bold" fontSize="lg">Livraison</Text>
                    <Text fontSize="sm" color="gray.500">À votre adresse</Text>
                    <Badge colorScheme="green" mt={2}>Gratuite</Badge>
                  </CardBody>
                </Card>

                <Card
                  flex={1}
                  cursor="pointer"
                  onClick={() => setDeliveryMethod('pickup')}
                  bg={deliveryMethod === 'pickup' ? selectedBg : cardBg}
                  borderWidth={2}
                  borderColor={deliveryMethod === 'pickup' ? 'blue.500' : borderColor}
                  _hover={{ borderColor: 'blue.300' }}
                  transition="all 0.2s"
                >
                  <CardBody textAlign="center" py={6}>
                    <Icon as={FiMapPin} boxSize={8} color={deliveryMethod === 'pickup' ? 'blue.500' : 'gray.400'} mb={3} />
                    <Text fontWeight="bold" fontSize="lg">Retrait en magasin</Text>
                    <Text fontSize="sm" color="gray.500">Récupérez sur place</Text>
                    <Badge colorScheme="blue" mt={2}>Rapide</Badge>
                  </CardBody>
                </Card>
              </HStack>

              {/* Info pickup - sera affiché dans une section séparée */}
            </Box>

            {/* Adresse de livraison - seulement si livraison */}
            {deliveryMethod === 'delivery' && (
            <Box bg={cardBg} p={6} rounded="lg" shadow="sm">
              <Heading size="md" mb={4}>📍 Adresse de livraison</Heading>
              
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Nom complet</FormLabel>
                  <Input
                    name="full_name"
                    value={shippingAddress.full_name}
                    onChange={handleInputChange}
                    placeholder="Prénom et nom"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Adresse</FormLabel>
                  <Input
                    name="address"
                    value={shippingAddress.address}
                    onChange={handleInputChange}
                    placeholder="Numéro et nom de rue"
                  />
                </FormControl>

                <HStack spacing={4} w="100%">
                  <FormControl isRequired>
                    <FormLabel>Ville</FormLabel>
                    <Input
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleInputChange}
                      placeholder="Ville"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Code postal</FormLabel>
                    <Input
                      name="postal_code"
                      value={shippingAddress.postal_code}
                      onChange={handleInputChange}
                      placeholder="Code postal"
                    />
                  </FormControl>
                </HStack>

                <FormControl isRequired>
                  <FormLabel>Téléphone</FormLabel>
                  <Input
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleInputChange}
                    placeholder="Numéro de téléphone"
                  />
                </FormControl>
              </VStack>
            </Box>
            )}

            {/* Informations de retrait en magasin */}
            {deliveryMethod === 'pickup' && (
            <>
              {/* Points de retrait */}
              <Box bg={cardBg} p={6} rounded="lg" shadow="sm">
                <Heading size="md" mb={4}>🏪 Points de retrait disponibles</Heading>
                
                {shops.length > 0 ? (
                  <VStack align="stretch" spacing={4}>
                    {shops.map((shop) => (
                      <Box 
                        key={shop.id} 
                        p={4} 
                        bg={successBg} 
                        borderRadius="lg" 
                        borderWidth={2} 
                        borderColor="green.400"
                      >
                        <HStack justify="space-between" align="start" mb={3}>
                          <VStack align="start" spacing={1}>
                            <HStack>
                              <Icon as={FiMapPin} color="green.500" />
                              <Text fontWeight="bold" fontSize="lg">{shop.name}</Text>
                            </HStack>
                            <Text color="gray.600">{formatAddress(shop.address)}</Text>
                          </VStack>
                          <Badge colorScheme="green" fontSize="sm" px={3} py={1}>
                            Disponible
                          </Badge>
                        </HStack>
                        
                        <Divider my={3} />
                        
                        <VStack align="stretch" spacing={2}>
                          {shop.phone && (
                            <HStack>
                              <Icon as={FiPhone} color="blue.500" />
                              <Text fontWeight="medium">{shop.phone}</Text>
                              <Button 
                                size="xs" 
                                colorScheme="blue" 
                                variant="outline"
                                as="a"
                                href={`tel:${shop.phone}`}
                              >
                                Appeler
                              </Button>
                            </HStack>
                          )}
                          
                          <Button
                            leftIcon={<Icon as={FiMessageSquare} />}
                            colorScheme="green"
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/messages?seller=${shop.owner_id}`)}
                          >
                            Contacter le vendeur par chat
                          </Button>
                        </VStack>
                        
                        <Alert status="info" mt={4} borderRadius="md" fontSize="sm">
                          <AlertIcon />
                          Présentez-vous avec votre numéro de commande et une pièce d'identité
                        </Alert>
                      </Box>
                    ))}
                  </VStack>
                ) : (
                  <Alert status="warning" borderRadius="md">
                    <AlertIcon />
                    Aucun point de retrait disponible pour le moment
                  </Alert>
                )}
              </Box>

              {/* Vos informations pour le retrait */}
              <Box bg={cardBg} p={6} rounded="lg" shadow="sm">
                <Heading size="md" mb={4}>👤 Vos informations de retrait</Heading>
                
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Nom complet</FormLabel>
                    <Input
                      name="full_name"
                      value={shippingAddress.full_name}
                      onChange={handleInputChange}
                      placeholder="Prénom et nom (pour identification)"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Téléphone</FormLabel>
                    <Input
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={handleInputChange}
                      placeholder="Pour vous contacter quand la commande est prête"
                    />
                  </FormControl>
                  
                  <Alert status="success" borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <Text fontWeight="bold">Retrait gratuit et rapide !</Text>
                      <Text fontSize="sm">Vous serez notifié par SMS/email quand votre commande sera prête.</Text>
                    </Box>
                  </Alert>
                </VStack>
              </Box>
            </>
            )}

            {/* Mode de paiement */}
            <Box bg={cardBg} p={6} rounded="lg" shadow="sm">
              <Heading size="md" mb={4}>💳 Mode de paiement</Heading>
              
              <RadioGroup value={paymentMethod} onChange={setPaymentMethod}>
                <Stack spacing={3}>
                  <Radio value="card" colorScheme="blue">
                    <HStack>
                      <Text>Carte bancaire</Text>
                      <Badge colorScheme="green">Recommandé</Badge>
                    </HStack>
                  </Radio>
                  <Radio value="cash_on_delivery" colorScheme="blue">
                    Paiement à la livraison
                  </Radio>
                </Stack>
              </RadioGroup>

              {paymentMethod === 'card' && (
                <Alert status="info" mt={4} borderRadius="md">
                  <AlertIcon />
                  Le paiement par carte sera simulé pour cette démo.
                </Alert>
              )}
            </Box>
          </VStack>
        </Box>

        {/* Résumé de commande */}
        <Box flex={1}>
          <Box bg={cardBg} p={6} rounded="lg" shadow="md" position="sticky" top={4}>
            <Heading size="md" mb={4}>Résumé de commande</Heading>

            <VStack spacing={3} align="stretch" mb={4}>
              {cart.items.map((item) => (
                <HStack key={item.product_id} spacing={3}>
                  <Image
                    src={item.product.images?.[0] || 'https://via.placeholder.com/50'}
                    alt={item.product.name}
                    boxSize="50px"
                    objectFit="cover"
                    borderRadius="md"
                  />
                  <Box flex={1}>
                    <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                      {item.product.name}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      Qté: {item.quantity}
                    </Text>
                  </Box>
                  <Text fontWeight="medium">
                    {item.item_total.toFixed(2)} €
                  </Text>
                </HStack>
              ))}
            </VStack>

            <Divider my={4} />

            <VStack spacing={2} align="stretch">
              <HStack justify="space-between">
                <Text color="gray.600">Sous-total</Text>
                <Text>{cart.total.toFixed(2)} €</Text>
              </HStack>
              <HStack justify="space-between">
                <Text color="gray.600">
                  {deliveryMethod === 'delivery' ? 'Livraison' : 'Retrait en magasin'}
                </Text>
                <Text color="green.500">Gratuit</Text>
              </HStack>
            </VStack>

            <Divider my={4} />

            <HStack justify="space-between" mb={6}>
              <Text fontWeight="bold" fontSize="lg">Total</Text>
              <Text fontWeight="bold" fontSize="xl" color="blue.600">
                {cart.total.toFixed(2)} €
              </Text>
            </HStack>

            <Button
              colorScheme="blue"
              size="lg"
              w="100%"
              onClick={handleSubmit}
              isLoading={processing}
              loadingText="Traitement..."
            >
              Confirmer la commande
            </Button>

            <Text fontSize="xs" color="gray.500" textAlign="center" mt={3}>
              En confirmant, vous acceptez nos conditions générales de vente
            </Text>
          </Box>
        </Box>
      </Flex>
    </Container>
  );
};

export default CheckoutPage;
