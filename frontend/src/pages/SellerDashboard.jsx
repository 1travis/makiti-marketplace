import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { fetchSellerProducts, deleteProduct, fetchMyShop } from '../store/slices/productSlice';
import {
  Box,
  Container,
  Heading,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  HStack,
  VStack,
  Text,
  useToast,
  Spinner,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Image,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Flex,
  Icon,
  Avatar,
  Progress,
  Divider,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip,
  useColorModeValue,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, CheckCircleIcon, TimeIcon, InfoIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { FiPackage, FiShoppingBag, FiStar, FiTrendingUp, FiDollarSign, FiEye, FiMoreVertical, FiAlertCircle, FiBox } from 'react-icons/fi';
import { motion } from 'framer-motion';
import api from '../api/axios';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const SellerDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { products, myShop, loading, error } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const [productToDelete, setProductToDelete] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalReviews: 0,
    recentOrders: []
  });
  const [loadingStats, setLoadingStats] = useState(true);

  const bgColor = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const tableHeaderBg = useColorModeValue('gray.50', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    dispatch(fetchMyShop());
    dispatch(fetchSellerProducts());
    fetchStats();
  }, [dispatch]);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      // Récupérer les commandes du vendeur
      const ordersRes = await api.get('/seller/orders');
      const orders = ordersRes.data || [];
      
      // Calculer les statistiques
      const totalRevenue = orders.reduce((sum, order) => sum + (order.seller_total || 0), 0);
      const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
      
      // Récupérer les avis
      let averageRating = 0;
      let totalReviews = 0;
      try {
        const reviewsRes = await api.get(`/reviews/seller/${user?.id}`);
        averageRating = reviewsRes.data?.stats?.average || 0;
        totalReviews = reviewsRes.data?.stats?.total || 0;
      } catch (e) {
        console.log('Pas d\'avis');
      }

      setStats({
        totalOrders: orders.length,
        pendingOrders,
        totalRevenue,
        averageRating,
        totalReviews,
        recentOrders: orders.slice(0, 5)
      });
    } catch (error) {
      console.error('Erreur stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (error) {
      toast({
        title: 'Erreur',
        description: error,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [error, toast]);

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    onOpen();
  };

  const handleDeleteConfirm = async () => {
    if (productToDelete) {
      const result = await dispatch(deleteProduct(productToDelete.id));
      if (!result.error) {
        toast({
          title: 'Succès',
          description: 'Produit supprimé avec succès',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    }
    onClose();
    setProductToDelete(null);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: 'gray', label: 'Brouillon' },
      published: { color: 'green', label: 'Publié' },
      out_of_stock: { color: 'red', label: 'Rupture' },
      archived: { color: 'purple', label: 'Archivé' },
    };
    const config = statusConfig[status] || { color: 'gray', label: status };
    return <Badge colorScheme={config.color}>{config.label}</Badge>;
  };

  const getCategoryLabel = (category) => {
    const categories = {
      electronics: 'Électronique',
      fashion: 'Mode',
      home: 'Maison',
      beauty: 'Beauté',
      sports: 'Sports',
      books: 'Livres',
      other: 'Autre',
    };
    return categories[category] || category;
  };

  // Statistiques produits
  const totalProducts = products.length;
  const publishedProducts = products.filter(p => p.status === 'published').length;
  const draftProducts = products.filter(p => p.status === 'draft').length;
  const outOfStockProducts = products.filter(p => p.stock_quantity === 0).length;

  const getOrderStatusColor = (status) => {
    const colors = {
      pending: 'yellow',
      processing: 'blue',
      shipped: 'purple',
      delivered: 'green',
      cancelled: 'red'
    };
    return colors[status] || 'gray';
  };

  const getOrderStatusLabel = (status) => {
    const labels = {
      pending: 'En attente',
      processing: 'En cours',
      shipped: 'Expédié',
      delivered: 'Livré',
      cancelled: 'Annulé'
    };
    return labels[status] || status;
  };

  if (loading && products.length === 0) {
    return (
      <Container maxW="container.xl" py={10}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Chargement...</Text>
        </VStack>
      </Container>
    );
  }

  // Si pas de boutique, rediriger vers la création
  if (!myShop && !loading) {
    return (
      <Container maxW="container.xl" py={10}>
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <VStack spacing={6} textAlign="center" bg={bgColor} p={10} borderRadius="2xl" shadow="xl">
            <Icon as={FiShoppingBag} boxSize={20} color="blue.400" />
            <Heading size="lg">Vous n'avez pas encore de boutique</Heading>
            <Text color="gray.600" maxW="md">
              Créez votre boutique pour commencer à vendre vos produits et services.
            </Text>
            <Button
              colorScheme="blue"
              size="lg"
              leftIcon={<AddIcon />}
              onClick={() => navigate('/shops/new')}
              _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
              transition="all 0.2s"
            >
              Créer ma boutique
            </Button>
          </VStack>
        </MotionBox>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={6}>
      <VStack spacing={6} align="stretch">
        {/* En-tête avec infos boutique */}
        <MotionBox
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box
            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            p={6}
            rounded="2xl"
            shadow="xl"
            color="white"
          >
            <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
              <HStack spacing={4}>
                <Avatar name={myShop?.name} size="lg" bg="whiteAlpha.300" />
                <VStack align="start" spacing={1}>
                  <Heading size="lg">{myShop?.name}</Heading>
                  <Text opacity={0.9}>{myShop?.description}</Text>
                  <HStack>
                    <Badge colorScheme={myShop?.status === 'active' ? 'green' : 'yellow'} variant="solid">
                      {myShop?.status === 'active' ? '✓ Active' : '⏳ En attente'}
                    </Badge>
                    {stats.averageRating > 0 && (
                      <Badge colorScheme="yellow" variant="solid">
                        ⭐ {stats.averageRating} ({stats.totalReviews} avis)
                      </Badge>
                    )}
                  </HStack>
                </VStack>
              </HStack>
              <HStack spacing={3}>
                <Button
                  colorScheme="whiteAlpha"
                  variant="solid"
                  leftIcon={<AddIcon />}
                  onClick={() => navigate('/seller/products/new')}
                  _hover={{ bg: 'whiteAlpha.300' }}
                >
                  Nouveau produit
                </Button>
              </HStack>
            </Flex>
          </Box>
        </MotionBox>

        {/* Statistiques principales */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            bg={cardBg}
            shadow="md"
            borderRadius="xl"
            overflow="hidden"
            borderTop="4px solid"
            borderTopColor="blue.400"
          >
            <CardBody>
              <Flex justify="space-between" align="start">
                <Stat>
                  <StatLabel color="gray.500">Revenus totaux</StatLabel>
                  <StatNumber fontSize="2xl" color="blue.600">
                    {stats.totalRevenue.toFixed(2)} €
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    Ce mois
                  </StatHelpText>
                </Stat>
                <Box p={3} bg="blue.50" borderRadius="full">
                  <Icon as={FiDollarSign} boxSize={6} color="blue.500" />
                </Box>
              </Flex>
            </CardBody>
          </MotionCard>

          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            bg={cardBg}
            shadow="md"
            borderRadius="xl"
            overflow="hidden"
            borderTop="4px solid"
            borderTopColor="green.400"
          >
            <CardBody>
              <Flex justify="space-between" align="start">
                <Stat>
                  <StatLabel color="gray.500">Commandes</StatLabel>
                  <StatNumber fontSize="2xl" color="green.600">
                    {stats.totalOrders}
                  </StatNumber>
                  <StatHelpText>
                    {stats.pendingOrders > 0 && (
                      <Badge colorScheme="orange">{stats.pendingOrders} en attente</Badge>
                    )}
                  </StatHelpText>
                </Stat>
                <Box p={3} bg="green.50" borderRadius="full">
                  <Icon as={FiPackage} boxSize={6} color="green.500" />
                </Box>
              </Flex>
            </CardBody>
          </MotionCard>

          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            bg={cardBg}
            shadow="md"
            borderRadius="xl"
            overflow="hidden"
            borderTop="4px solid"
            borderTopColor="purple.400"
          >
            <CardBody>
              <Flex justify="space-between" align="start">
                <Stat>
                  <StatLabel color="gray.500">Produits</StatLabel>
                  <StatNumber fontSize="2xl" color="purple.600">
                    {totalProducts}
                  </StatNumber>
                  <StatHelpText>
                    <Badge colorScheme="green" mr={1}>{publishedProducts} publiés</Badge>
                  </StatHelpText>
                </Stat>
                <Box p={3} bg="purple.50" borderRadius="full">
                  <Icon as={FiBox} boxSize={6} color="purple.500" />
                </Box>
              </Flex>
            </CardBody>
          </MotionCard>

          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            bg={cardBg}
            shadow="md"
            borderRadius="xl"
            overflow="hidden"
            borderTop="4px solid"
            borderTopColor="yellow.400"
          >
            <CardBody>
              <Flex justify="space-between" align="start">
                <Stat>
                  <StatLabel color="gray.500">Note moyenne</StatLabel>
                  <StatNumber fontSize="2xl" color="yellow.600">
                    {stats.averageRating > 0 ? `${stats.averageRating}/5` : '-'}
                  </StatNumber>
                  <StatHelpText>
                    {stats.totalReviews} avis clients
                  </StatHelpText>
                </Stat>
                <Box p={3} bg="yellow.50" borderRadius="full">
                  <Icon as={FiStar} boxSize={6} color="yellow.500" />
                </Box>
              </Flex>
            </CardBody>
          </MotionCard>
        </SimpleGrid>

        {/* Alertes */}
        {(outOfStockProducts > 0 || stats.pendingOrders > 0) && (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {outOfStockProducts > 0 && (
              <Box
                bg="red.50"
                p={4}
                borderRadius="xl"
                borderLeft="4px solid"
                borderLeftColor="red.400"
              >
                <HStack>
                  <Icon as={FiAlertCircle} color="red.500" boxSize={5} />
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="semibold" color="red.700">
                      {outOfStockProducts} produit(s) en rupture de stock
                    </Text>
                    <Text fontSize="sm" color="red.600">
                      Pensez à réapprovisionner vos stocks
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            )}
            {stats.pendingOrders > 0 && (
              <Box
                bg="orange.50"
                p={4}
                borderRadius="xl"
                borderLeft="4px solid"
                borderLeftColor="orange.400"
                cursor="pointer"
                onClick={() => navigate('/seller/orders')}
                _hover={{ bg: 'orange.100' }}
                transition="all 0.2s"
              >
                <HStack>
                  <Icon as={FiPackage} color="orange.500" boxSize={5} />
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="semibold" color="orange.700">
                      {stats.pendingOrders} commande(s) en attente
                    </Text>
                    <Text fontSize="sm" color="orange.600">
                      Cliquez pour gérer vos commandes
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            )}
          </SimpleGrid>
        )}

        {/* Grille principale */}
        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
          {/* Liste des produits */}
          <GridItem>
            <Box bg={cardBg} shadow="md" borderRadius="xl" overflow="hidden">
              <Flex p={4} borderBottom="1px" borderColor={borderColor} justify="space-between" align="center">
                <Heading size="md">Mes Produits</Heading>
                <Button
                  size="sm"
                  colorScheme="blue"
                  variant="ghost"
                  rightIcon={<ChevronRightIcon />}
                  onClick={() => navigate('/seller/products/new')}
                >
                  Ajouter
                </Button>
              </Flex>
              
              {products.length === 0 ? (
                <Box p={10} textAlign="center">
                  <Icon as={FiBox} boxSize={12} color="gray.300" mb={4} />
                  <Text color="gray.500" mb={4}>Vous n'avez pas encore de produits</Text>
                  <Button
                    colorScheme="blue"
                    leftIcon={<AddIcon />}
                    onClick={() => navigate('/seller/products/new')}
                  >
                    Ajouter mon premier produit
                  </Button>
                </Box>
              ) : (
                <Box overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead bg={tableHeaderBg}>
                      <Tr>
                        <Th>Produit</Th>
                        <Th isNumeric>Prix</Th>
                        <Th isNumeric>Stock</Th>
                        <Th>Statut</Th>
                        <Th></Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {products.slice(0, 5).map((product) => (
                        <Tr key={product.id} _hover={{ bg: hoverBg }}>
                          <Td>
                            <HStack>
                              {product.images && product.images[0] ? (
                                <Image
                                  src={product.images[0]}
                                  alt={product.name}
                                  boxSize="40px"
                                  objectFit="cover"
                                  borderRadius="md"
                                />
                              ) : (
                                <Box
                                  boxSize="40px"
                                  bg="gray.200"
                                  borderRadius="md"
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                >
                                  <Icon as={FiBox} color="gray.400" />
                                </Box>
                              )}
                              <VStack align="start" spacing={0}>
                                <Text fontWeight="medium" fontSize="sm">{product.name}</Text>
                                <Text fontSize="xs" color="gray.500">{getCategoryLabel(product.category)}</Text>
                              </VStack>
                            </HStack>
                          </Td>
                          <Td isNumeric fontWeight="bold">{product.price.toFixed(2)} €</Td>
                          <Td isNumeric>
                            <Badge colorScheme={product.stock_quantity > 0 ? 'green' : 'red'} fontSize="xs">
                              {product.stock_quantity}
                            </Badge>
                          </Td>
                          <Td>{getStatusBadge(product.status)}</Td>
                          <Td>
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                icon={<FiMoreVertical />}
                                variant="ghost"
                                size="sm"
                              />
                              <MenuList>
                                <MenuItem icon={<EditIcon />} onClick={() => navigate(`/seller/products/${product.id}/edit`)}>
                                  Modifier
                                </MenuItem>
                                <MenuItem icon={<FiEye />} onClick={() => navigate(`/products/${product.id}`)}>
                                  Voir
                                </MenuItem>
                                <MenuItem icon={<DeleteIcon />} color="red.500" onClick={() => handleDeleteClick(product)}>
                                  Supprimer
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                  {products.length > 5 && (
                    <Box p={3} textAlign="center" borderTop="1px" borderColor={borderColor}>
                      <Button size="sm" variant="ghost" colorScheme="blue">
                        Voir tous les produits ({products.length})
                      </Button>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </GridItem>

          {/* Commandes récentes */}
          <GridItem>
            <Box bg={cardBg} shadow="md" borderRadius="xl" overflow="hidden">
              <Flex p={4} borderBottom="1px" borderColor={borderColor} justify="space-between" align="center">
                <Heading size="md">Commandes récentes</Heading>
                <Button
                  size="sm"
                  colorScheme="blue"
                  variant="ghost"
                  rightIcon={<ChevronRightIcon />}
                  onClick={() => navigate('/seller/orders')}
                >
                  Tout voir
                </Button>
              </Flex>

              {stats.recentOrders.length === 0 ? (
                <Box p={8} textAlign="center">
                  <Icon as={FiPackage} boxSize={10} color="gray.300" mb={3} />
                  <Text color="gray.500">Aucune commande</Text>
                </Box>
              ) : (
                <VStack align="stretch" spacing={0} divider={<Divider />}>
                  {stats.recentOrders.map((order) => (
                    <Box
                      key={order.id}
                      p={4}
                      _hover={{ bg: hoverBg }}
                      cursor="pointer"
                      onClick={() => navigate('/seller/orders')}
                    >
                      <Flex justify="space-between" align="center">
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="semibold" fontSize="sm">
                            #{order.id?.slice(-6).toUpperCase()}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {order.seller_items?.length} article(s)
                          </Text>
                        </VStack>
                        <VStack align="end" spacing={1}>
                          <Text fontWeight="bold" color="blue.600" fontSize="sm">
                            {order.seller_total?.toFixed(2)} €
                          </Text>
                          <Badge colorScheme={getOrderStatusColor(order.status)} fontSize="xs">
                            {getOrderStatusLabel(order.status)}
                          </Badge>
                        </VStack>
                      </Flex>
                    </Box>
                  ))}
                </VStack>
              )}
            </Box>

            {/* Accès rapides */}
            <Box bg={cardBg} shadow="md" borderRadius="xl" overflow="hidden" mt={4}>
              <Box p={4} borderBottom="1px" borderColor={borderColor}>
                <Heading size="md">Accès rapides</Heading>
              </Box>
              <VStack align="stretch" spacing={0}>
                <Button
                  variant="ghost"
                  justifyContent="flex-start"
                  leftIcon={<Icon as={FiPackage} />}
                  rightIcon={<ChevronRightIcon />}
                  py={6}
                  onClick={() => navigate('/seller/orders')}
                  borderRadius={0}
                >
                  Gérer les commandes
                </Button>
                <Divider />
                <Button
                  variant="ghost"
                  justifyContent="flex-start"
                  leftIcon={<Icon as={FiStar} />}
                  rightIcon={<ChevronRightIcon />}
                  py={6}
                  onClick={() => navigate('/seller/reviews')}
                  borderRadius={0}
                >
                  Voir les avis clients
                </Button>
                <Divider />
                <Button
                  variant="ghost"
                  justifyContent="flex-start"
                  leftIcon={<Icon as={FiTrendingUp} />}
                  rightIcon={<ChevronRightIcon />}
                  py={6}
                  onClick={() => navigate('/seller/analytics')}
                  borderRadius={0}
                >
                  Statistiques détaillées
                </Button>
              </VStack>
            </Box>
          </GridItem>
        </Grid>
      </VStack>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Supprimer le produit
            </AlertDialogHeader>

            <AlertDialogBody>
              Êtes-vous sûr de vouloir supprimer le produit{' '}
              <strong>{productToDelete?.name}</strong> ? Cette action est
              irréversible.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Annuler
              </Button>
              <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}>
                Supprimer
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
};

export default SellerDashboard;
