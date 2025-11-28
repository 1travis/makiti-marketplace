import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Badge,
  useToast,
  Spinner,
  useColorModeValue,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Image,
  Divider,
  IconButton,
  Flex,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useDisclosure,
  Icon,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { FiPackage, FiTruck, FiCheck, FiClock, FiX, FiStar } from 'react-icons/fi';
import { motion } from 'framer-motion';
import api from '../api/axios';
import ReviewModal from '../components/ReviewModal';

const MotionBox = motion(Box);

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    delivered: 0,
    totalSpent: 0,
  });
  const [pendingReviews, setPendingReviews] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/my-orders');
      setOrders(response.data);
      
      // Calculer les statistiques
      const totalSpent = response.data.reduce((sum, order) => sum + (order.total || 0), 0);
      const pending = response.data.filter(o => o.status === 'pending' || o.status === 'processing').length;
      const delivered = response.data.filter(o => o.status === 'delivered').length;
      
      setStats({
        total: response.data.length,
        pending,
        delivered,
        totalSpent,
      });

      // Vérifier les avis en attente pour les commandes livrées
      const deliveredOrders = response.data.filter(o => o.status === 'delivered');
      for (const order of deliveredOrders) {
        try {
          const reviewCheck = await api.get(`/reviews/can-review/${order.id}`);
          if (reviewCheck.data.can_review) {
            setPendingReviews(prev => ({
              ...prev,
              [order.id]: reviewCheck.data.pending_reviews
            }));
          }
        } catch (err) {
          console.log('Erreur vérification avis:', err);
        }
      }
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger l\'historique des commandes',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const openReviewModal = (orderId, seller) => {
    setSelectedOrder(orderId);
    setSelectedSeller(seller);
    onOpen();
  };

  const handleReviewSubmitted = () => {
    // Rafraîchir les commandes pour mettre à jour les avis en attente
    fetchOrders();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'processing': return 'blue';
      case 'shipped': return 'purple';
      case 'delivered': return 'green';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'processing': return 'En préparation';
      case 'shipped': return 'Expédiée';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return FiClock;
      case 'processing': return FiPackage;
      case 'shipped': return FiTruck;
      case 'delivered': return FiCheck;
      case 'cancelled': return FiX;
      default: return FiClock;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={10}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Chargement de l'historique...</Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <HStack>
          <IconButton
            icon={<ArrowBackIcon />}
            variant="ghost"
            onClick={() => window.history.back()}
            aria-label="Retour"
          />
          <Heading size="lg">
            <HStack>
              <FiPackage />
              <Text>Mes Commandes</Text>
            </HStack>
          </Heading>
        </HStack>

        {/* Statistiques */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <MotionBox
            whileHover={{ scale: 1.02 }}
            bg={bgColor}
            p={4}
            borderRadius="xl"
            shadow="md"
          >
            <Stat>
              <StatLabel color="gray.500">Total commandes</StatLabel>
              <StatNumber color="blue.600">{stats.total}</StatNumber>
              <StatHelpText>Depuis le début</StatHelpText>
            </Stat>
          </MotionBox>
          <MotionBox
            whileHover={{ scale: 1.02 }}
            bg={bgColor}
            p={4}
            borderRadius="xl"
            shadow="md"
          >
            <Stat>
              <StatLabel color="gray.500">En cours</StatLabel>
              <StatNumber color="yellow.500">{stats.pending}</StatNumber>
              <StatHelpText>À suivre</StatHelpText>
            </Stat>
          </MotionBox>
          <MotionBox
            whileHover={{ scale: 1.02 }}
            bg={bgColor}
            p={4}
            borderRadius="xl"
            shadow="md"
          >
            <Stat>
              <StatLabel color="gray.500">Livrées</StatLabel>
              <StatNumber color="green.500">{stats.delivered}</StatNumber>
              <StatHelpText>Terminées</StatHelpText>
            </Stat>
          </MotionBox>
          <MotionBox
            whileHover={{ scale: 1.02 }}
            bg={bgColor}
            p={4}
            borderRadius="xl"
            shadow="md"
          >
            <Stat>
              <StatLabel color="gray.500">Total dépensé</StatLabel>
              <StatNumber color="purple.600">{stats.totalSpent.toFixed(2)} €</StatNumber>
              <StatHelpText>Tous achats</StatHelpText>
            </Stat>
          </MotionBox>
        </SimpleGrid>

        {orders.length === 0 ? (
          <Box
            bg={bgColor}
            p={10}
            borderRadius="xl"
            textAlign="center"
            shadow="md"
          >
            <VStack spacing={4}>
              <Box fontSize="6xl">📦</Box>
              <Heading size="md" color="gray.500">
                Aucune commande pour le moment
              </Heading>
              <Text color="gray.400">
                Commencez à faire vos achats !
              </Text>
              <Button
                as={RouterLink}
                to="/products"
                colorScheme="blue"
                size="lg"
              >
                Découvrir les produits
              </Button>
            </VStack>
          </Box>
        ) : (
          <Accordion allowMultiple>
            {orders.map((order) => {
              const StatusIcon = getStatusIcon(order.status);
              return (
                <AccordionItem
                  key={order.id}
                  border="none"
                  mb={4}
                >
                  <MotionBox
                    whileHover={{ scale: 1.01 }}
                    bg={bgColor}
                    borderRadius="xl"
                    shadow="md"
                    overflow="hidden"
                  >
                    <AccordionButton p={4} _hover={{ bg: 'transparent' }}>
                      <Flex flex={1} justify="space-between" align="center" flexWrap="wrap" gap={4}>
                        <VStack align="start" spacing={1}>
                          <HStack>
                            <Text fontWeight="bold" fontSize="lg">
                              Commande #{order.id?.slice(-8).toUpperCase()}
                            </Text>
                            <Badge colorScheme={getStatusColor(order.status)} display="flex" alignItems="center" gap={1}>
                              <StatusIcon size={12} />
                              {getStatusLabel(order.status)}
                            </Badge>
                          </HStack>
                          <Text color="gray.500" fontSize="sm">
                            {formatDate(order.created_at)}
                          </Text>
                        </VStack>
                        <HStack spacing={4}>
                          <VStack align="end" spacing={0}>
                            <Text fontWeight="bold" color="blue.600" fontSize="xl">
                              {order.total?.toFixed(2)} €
                            </Text>
                            <Text color="gray.500" fontSize="sm">
                              {order.items?.length} article{order.items?.length > 1 ? 's' : ''}
                            </Text>
                          </VStack>
                          <AccordionIcon />
                        </HStack>
                      </Flex>
                    </AccordionButton>
                    
                    <AccordionPanel pb={4}>
                      <Divider mb={4} />
                      <VStack align="stretch" spacing={4}>
                        {/* Progression de la commande */}
                        <Box>
                          <Text fontWeight="semibold" mb={2}>Progression</Text>
                          <HStack spacing={0} justify="space-between">
                            {['pending', 'processing', 'shipped', 'delivered'].map((step, index) => {
                              const isActive = ['pending', 'processing', 'shipped', 'delivered'].indexOf(order.status) >= index;
                              const StepIcon = getStatusIcon(step);
                              return (
                                <VStack key={step} flex={1} spacing={1}>
                                  <Box
                                    w={10}
                                    h={10}
                                    borderRadius="full"
                                    bg={isActive ? `${getStatusColor(step)}.500` : 'gray.200'}
                                    color={isActive ? 'white' : 'gray.400'}
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                  >
                                    <StepIcon />
                                  </Box>
                                  <Text fontSize="xs" color={isActive ? 'gray.700' : 'gray.400'}>
                                    {getStatusLabel(step)}
                                  </Text>
                                </VStack>
                              );
                            })}
                          </HStack>
                        </Box>

                        <Divider />

                        {/* Liste des produits */}
                        <Box>
                          <Text fontWeight="semibold" mb={2}>Articles commandés</Text>
                          <VStack align="stretch" spacing={3}>
                            {order.items?.map((item, index) => (
                              <HStack key={index} spacing={4}>
                                <Image
                                  src={item.product?.images?.[0] || 'https://via.placeholder.com/60'}
                                  alt={item.product?.name}
                                  boxSize="60px"
                                  objectFit="cover"
                                  borderRadius="md"
                                  fallbackSrc="https://via.placeholder.com/60"
                                />
                                <VStack align="start" flex={1} spacing={0}>
                                  <Text fontWeight="medium">{item.product?.name}</Text>
                                  <Text color="gray.500" fontSize="sm">
                                    Quantité: {item.quantity}
                                  </Text>
                                </VStack>
                                <Text fontWeight="bold">
                                  {(item.price * item.quantity).toFixed(2)} €
                                </Text>
                              </HStack>
                            ))}
                          </VStack>
                        </Box>

                        <Divider />

                        {/* Adresse de livraison */}
                        {order.shipping_address && (
                          <Box>
                            <Text fontWeight="semibold" mb={2}>Adresse de livraison</Text>
                            <Text color="gray.600">{order.shipping_address}</Text>
                          </Box>
                        )}

                        {/* Bouton pour noter le vendeur - uniquement pour les commandes livrées */}
                        {order.status === 'delivered' && pendingReviews[order.id] && pendingReviews[order.id].length > 0 && (
                          <>
                            <Divider />
                            <Box>
                              <Text fontWeight="semibold" mb={3}>
                                <HStack>
                                  <Icon as={FiStar} color="yellow.400" />
                                  <Text>Évaluer les vendeurs</Text>
                                </HStack>
                              </Text>
                              <VStack align="stretch" spacing={2}>
                                {pendingReviews[order.id].map((seller) => (
                                  <Button
                                    key={seller.seller_id}
                                    leftIcon={<FiStar />}
                                    colorScheme="yellow"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openReviewModal(order.id, seller)}
                                  >
                                    Noter {seller.shop_name || seller.seller_name}
                                  </Button>
                                ))}
                              </VStack>
                            </Box>
                          </>
                        )}

                        {/* Message si déjà noté */}
                        {order.status === 'delivered' && (!pendingReviews[order.id] || pendingReviews[order.id].length === 0) && (
                          <Box>
                            <HStack color="green.500" fontSize="sm">
                              <Icon as={FiCheck} />
                              <Text>Vous avez évalué tous les vendeurs de cette commande</Text>
                            </HStack>
                          </Box>
                        )}
                      </VStack>
                    </AccordionPanel>
                  </MotionBox>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </VStack>

      {/* Modal pour noter le vendeur */}
      <ReviewModal
        isOpen={isOpen}
        onClose={onClose}
        orderId={selectedOrder}
        seller={selectedSeller}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </Container>
  );
};

export default OrderHistoryPage;
