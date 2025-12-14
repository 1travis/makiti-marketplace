import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Button,
  Icon,
  Flex,
  Avatar,
  Badge,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
  Divider,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  Grid,
  GridItem,
  Image,
  CircularProgress,
  CircularProgressLabel,
} from '@chakra-ui/react';
import {
  FiPackage,
  FiDollarSign,
  FiStar,
  FiTrendingUp,
  FiShoppingBag,
  FiUsers,
  FiClock,
  FiCheck,
  FiAlertCircle,
  FiArrowRight,
  FiPlus,
  FiEye,
  FiMessageSquare,
  FiBarChart2,
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import api from '../api/axios';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const SellerHomePage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    publishedProducts: 0,
    averageRating: 0,
    totalReviews: 0,
    unrepliedReviews: 0,
    recentOrders: [],
    topProducts: [],
  });
  const [shop, setShop] = useState(null);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const itemBg = useColorModeValue('gray.50', 'gray.700');
  const itemHoverBg = useColorModeValue('gray.100', 'gray.600');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Récupérer la boutique
      const shopRes = await api.get('/shops/my-shop');
      setShop(shopRes.data);

      // Récupérer les commandes
      const ordersRes = await api.get('/seller/orders');
      const orders = ordersRes.data || [];

      // Récupérer les produits
      const productsRes = await api.get('/seller/products');
      const products = productsRes.data || [];

      // Récupérer les avis
      let reviewsData = { stats: { average: 0, total: 0 }, reviews: [] };
      try {
        const reviewsRes = await api.get(`/reviews/seller/${user?.id}`);
        reviewsData = reviewsRes.data;
      } catch (e) {
        console.log('Pas d\'avis');
      }

      // Calculer les statistiques
      const totalRevenue = orders.reduce((sum, o) => sum + (o.seller_total || 0), 0);
      const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
      const unrepliedReviews = reviewsData.reviews?.filter(r => !r.seller_reply).length || 0;

      // Top produits (par nombre de ventes simulé)
      const topProducts = products.slice(0, 4).map(p => ({
        ...p,
        sales: Math.floor(Math.random() * 50) + 1 // Simulé pour l'exemple
      }));

      setStats({
        totalRevenue,
        totalOrders: orders.length,
        pendingOrders,
        totalProducts: products.length,
        publishedProducts: products.filter(p => p.status === 'published').length,
        averageRating: reviewsData.stats?.average || 0,
        totalReviews: reviewsData.stats?.total || 0,
        unrepliedReviews,
        recentOrders: orders.slice(0, 5),
        topProducts,
      });
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'yellow',
      processing: 'blue',
      shipped: 'purple',
      delivered: 'green',
      cancelled: 'red'
    };
    return colors[status] || 'gray';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'En attente',
      processing: 'En cours',
      shipped: 'Expédié',
      delivered: 'Livré',
      cancelled: 'Annulé'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={10}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Chargement de votre espace vendeur...</Text>
        </VStack>
      </Container>
    );
  }

  // Si pas de boutique
  if (!shop) {
    return (
      <Container maxW="container.xl" py={10}>
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <VStack spacing={8} textAlign="center" bg={cardBg} p={10} borderRadius="2xl" shadow="xl">
            <Icon as={FiShoppingBag} boxSize={24} color="blue.400" />
            <Heading size="xl">Bienvenue sur votre espace vendeur</Heading>
            <Text color="gray.600" maxW="lg" fontSize="lg">
              Créez votre boutique pour commencer à vendre vos produits et services.
              Rejoignez notre communauté de vendeurs !
            </Text>
            <Button
              colorScheme="blue"
              size="lg"
              leftIcon={<FiPlus />}
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
    <Box bg={bgColor} minH="100vh" py={6}>
      <Container maxW="container.xl">
        <VStack spacing={6} align="stretch">
          {/* En-tête de bienvenue */}
          <MotionBox
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box
              bgGradient="linear(135deg, #667eea 0%, #764ba2 100%)"
              p={8}
              borderRadius="2xl"
              color="white"
              position="relative"
              overflow="hidden"
            >
              {/* Motif décoratif */}
              <Box
                position="absolute"
                right="-50px"
                top="-50px"
                w="200px"
                h="200px"
                bg="whiteAlpha.100"
                borderRadius="full"
              />
              <Box
                position="absolute"
                right="100px"
                bottom="-30px"
                w="100px"
                h="100px"
                bg="whiteAlpha.100"
                borderRadius="full"
              />

              <Flex justify="space-between" align="center" flexWrap="wrap" gap={4} position="relative">
                <HStack spacing={4}>
                  <Avatar name={shop?.name} size="xl" bg="whiteAlpha.300" />
                  <VStack align="start" spacing={1}>
                    <Text fontSize="lg" opacity={0.9}>{getGreeting()},</Text>
                    <Heading size="xl">{user?.full_name || 'Vendeur'}</Heading>
                    <HStack>
                      <Badge colorScheme="green" variant="solid" fontSize="sm">
                        {shop?.name}
                      </Badge>
                      {stats.averageRating > 0 && (
                        <Badge colorScheme="yellow" variant="solid" fontSize="sm">
                          ⭐ {stats.averageRating.toFixed(1)}
                        </Badge>
                      )}
                    </HStack>
                  </VStack>
                </HStack>

                <VStack align="end" spacing={2}>
                  <Text fontSize="sm" opacity={0.8}>
                    {new Date().toLocaleDateString('fr-FR', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long' 
                    })}
                  </Text>
                  <Button
                    colorScheme="whiteAlpha"
                    leftIcon={<FiPlus />}
                    onClick={() => navigate('/seller/products/new')}
                    _hover={{ bg: 'whiteAlpha.300' }}
                  >
                    Nouveau produit
                  </Button>
                </VStack>
              </Flex>
            </Box>
          </MotionBox>

          {/* Alertes importantes */}
          {(stats.pendingOrders > 0 || stats.unrepliedReviews > 0) && (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {stats.pendingOrders > 0 && (
                <Alert
                  status="warning"
                  variant="left-accent"
                  borderRadius="xl"
                  cursor="pointer"
                  onClick={() => navigate('/seller/orders')}
                  _hover={{ bg: 'orange.100' }}
                >
                  <AlertIcon />
                  <Box>
                    <Text fontWeight="bold">{stats.pendingOrders} commande(s) en attente</Text>
                    <Text fontSize="sm">Cliquez pour les traiter</Text>
                  </Box>
                </Alert>
              )}
              {stats.unrepliedReviews > 0 && (
                <Alert
                  status="info"
                  variant="left-accent"
                  borderRadius="xl"
                  cursor="pointer"
                  onClick={() => navigate('/seller/reviews')}
                  _hover={{ bg: 'blue.100' }}
                >
                  <AlertIcon />
                  <Box>
                    <Text fontWeight="bold">{stats.unrepliedReviews} avis sans réponse</Text>
                    <Text fontSize="sm">Répondez à vos clients</Text>
                  </Box>
                </Alert>
              )}
            </SimpleGrid>
          )}

          {/* Statistiques principales */}
          <SimpleGrid columns={{ base: 2, lg: 4 }} spacing={4}>
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              bg={cardBg}
              shadow="md"
              borderRadius="xl"
              overflow="hidden"
              _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
              transition="all 0.2s"
              cursor="pointer"
              onClick={() => navigate('/seller/analytics')}
            >
              <CardBody>
                <Flex justify="space-between" align="start">
                  <Stat>
                    <StatLabel color="gray.500" fontSize="sm">Revenus totaux</StatLabel>
                    <StatNumber fontSize="2xl" color="green.500">
                      {stats.totalRevenue.toFixed(0)} €
                    </StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      Ce mois
                    </StatHelpText>
                  </Stat>
                  <Box p={3} bg="green.100" borderRadius="full">
                    <Icon as={FiDollarSign} boxSize={6} color="green.500" />
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
              _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
              cursor="pointer"
              onClick={() => navigate('/seller/orders')}
            >
              <CardBody>
                <Flex justify="space-between" align="start">
                  <Stat>
                    <StatLabel color="gray.500" fontSize="sm">Commandes</StatLabel>
                    <StatNumber fontSize="2xl" color="blue.500">
                      {stats.totalOrders}
                    </StatNumber>
                    <StatHelpText>
                      {stats.pendingOrders > 0 ? (
                        <Badge colorScheme="orange">{stats.pendingOrders} en attente</Badge>
                      ) : (
                        <Text color="green.500">Tout à jour ✓</Text>
                      )}
                    </StatHelpText>
                  </Stat>
                  <Box p={3} bg="blue.100" borderRadius="full">
                    <Icon as={FiPackage} boxSize={6} color="blue.500" />
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
              _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
              cursor="pointer"
              onClick={() => navigate('/seller/dashboard')}
            >
              <CardBody>
                <Flex justify="space-between" align="start">
                  <Stat>
                    <StatLabel color="gray.500" fontSize="sm">Produits</StatLabel>
                    <StatNumber fontSize="2xl" color="purple.500">
                      {stats.totalProducts}
                    </StatNumber>
                    <StatHelpText>
                      <Badge colorScheme="green">{stats.publishedProducts} publiés</Badge>
                    </StatHelpText>
                  </Stat>
                  <Box p={3} bg="purple.100" borderRadius="full">
                    <Icon as={FiShoppingBag} boxSize={6} color="purple.500" />
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
              _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
              cursor="pointer"
              onClick={() => navigate('/seller/reviews')}
            >
              <CardBody>
                <Flex justify="space-between" align="start">
                  <Stat>
                    <StatLabel color="gray.500" fontSize="sm">Note moyenne</StatLabel>
                    <StatNumber fontSize="2xl" color="yellow.500">
                      {stats.averageRating > 0 ? `${stats.averageRating.toFixed(1)}/5` : '-'}
                    </StatNumber>
                    <StatHelpText>
                      {stats.totalReviews} avis
                    </StatHelpText>
                  </Stat>
                  <Box p={3} bg="yellow.100" borderRadius="full">
                    <Icon as={FiStar} boxSize={6} color="yellow.500" />
                  </Box>
                </Flex>
              </CardBody>
            </MotionCard>
          </SimpleGrid>

          {/* Grille principale */}
          <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
            {/* Commandes récentes */}
            <GridItem>
              <Card bg={cardBg} shadow="md" borderRadius="xl">
                <CardBody>
                  <Flex justify="space-between" align="center" mb={4}>
                    <HStack>
                      <Icon as={FiPackage} color="blue.500" />
                      <Heading size="md">Commandes récentes</Heading>
                    </HStack>
                    <Button
                      size="sm"
                      variant="ghost"
                      colorScheme="blue"
                      rightIcon={<FiArrowRight />}
                      onClick={() => navigate('/seller/orders')}
                    >
                      Tout voir
                    </Button>
                  </Flex>

                  {stats.recentOrders.length === 0 ? (
                    <VStack py={8} spacing={3}>
                      <Icon as={FiPackage} boxSize={12} color="gray.300" />
                      <Text color="gray.500">Aucune commande pour le moment</Text>
                    </VStack>
                  ) : (
                    <VStack align="stretch" spacing={3}>
                      {stats.recentOrders.map((order) => (
                        <Box
                          key={order.id}
                          p={4}
                          bg={itemBg}
                          borderRadius="lg"
                          _hover={{ bg: itemHoverBg }}
                          cursor="pointer"
                          onClick={() => navigate('/seller/orders')}
                        >
                          <Flex justify="space-between" align="center">
                            <HStack spacing={3}>
                              <Box
                                p={2}
                                bg={`${getStatusColor(order.status)}.100`}
                                borderRadius="lg"
                              >
                                <Icon as={order.status === 'delivered' ? FiCheck : FiClock} 
                                  color={`${getStatusColor(order.status)}.500`} 
                                />
                              </Box>
                              <VStack align="start" spacing={0}>
                                <Text fontWeight="bold">#{order.id?.slice(-6).toUpperCase()}</Text>
                                <Text fontSize="sm" color="gray.500">
                                  {order.seller_items?.length} article(s) • {order.shipping_address?.full_name}
                                </Text>
                              </VStack>
                            </HStack>
                            <VStack align="end" spacing={0}>
                              <Text fontWeight="bold" color="blue.600">
                                {order.seller_total?.toFixed(2)} €
                              </Text>
                              <Badge colorScheme={getStatusColor(order.status)} fontSize="xs">
                                {getStatusLabel(order.status)}
                              </Badge>
                            </VStack>
                          </Flex>
                        </Box>
                      ))}
                    </VStack>
                  )}
                </CardBody>
              </Card>
            </GridItem>

            {/* Actions rapides et performance */}
            <GridItem>
              <VStack spacing={4} align="stretch">
                {/* Performance */}
                <Card bg={cardBg} shadow="md" borderRadius="xl">
                  <CardBody>
                    <HStack mb={4}>
                      <Icon as={FiTrendingUp} color="green.500" />
                      <Heading size="md">Performance</Heading>
                    </HStack>

                    <VStack spacing={4} align="stretch">
                      <Box>
                        <Flex justify="space-between" mb={2}>
                          <Text fontSize="sm" color="gray.500">Taux de satisfaction</Text>
                          <Text fontWeight="bold" color="green.500">
                            {stats.averageRating > 0 ? `${((stats.averageRating / 5) * 100).toFixed(0)}%` : '-'}
                          </Text>
                        </Flex>
                        <Progress 
                          value={stats.averageRating > 0 ? (stats.averageRating / 5) * 100 : 0} 
                          colorScheme="green" 
                          borderRadius="full"
                          size="sm"
                        />
                      </Box>

                      <Box>
                        <Flex justify="space-between" mb={2}>
                          <Text fontSize="sm" color="gray.500">Produits publiés</Text>
                          <Text fontWeight="bold" color="purple.500">
                            {stats.totalProducts > 0 ? `${((stats.publishedProducts / stats.totalProducts) * 100).toFixed(0)}%` : '0%'}
                          </Text>
                        </Flex>
                        <Progress 
                          value={stats.totalProducts > 0 ? (stats.publishedProducts / stats.totalProducts) * 100 : 0} 
                          colorScheme="purple" 
                          borderRadius="full"
                          size="sm"
                        />
                      </Box>

                      <Box>
                        <Flex justify="space-between" mb={2}>
                          <Text fontSize="sm" color="gray.500">Avis répondus</Text>
                          <Text fontWeight="bold" color="blue.500">
                            {stats.totalReviews > 0 
                              ? `${(((stats.totalReviews - stats.unrepliedReviews) / stats.totalReviews) * 100).toFixed(0)}%` 
                              : '-'}
                          </Text>
                        </Flex>
                        <Progress 
                          value={stats.totalReviews > 0 ? ((stats.totalReviews - stats.unrepliedReviews) / stats.totalReviews) * 100 : 0} 
                          colorScheme="blue" 
                          borderRadius="full"
                          size="sm"
                        />
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Actions rapides */}
                <Card bg={cardBg} shadow="md" borderRadius="xl">
                  <CardBody>
                    <Heading size="md" mb={4}>Actions rapides</Heading>
                    <VStack spacing={2} align="stretch">
                      <Button
                        variant="ghost"
                        justifyContent="flex-start"
                        leftIcon={<Icon as={FiPlus} color="blue.500" />}
                        rightIcon={<FiArrowRight />}
                        onClick={() => navigate('/seller/products/new')}
                        py={6}
                      >
                        Ajouter un produit
                      </Button>
                      <Divider />
                      <Button
                        variant="ghost"
                        justifyContent="flex-start"
                        leftIcon={<Icon as={FiPackage} color="green.500" />}
                        rightIcon={<FiArrowRight />}
                        onClick={() => navigate('/seller/orders')}
                        py={6}
                      >
                        Gérer les commandes
                      </Button>
                      <Divider />
                      <Button
                        variant="ghost"
                        justifyContent="flex-start"
                        leftIcon={<Icon as={FiMessageSquare} color="purple.500" />}
                        rightIcon={<FiArrowRight />}
                        onClick={() => navigate('/seller/reviews')}
                        py={6}
                      >
                        Répondre aux avis
                      </Button>
                      <Divider />
                      <Button
                        variant="ghost"
                        justifyContent="flex-start"
                        leftIcon={<Icon as={FiBarChart2} color="orange.500" />}
                        rightIcon={<FiArrowRight />}
                        onClick={() => navigate('/seller/analytics')}
                        py={6}
                      >
                        Voir les statistiques
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </GridItem>
          </Grid>

          {/* Mes produits populaires */}
          {stats.topProducts.length > 0 && (
            <Card bg={cardBg} shadow="md" borderRadius="xl">
              <CardBody>
                <Flex justify="space-between" align="center" mb={4}>
                  <HStack>
                    <Icon as={FiTrendingUp} color="orange.500" />
                    <Heading size="md">Mes produits</Heading>
                  </HStack>
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="blue"
                    rightIcon={<FiArrowRight />}
                    onClick={() => navigate('/seller/dashboard')}
                  >
                    Tout voir
                  </Button>
                </Flex>

                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                  {stats.topProducts.map((product) => (
                    <Box
                      key={product.id}
                      p={4}
                      bg={itemBg}
                      borderRadius="xl"
                      _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
                      transition="all 0.2s"
                      cursor="pointer"
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      <Image
                        src={product.images?.[0] || 'https://via.placeholder.com/150'}
                        alt={product.name}
                        borderRadius="lg"
                        h="120px"
                        w="100%"
                        objectFit="cover"
                        mb={3}
                      />
                      <Text fontWeight="bold" fontSize="sm" noOfLines={1}>{product.name}</Text>
                      <Flex justify="space-between" align="center" mt={2}>
                        <Text color="blue.600" fontWeight="bold">{product.price?.toFixed(2)} €</Text>
                        <Badge colorScheme={product.stock_quantity > 0 ? 'green' : 'red'} fontSize="xs">
                          Stock: {product.stock_quantity}
                        </Badge>
                      </Flex>
                    </Box>
                  ))}
                </SimpleGrid>
              </CardBody>
            </Card>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default SellerHomePage;
