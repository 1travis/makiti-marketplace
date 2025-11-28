import { useEffect, useState } from 'react';
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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  Icon,
  Avatar,
  useColorModeValue,
  Select,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { CheckCircleIcon, TimeIcon, WarningIcon, InfoIcon } from '@chakra-ui/icons';
import { FiUsers, FiShoppingBag, FiDollarSign, FiTrendingUp, FiPackage, FiUserCheck, FiUserX } from 'react-icons/fi';
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
  ComposedChart,
} from 'recharts';

const COLORS = ['#667eea', '#48bb78', '#ed8936', '#e53e3e', '#38b2ac', '#9f7aea'];

const AdminAnalytics = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Récupérer les utilisateurs
      const usersResponse = await api.get('/admin/users');
      setUsers(usersResponse.data || []);
      
      // Récupérer tous les produits publiés
      const productsResponse = await api.get('/products');
      setProducts(productsResponse.data || []);

      // Récupérer toutes les commandes (si endpoint disponible)
      let ordersData = [];
      try {
        const ordersResponse = await api.get('/admin/orders');
        ordersData = ordersResponse.data || [];
      } catch (e) {
        console.log('Pas d\'accès aux commandes admin');
      }
      setOrders(ordersData);
      
      // Calculer les analytics
      calculateAnalytics(usersResponse.data || [], productsResponse.data || [], ordersData);
    } catch (error) {
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

  const calculateAnalytics = (usersData, productsData, ordersData) => {
    // Statistiques utilisateurs
    const totalUsers = usersData.length;
    const customers = usersData.filter(u => u.role === 'customer').length;
    const sellers = usersData.filter(u => u.role === 'seller').length;
    const admins = usersData.filter(u => u.role === 'admin').length;
    
    const pendingSellers = usersData.filter(u => u.seller_approval_status === 'pending').length;
    const approvedSellers = usersData.filter(u => u.seller_approval_status === 'approved').length;
    const rejectedSellers = usersData.filter(u => u.seller_approval_status === 'rejected').length;

    // Statistiques produits
    const totalProducts = productsData.length;
    const totalStock = productsData.reduce((sum, p) => sum + (p.stock_quantity || 0), 0);
    const totalValue = productsData.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0);
    const avgPrice = totalProducts > 0 
      ? productsData.reduce((sum, p) => sum + p.price, 0) / totalProducts 
      : 0;
    const outOfStock = productsData.filter(p => p.stock_quantity === 0).length;

    // Produits par catégorie (pour graphique)
    const byCategory = productsData.reduce((acc, p) => {
      const cat = getCategoryLabel(p.category);
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    const categoryData = Object.entries(byCategory).map(([name, value]) => ({
      name,
      value
    }));

    // Répartition des utilisateurs
    const userDistribution = [
      { name: 'Clients', value: customers, color: '#4299E1' },
      { name: 'Vendeurs', value: sellers, color: '#48BB78' },
      { name: 'Admins', value: admins, color: '#E53E3E' },
    ].filter(item => item.value > 0);

    // Inscriptions par mois (derniers 6 mois)
    const registrationsByMonth = generateMonthlyRegistrations(usersData);

    // Utilisateurs récents
    const recentUsers = [...usersData]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10);

    // Statistiques commandes
    const totalOrders = ordersData.length;
    const totalRevenue = ordersData.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const ordersByStatus = [
      { name: 'En attente', value: ordersData.filter(o => o.status === 'pending').length, color: '#ECC94B' },
      { name: 'En cours', value: ordersData.filter(o => ['confirmed', 'processing'].includes(o.status)).length, color: '#4299E1' },
      { name: 'Livrées', value: ordersData.filter(o => o.status === 'delivered').length, color: '#48BB78' },
      { name: 'Annulées', value: ordersData.filter(o => o.status === 'cancelled').length, color: '#F56565' },
    ].filter(item => item.value > 0);

    // Revenus par mois
    const revenueByMonth = generateMonthlyRevenue(ordersData);

    setAnalytics({
      // Users
      totalUsers,
      customers,
      sellers,
      admins,
      pendingSellers,
      approvedSellers,
      rejectedSellers,
      userDistribution,
      registrationsByMonth,
      // Products
      totalProducts,
      totalStock,
      totalValue,
      avgPrice,
      outOfStock,
      categoryData,
      recentUsers,
      // Orders
      totalOrders,
      totalRevenue,
      ordersByStatus,
      revenueByMonth,
    });
  };

  const generateMonthlyRegistrations = (usersData) => {
    const months = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthStr = date.toLocaleDateString('fr-FR', { month: 'short' });
      
      const monthUsers = usersData.filter(u => {
        const userDate = new Date(u.created_at);
        return userDate.getMonth() === date.getMonth() && 
               userDate.getFullYear() === date.getFullYear();
      });
      
      months.push({
        month: monthStr,
        clients: monthUsers.filter(u => u.role === 'customer').length,
        vendeurs: monthUsers.filter(u => u.role === 'seller').length,
        total: monthUsers.length,
      });
    }
    
    return months;
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
        revenus: monthOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
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

  const getRoleBadge = (role) => {
    const config = {
      admin: { color: 'red', label: 'Admin' },
      seller: { color: 'green', label: 'Vendeur' },
      customer: { color: 'blue', label: 'Client' },
    };
    const c = config[role] || { color: 'gray', label: role };
    return <Badge colorScheme={c.color}>{c.label}</Badge>;
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
                <Text>Analytics Plateforme</Text>
              </HStack>
            </Heading>
            <Text color="gray.500">Vue d'ensemble complète</Text>
          </Box>
        </Flex>

        {/* Statistiques principales */}
        <SimpleGrid columns={{ base: 2, lg: 4 }} spacing={4}>
          <Card bg={cardBg} shadow="md" borderRadius="xl" borderTop="4px solid" borderTopColor="blue.400">
            <CardBody>
              <Flex justify="space-between" align="start">
                <Stat>
                  <StatLabel color="gray.500">Utilisateurs</StatLabel>
                  <StatNumber fontSize="2xl" color="blue.500">
                    {analytics?.totalUsers || 0}
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    Total inscrits
                  </StatHelpText>
                </Stat>
                <Box p={3} bg="blue.100" borderRadius="full">
                  <Icon as={FiUsers} boxSize={6} color="blue.500" />
                </Box>
              </Flex>
            </CardBody>
          </Card>

          <Card bg={cardBg} shadow="md" borderRadius="xl" borderTop="4px solid" borderTopColor="green.400">
            <CardBody>
              <Flex justify="space-between" align="start">
                <Stat>
                  <StatLabel color="gray.500">Vendeurs</StatLabel>
                  <StatNumber fontSize="2xl" color="green.500">
                    {analytics?.sellers || 0}
                  </StatNumber>
                  <StatHelpText>
                    {analytics?.pendingSellers > 0 && (
                      <Badge colorScheme="orange">{analytics.pendingSellers} en attente</Badge>
                    )}
                  </StatHelpText>
                </Stat>
                <Box p={3} bg="green.100" borderRadius="full">
                  <Icon as={FiUserCheck} boxSize={6} color="green.500" />
                </Box>
              </Flex>
            </CardBody>
          </Card>

          <Card bg={cardBg} shadow="md" borderRadius="xl" borderTop="4px solid" borderTopColor="purple.400">
            <CardBody>
              <Flex justify="space-between" align="start">
                <Stat>
                  <StatLabel color="gray.500">Produits</StatLabel>
                  <StatNumber fontSize="2xl" color="purple.500">
                    {analytics?.totalProducts || 0}
                  </StatNumber>
                  <StatHelpText>
                    Valeur: {analytics?.totalValue?.toFixed(0) || 0} €
                  </StatHelpText>
                </Stat>
                <Box p={3} bg="purple.100" borderRadius="full">
                  <Icon as={FiShoppingBag} boxSize={6} color="purple.500" />
                </Box>
              </Flex>
            </CardBody>
          </Card>

          <Card bg={cardBg} shadow="md" borderRadius="xl" borderTop="4px solid" borderTopColor="orange.400">
            <CardBody>
              <Flex justify="space-between" align="start">
                <Stat>
                  <StatLabel color="gray.500">Commandes</StatLabel>
                  <StatNumber fontSize="2xl" color="orange.500">
                    {analytics?.totalOrders || 0}
                  </StatNumber>
                  <StatHelpText>
                    {analytics?.totalRevenue?.toFixed(0) || 0} € de CA
                  </StatHelpText>
                </Stat>
                <Box p={3} bg="orange.100" borderRadius="full">
                  <Icon as={FiPackage} boxSize={6} color="orange.500" />
                </Box>
              </Flex>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Graphique inscriptions */}
        <Card bg={cardBg} shadow="md" borderRadius="xl">
          <CardHeader>
            <Heading size="md">Inscriptions mensuelles</Heading>
          </CardHeader>
          <CardBody>
            <Box h="300px">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={analytics?.registrationsByMonth || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                  />
                  <Legend />
                  <Bar dataKey="clients" name="Clients" fill="#4299E1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="vendeurs" name="Vendeurs" fill="#48BB78" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="total" name="Total" stroke="#667eea" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </Box>
          </CardBody>
        </Card>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {/* Répartition utilisateurs */}
          <Card bg={cardBg} shadow="md" borderRadius="xl">
            <CardHeader>
              <Heading size="md">Répartition des utilisateurs</Heading>
            </CardHeader>
            <CardBody>
              <Box h="250px">
                {analytics?.userDistribution?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.userDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {analytics.userDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Flex h="100%" align="center" justify="center">
                    <Text color="gray.500">Aucun utilisateur</Text>
                  </Flex>
                )}
              </Box>
            </CardBody>
          </Card>

          {/* Produits par catégorie */}
          <Card bg={cardBg} shadow="md" borderRadius="xl">
            <CardHeader>
              <Heading size="md">Produits par catégorie</Heading>
            </CardHeader>
            <CardBody>
              <Box h="250px">
                {analytics?.categoryData?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.categoryData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="value" fill="#667eea" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Flex h="100%" align="center" justify="center">
                    <Text color="gray.500">Aucun produit</Text>
                  </Flex>
                )}
              </Box>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Demandes vendeurs */}
        <Card bg={cardBg} shadow="md" borderRadius="xl">
          <CardHeader>
            <Heading size="md">Demandes Vendeurs</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <Box p={6} bg="yellow.50" borderRadius="xl" borderLeft="4px solid" borderLeftColor="yellow.400">
                <HStack spacing={4}>
                  <Box p={3} bg="yellow.100" borderRadius="full">
                    <Icon as={TimeIcon} color="yellow.500" boxSize={6} />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="bold" fontSize="3xl" color="yellow.600">{analytics?.pendingSellers || 0}</Text>
                    <Text color="gray.600">En attente</Text>
                  </VStack>
                </HStack>
              </Box>
              <Box p={6} bg="green.50" borderRadius="xl" borderLeft="4px solid" borderLeftColor="green.400">
                <HStack spacing={4}>
                  <Box p={3} bg="green.100" borderRadius="full">
                    <Icon as={FiUserCheck} color="green.500" boxSize={6} />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="bold" fontSize="3xl" color="green.600">{analytics?.approvedSellers || 0}</Text>
                    <Text color="gray.600">Approuvés</Text>
                  </VStack>
                </HStack>
              </Box>
              <Box p={6} bg="red.50" borderRadius="xl" borderLeft="4px solid" borderLeftColor="red.400">
                <HStack spacing={4}>
                  <Box p={3} bg="red.100" borderRadius="full">
                    <Icon as={FiUserX} color="red.500" boxSize={6} />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="bold" fontSize="3xl" color="red.600">{analytics?.rejectedSellers || 0}</Text>
                    <Text color="gray.600">Refusés</Text>
                  </VStack>
                </HStack>
              </Box>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Utilisateurs récents */}
        <Card bg={cardBg} shadow="md" borderRadius="xl">
          <CardHeader>
            <Heading size="md">Utilisateurs récents</Heading>
          </CardHeader>
          <CardBody>
            <Table>
              <Thead>
                <Tr>
                  <Th>Utilisateur</Th>
                  <Th>Email</Th>
                  <Th>Rôle</Th>
                  <Th>Date d'inscription</Th>
                </Tr>
              </Thead>
              <Tbody>
                {analytics?.recentUsers?.slice(0, 8).map((user) => (
                  <Tr key={user.id}>
                    <Td>
                      <HStack>
                        <Avatar name={user.full_name} size="sm" />
                        <Text fontWeight="medium">{user.full_name}</Text>
                      </HStack>
                    </Td>
                    <Td color="gray.500">{user.email}</Td>
                    <Td>{getRoleBadge(user.role)}</Td>
                    <Td>{new Date(user.created_at).toLocaleDateString('fr-FR')}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default AdminAnalytics;
