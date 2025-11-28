import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Text,
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Spinner,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Progress,
  Divider,
  Flex,
  Icon,
  Select,
  useColorModeValue,
} from '@chakra-ui/react';
import { CheckCircleIcon, TimeIcon, WarningIcon, InfoIcon } from '@chakra-ui/icons';
import { FiTrendingUp, FiDollarSign, FiPackage, FiShoppingBag, FiStar } from 'react-icons/fi';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#667eea', '#48bb78', '#ed8936', '#e53e3e', '#38b2ac', '#9f7aea'];

const SellerAnalytics = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [shop, setShop] = useState(null);
  const [period, setPeriod] = useState('month');

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const itemBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Récupérer la boutique
      try {
        const shopResponse = await api.get('/shops/my-shop');
        setShop(shopResponse.data);
      } catch (e) {
        console.log('Pas de boutique');
      }
      
      // Récupérer les produits
      const productsResponse = await api.get('/products/seller/my-products');
      setProducts(productsResponse.data || []);
      
      // Récupérer les commandes
      const ordersResponse = await api.get('/seller/orders');
      setOrders(ordersResponse.data || []);

      // Récupérer les avis
      let reviewsData = { stats: { average: 0, total: 0, distribution: {} }, reviews: [] };
      try {
        const reviewsRes = await api.get(`/reviews/seller/${user?.id}`);
        reviewsData = reviewsRes.data;
      } catch (e) {
        console.log('Pas d\'avis');
      }
      
      // Calculer les analytics
      calculateAnalytics(productsResponse.data || [], ordersResponse.data || [], reviewsData);
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (productsData, ordersData, reviewsData) => {
    // Statistiques produits
    const totalProducts = productsData.length;
    const publishedProducts = productsData.filter(p => p.status === 'published').length;
    const draftProducts = productsData.filter(p => p.status === 'draft').length;
    const outOfStockProducts = productsData.filter(p => p.stock_quantity === 0).length;
    
    const totalStock = productsData.reduce((sum, p) => sum + (p.stock_quantity || 0), 0);
    const totalValue = productsData.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0);
    const avgPrice = totalProducts > 0 
      ? productsData.reduce((sum, p) => sum + p.price, 0) / totalProducts 
      : 0;

    // Produits par catégorie (pour le graphique)
    const byCategory = productsData.reduce((acc, p) => {
      const cat = getCategoryLabel(p.category);
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    const categoryData = Object.entries(byCategory).map(([name, value]) => ({
      name,
      value
    }));

    // Statistiques commandes
    const totalOrders = ordersData.length;
    const totalRevenue = ordersData.reduce((sum, o) => sum + (o.seller_total || 0), 0);
    const deliveredOrders = ordersData.filter(o => o.status === 'delivered').length;
    const pendingOrders = ordersData.filter(o => o.status === 'pending').length;

    // Données de ventes par jour (derniers 30 jours)
    const salesByDay = generateSalesData(ordersData);

    // Données de ventes par statut
    const ordersByStatus = [
      { name: 'En attente', value: ordersData.filter(o => o.status === 'pending').length, color: '#ECC94B' },
      { name: 'En cours', value: ordersData.filter(o => ['confirmed', 'processing'].includes(o.status)).length, color: '#4299E1' },
      { name: 'Expédiées', value: ordersData.filter(o => o.status === 'shipped').length, color: '#9F7AEA' },
      { name: 'Livrées', value: ordersData.filter(o => o.status === 'delivered').length, color: '#48BB78' },
      { name: 'Annulées', value: ordersData.filter(o => o.status === 'cancelled').length, color: '#F56565' },
    ].filter(item => item.value > 0);

    // Top produits
    const topProducts = [...productsData]
      .sort((a, b) => b.price - a.price)
      .slice(0, 5);

    // Produits à faible stock
    const lowStockProducts = productsData
      .filter(p => p.stock_quantity > 0 && p.stock_quantity <= 5)
      .sort((a, b) => a.stock_quantity - b.stock_quantity);

    // Revenus par mois
    const revenueByMonth = generateMonthlyRevenue(ordersData);

    setAnalytics({
      totalProducts,
      publishedProducts,
      draftProducts,
      outOfStockProducts,
      totalStock,
      totalValue,
      avgPrice,
      categoryData,
      topProducts,
      lowStockProducts,
      publishRate: totalProducts > 0 ? (publishedProducts / totalProducts) * 100 : 0,
      totalOrders,
      totalRevenue,
      deliveredOrders,
      pendingOrders,
      salesByDay,
      ordersByStatus,
      revenueByMonth,
      averageRating: reviewsData.stats?.average || 0,
      totalReviews: reviewsData.stats?.total || 0,
    });
  };

  const generateSalesData = (ordersData) => {
    const last30Days = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayOrders = ordersData.filter(o => {
        const orderDate = new Date(o.created_at).toISOString().split('T')[0];
        return orderDate === dateStr;
      });
      
      last30Days.push({
        date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        ventes: dayOrders.reduce((sum, o) => sum + (o.seller_total || 0), 0),
        commandes: dayOrders.length,
      });
    }
    
    return last30Days;
  };

  const generateMonthlyRevenue = (ordersData) => {
    const months = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthStr = date.toLocaleDateString('fr-FR', { month: 'short' });
      
      const monthOrders = ordersData.filter(o => {
        const orderDate = new Date(o.created_at);
        return orderDate.getMonth() === date.getMonth() && 
               orderDate.getFullYear() === date.getFullYear();
      });
      
      months.push({
        month: monthStr,
        revenus: monthOrders.reduce((sum, o) => sum + (o.seller_total || 0), 0),
        commandes: monthOrders.length,
      });
    }
    
    return months;
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

  if (loading) {
    return (
      <Container maxW="container.xl" py={10}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Chargement des analytics...</Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={6}>
      <VStack spacing={6} align="stretch">
        {/* En-tête */}
        <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
          <Box>
            <Heading size="lg" mb={1}>
              <HStack>
                <Icon as={FiTrendingUp} color="blue.500" />
                <Text>Analytics</Text>
              </HStack>
            </Heading>
            <Text color="gray.500">{shop?.name || 'Ma boutique'}</Text>
          </Box>
          <Select
            w="150px"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            bg={cardBg}
          >
            <option value="week">7 jours</option>
            <option value="month">30 jours</option>
            <option value="year">Cette année</option>
          </Select>
        </Flex>

        {/* Statistiques principales */}
        <SimpleGrid columns={{ base: 2, lg: 5 }} spacing={4}>
          <Card bg={cardBg} shadow="md" borderRadius="xl" borderTop="4px solid" borderTopColor="green.400">
            <CardBody>
              <Flex justify="space-between" align="start">
                <Stat>
                  <StatLabel color="gray.500">Revenus</StatLabel>
                  <StatNumber fontSize="xl" color="green.500">
                    {analytics?.totalRevenue?.toFixed(0) || 0} €
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    Ce mois
                  </StatHelpText>
                </Stat>
                <Box p={2} bg="green.100" borderRadius="full">
                  <Icon as={FiDollarSign} boxSize={5} color="green.500" />
                </Box>
              </Flex>
            </CardBody>
          </Card>

          <Card bg={cardBg} shadow="md" borderRadius="xl" borderTop="4px solid" borderTopColor="blue.400">
            <CardBody>
              <Flex justify="space-between" align="start">
                <Stat>
                  <StatLabel color="gray.500">Commandes</StatLabel>
                  <StatNumber fontSize="xl" color="blue.500">
                    {analytics?.totalOrders || 0}
                  </StatNumber>
                  <StatHelpText>
                    {analytics?.pendingOrders || 0} en attente
                  </StatHelpText>
                </Stat>
                <Box p={2} bg="blue.100" borderRadius="full">
                  <Icon as={FiPackage} boxSize={5} color="blue.500" />
                </Box>
              </Flex>
            </CardBody>
          </Card>

          <Card bg={cardBg} shadow="md" borderRadius="xl" borderTop="4px solid" borderTopColor="purple.400">
            <CardBody>
              <Flex justify="space-between" align="start">
                <Stat>
                  <StatLabel color="gray.500">Produits</StatLabel>
                  <StatNumber fontSize="xl" color="purple.500">
                    {analytics?.totalProducts || 0}
                  </StatNumber>
                  <StatHelpText>
                    {analytics?.publishedProducts || 0} publiés
                  </StatHelpText>
                </Stat>
                <Box p={2} bg="purple.100" borderRadius="full">
                  <Icon as={FiShoppingBag} boxSize={5} color="purple.500" />
                </Box>
              </Flex>
            </CardBody>
          </Card>

          <Card bg={cardBg} shadow="md" borderRadius="xl" borderTop="4px solid" borderTopColor="yellow.400">
            <CardBody>
              <Flex justify="space-between" align="start">
                <Stat>
                  <StatLabel color="gray.500">Note moyenne</StatLabel>
                  <StatNumber fontSize="xl" color="yellow.500">
                    {analytics?.averageRating?.toFixed(1) || '-'}/5
                  </StatNumber>
                  <StatHelpText>
                    {analytics?.totalReviews || 0} avis
                  </StatHelpText>
                </Stat>
                <Box p={2} bg="yellow.100" borderRadius="full">
                  <Icon as={FiStar} boxSize={5} color="yellow.500" />
                </Box>
              </Flex>
            </CardBody>
          </Card>

          <Card bg={cardBg} shadow="md" borderRadius="xl" borderTop="4px solid" borderTopColor="red.400">
            <CardBody>
              <Flex justify="space-between" align="start">
                <Stat>
                  <StatLabel color="gray.500">Rupture stock</StatLabel>
                  <StatNumber fontSize="xl" color="red.500">
                    {analytics?.outOfStockProducts || 0}
                  </StatNumber>
                  <StatHelpText>
                    À réapprovisionner
                  </StatHelpText>
                </Stat>
                <Box p={2} bg="red.100" borderRadius="full">
                  <Icon as={WarningIcon} boxSize={5} color="red.500" />
                </Box>
              </Flex>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Graphique des ventes */}
        <Card bg={cardBg} shadow="md" borderRadius="xl">
          <CardHeader>
            <Heading size="md">Évolution des ventes (30 derniers jours)</Heading>
          </CardHeader>
          <CardBody>
            <Box h="300px">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.salesByDay || []}>
                  <defs>
                    <linearGradient id="colorVentes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                    formatter={(value) => [`${value} €`, 'Ventes']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="ventes" 
                    stroke="#667eea" 
                    fillOpacity={1} 
                    fill="url(#colorVentes)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </CardBody>
        </Card>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {/* Revenus par mois */}
          <Card bg={cardBg} shadow="md" borderRadius="xl">
            <CardHeader>
              <Heading size="md">Revenus mensuels</Heading>
            </CardHeader>
            <CardBody>
              <Box h="250px">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.revenueByMonth || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                      formatter={(value) => [`${value} €`, 'Revenus']}
                    />
                    <Bar dataKey="revenus" fill="#48bb78" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardBody>
          </Card>

          {/* Répartition des commandes */}
          <Card bg={cardBg} shadow="md" borderRadius="xl">
            <CardHeader>
              <Heading size="md">Statut des commandes</Heading>
            </CardHeader>
            <CardBody>
              <Box h="250px">
                {analytics?.ordersByStatus?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.ordersByStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {analytics.ordersByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Flex h="100%" align="center" justify="center">
                    <Text color="gray.500">Aucune commande</Text>
                  </Flex>
                )}
              </Box>
            </CardBody>
          </Card>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {/* Produits par catégorie */}
          <Card bg={cardBg} shadow="md" borderRadius="xl">
            <CardHeader>
              <Heading size="md">Produits par catégorie</Heading>
            </CardHeader>
            <CardBody>
              <Box h="250px">
                {analytics?.categoryData?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {analytics.categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Flex h="100%" align="center" justify="center">
                    <Text color="gray.500">Aucun produit</Text>
                  </Flex>
                )}
              </Box>
            </CardBody>
          </Card>

          {/* Stock faible */}
          <Card bg={cardBg} shadow="md" borderRadius="xl">
            <CardHeader>
              <Heading size="md">⚠️ Alertes stock</Heading>
            </CardHeader>
            <CardBody>
              {analytics?.lowStockProducts?.length > 0 ? (
                <VStack align="stretch" spacing={3}>
                  {analytics.lowStockProducts.slice(0, 5).map((product) => (
                    <Flex key={product.id} justify="space-between" align="center" p={3} bg={itemBg} borderRadius="lg">
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium">{product.name}</Text>
                        <Text fontSize="sm" color="gray.500">{getCategoryLabel(product.category)}</Text>
                      </VStack>
                      <Badge colorScheme="orange" fontSize="md" px={3} py={1}>
                        {product.stock_quantity} restants
                      </Badge>
                    </Flex>
                  ))}
                </VStack>
              ) : (
                <Flex h="200px" align="center" justify="center">
                  <VStack>
                    <Icon as={CheckCircleIcon} boxSize={10} color="green.400" />
                    <Text color="gray.500">Tous les stocks sont OK</Text>
                  </VStack>
                </Flex>
              )}
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Top produits */}
        <Card bg={cardBg} shadow="md" borderRadius="xl">
          <CardHeader>
            <Heading size="md">Top 5 produits (par prix)</Heading>
          </CardHeader>
          <CardBody>
            {analytics?.topProducts?.length > 0 ? (
              <Table>
                <Thead>
                  <Tr>
                    <Th>#</Th>
                    <Th>Produit</Th>
                    <Th>Catégorie</Th>
                    <Th isNumeric>Prix</Th>
                    <Th isNumeric>Stock</Th>
                    <Th>Statut</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {analytics.topProducts.map((product, index) => (
                    <Tr key={product.id}>
                      <Td fontWeight="bold" color="blue.500">{index + 1}</Td>
                      <Td fontWeight="medium">{product.name}</Td>
                      <Td>
                        <Badge colorScheme="blue">{getCategoryLabel(product.category)}</Badge>
                      </Td>
                      <Td isNumeric fontWeight="bold" color="green.500">{product.price.toFixed(2)} €</Td>
                      <Td isNumeric>{product.stock_quantity}</Td>
                      <Td>
                        <Badge colorScheme={product.status === 'published' ? 'green' : 'gray'}>
                          {product.status === 'published' ? 'Publié' : 'Brouillon'}
                        </Badge>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            ) : (
              <Text color="gray.500">Aucun produit</Text>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default SellerAnalytics;
