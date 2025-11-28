import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Image,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Flex,
  Icon,
  SimpleGrid,
  Card,
  CardBody,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  useColorModeValue,
  IconButton,
  Tooltip,
  Avatar,
} from '@chakra-ui/react';
import { FiPackage, FiClock, FiTruck, FiCheck, FiX, FiDollarSign, FiEye, FiRefreshCw } from 'react-icons/fi';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const SellerOrdersPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { token, user } = useSelector((state) => state.auth);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  const statusLabels = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    processing: 'En préparation',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée',
  };

  const statusColors = {
    pending: 'yellow',
    confirmed: 'blue',
    processing: 'purple',
    shipped: 'cyan',
    delivered: 'green',
    cancelled: 'red',
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (user?.role !== 'seller') {
      navigate('/dashboard');
      return;
    }
    fetchOrders();
  }, [token, user, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/seller/orders');
      setOrders(response.data);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les commandes',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(true);
      await api.put(`/orders/${orderId}/status?new_status=${newStatus}`);
      
      // Mettre à jour localement
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));

      toast({
        title: 'Statut mis à jour',
        description: `Commande passée à "${statusLabels[newStatus]}"`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.detail || 'Impossible de mettre à jour',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    onOpen();
  };

  // Statistiques
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => ['confirmed', 'processing'].includes(o.status)).length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    completed: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    revenue: orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + (o.seller_total || 0), 0),
  };

  // Filtrer les commandes selon l'onglet actif
  const getFilteredOrders = () => {
    switch (activeTab) {
      case 1: return orders.filter(o => o.status === 'pending');
      case 2: return orders.filter(o => ['confirmed', 'processing'].includes(o.status));
      case 3: return orders.filter(o => o.status === 'shipped');
      case 4: return orders.filter(o => o.status === 'delivered');
      default: return orders;
    }
  };

  const filteredOrders = getFilteredOrders();

  const getStatusIcon = (status) => {
    const icons = {
      pending: FiClock,
      confirmed: FiPackage,
      processing: FiPackage,
      shipped: FiTruck,
      delivered: FiCheck,
      cancelled: FiX
    };
    return icons[status] || FiPackage;
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={10}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Chargement des commandes...</Text>
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
                <Icon as={FiPackage} />
                <Text>Gestion des commandes</Text>
              </HStack>
            </Heading>
            <Text color="gray.500">Gérez et suivez toutes vos commandes</Text>
          </Box>
          <Tooltip label="Actualiser">
            <IconButton
              icon={<FiRefreshCw />}
              onClick={fetchOrders}
              isLoading={loading}
              colorScheme="blue"
              variant="outline"
            />
          </Tooltip>
        </Flex>

        {/* Statistiques */}
        <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4}>
          <Card bg={bgColor} shadow="md" borderRadius="xl" borderTop="4px solid" borderTopColor="blue.400">
            <CardBody>
              <Flex justify="space-between" align="center">
                <Stat size="sm">
                  <StatLabel color="gray.500">Total</StatLabel>
                  <StatNumber>{stats.total}</StatNumber>
                </Stat>
                <Icon as={FiPackage} boxSize={8} color="blue.400" />
              </Flex>
            </CardBody>
          </Card>
          <Card bg={bgColor} shadow="md" borderRadius="xl" borderTop="4px solid" borderTopColor="yellow.400">
            <CardBody>
              <Flex justify="space-between" align="center">
                <Stat size="sm">
                  <StatLabel color="gray.500">En attente</StatLabel>
                  <StatNumber color="yellow.500">{stats.pending}</StatNumber>
                </Stat>
                <Icon as={FiClock} boxSize={8} color="yellow.400" />
              </Flex>
            </CardBody>
          </Card>
          <Card bg={bgColor} shadow="md" borderRadius="xl" borderTop="4px solid" borderTopColor="purple.400">
            <CardBody>
              <Flex justify="space-between" align="center">
                <Stat size="sm">
                  <StatLabel color="gray.500">En cours</StatLabel>
                  <StatNumber color="purple.500">{stats.processing}</StatNumber>
                </Stat>
                <Icon as={FiTruck} boxSize={8} color="purple.400" />
              </Flex>
            </CardBody>
          </Card>
          <Card bg={bgColor} shadow="md" borderRadius="xl" borderTop="4px solid" borderTopColor="green.400">
            <CardBody>
              <Flex justify="space-between" align="center">
                <Stat size="sm">
                  <StatLabel color="gray.500">Livrées</StatLabel>
                  <StatNumber color="green.500">{stats.completed}</StatNumber>
                </Stat>
                <Icon as={FiCheck} boxSize={8} color="green.400" />
              </Flex>
            </CardBody>
          </Card>
          <Card bg={bgColor} shadow="md" borderRadius="xl" borderTop="4px solid" borderTopColor="blue.600">
            <CardBody>
              <Flex justify="space-between" align="center">
                <Stat size="sm">
                  <StatLabel color="gray.500">Revenus</StatLabel>
                  <StatNumber color="blue.600" fontSize="lg">{stats.revenue.toFixed(0)} €</StatNumber>
                </Stat>
                <Icon as={FiDollarSign} boxSize={8} color="blue.600" />
              </Flex>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Onglets de filtrage */}
        <Box bg={bgColor} borderRadius="xl" shadow="md" overflow="hidden">
          <Tabs index={activeTab} onChange={setActiveTab} colorScheme="blue">
            <TabList px={4} pt={2} borderBottom="1px" borderColor={borderColor}>
              <Tab>Toutes ({stats.total})</Tab>
              <Tab>
                En attente
                {stats.pending > 0 && (
                  <Badge ml={2} colorScheme="yellow" borderRadius="full">{stats.pending}</Badge>
                )}
              </Tab>
              <Tab>En cours ({stats.processing})</Tab>
              <Tab>Expédiées ({stats.shipped})</Tab>
              <Tab>Livrées ({stats.completed})</Tab>
            </TabList>

            <TabPanels>
              {[0, 1, 2, 3, 4].map((tabIndex) => (
                <TabPanel key={tabIndex} p={0}>
                  {filteredOrders.length === 0 ? (
                    <Box p={10} textAlign="center">
                      <Icon as={FiPackage} boxSize={12} color="gray.300" mb={4} />
                      <Text color="gray.500" fontSize="lg">Aucune commande</Text>
                    </Box>
                  ) : (
                    <Box overflowX="auto">
                      <Table variant="simple">
                        <Thead bg={hoverBg}>
                          <Tr>
                            <Th>Commande</Th>
                            <Th>Date</Th>
                            <Th>Client</Th>
                            <Th>Articles</Th>
                            <Th isNumeric>Montant</Th>
                            <Th>Statut</Th>
                            <Th>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {filteredOrders.map((order) => {
                            const StatusIcon = getStatusIcon(order.status);
                            return (
                              <Tr key={order.id} _hover={{ bg: hoverBg }}>
                                <Td>
                                  <HStack>
                                    <Box
                                      p={2}
                                      bg={`${statusColors[order.status]}.100`}
                                      borderRadius="lg"
                                    >
                                      <Icon as={StatusIcon} color={`${statusColors[order.status]}.500`} />
                                    </Box>
                                    <Text fontWeight="bold">#{order.id.slice(-6).toUpperCase()}</Text>
                                  </HStack>
                                </Td>
                                <Td>
                                  <VStack align="start" spacing={0}>
                                    <Text fontSize="sm">
                                      {new Date(order.created_at).toLocaleDateString('fr-FR', {
                                        day: '2-digit',
                                        month: 'short',
                                      })}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500">
                                      {new Date(order.created_at).toLocaleTimeString('fr-FR', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </Text>
                                  </VStack>
                                </Td>
                                <Td>
                                  <HStack>
                                    <Avatar name={order.shipping_address?.full_name} size="sm" />
                                    <VStack align="start" spacing={0}>
                                      <Text fontWeight="medium" fontSize="sm">{order.shipping_address?.full_name}</Text>
                                      <Text fontSize="xs" color="gray.500">{order.shipping_address?.city}</Text>
                                    </VStack>
                                  </HStack>
                                </Td>
                                <Td>
                                  <Badge colorScheme="gray">{order.seller_items?.length} article(s)</Badge>
                                </Td>
                                <Td isNumeric>
                                  <Text fontWeight="bold" color="blue.600">{order.seller_total?.toFixed(2)} €</Text>
                                </Td>
                                <Td>
                                  <Badge colorScheme={statusColors[order.status]} fontSize="xs" px={2} py={1} borderRadius="full">
                                    {statusLabels[order.status]}
                                  </Badge>
                                </Td>
                                <Td>
                                  <HStack spacing={2}>
                                    <Tooltip label="Voir détails">
                                      <IconButton
                                        icon={<FiEye />}
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => openOrderDetails(order)}
                                      />
                                    </Tooltip>
                                    <Select
                                      size="sm"
                                      w="140px"
                                      value={order.status}
                                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                      isDisabled={updatingStatus || order.status === 'cancelled' || order.status === 'delivered'}
                                      borderRadius="lg"
                                    >
                                      <option value="pending">En attente</option>
                                      <option value="confirmed">Confirmée</option>
                                      <option value="processing">En préparation</option>
                                      <option value="shipped">Expédiée</option>
                                      <option value="delivered">Livrée</option>
                                      <option value="cancelled">Annulée</option>
                                    </Select>
                                  </HStack>
                                </Td>
                              </Tr>
                            );
                          })}
                        </Tbody>
                      </Table>
                    </Box>
                  )}
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        </Box>
      </VStack>

      {/* Modal détails commande */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Commande #{selectedOrder?.id.slice(-8)}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedOrder && (
              <VStack spacing={4} align="stretch">
                {/* Statut */}
                <HStack justify="space-between">
                  <Text fontWeight="bold">Statut:</Text>
                  <Badge colorScheme={statusColors[selectedOrder.status]} fontSize="md">
                    {statusLabels[selectedOrder.status]}
                  </Badge>
                </HStack>

                <Divider />

                {/* Adresse de livraison */}
                <Box>
                  <Text fontWeight="bold" mb={2}>📍 Adresse de livraison</Text>
                  <Box bg="gray.50" p={3} rounded="md">
                    <Text>{selectedOrder.shipping_address?.full_name}</Text>
                    <Text>{selectedOrder.shipping_address?.address}</Text>
                    <Text>
                      {selectedOrder.shipping_address?.postal_code} {selectedOrder.shipping_address?.city}
                    </Text>
                    <Text>📞 {selectedOrder.shipping_address?.phone}</Text>
                  </Box>
                </Box>

                <Divider />

                {/* Produits */}
                <Box>
                  <Text fontWeight="bold" mb={2}>📦 Vos produits dans cette commande</Text>
                  <VStack spacing={3} align="stretch">
                    {selectedOrder.seller_items?.map((item, index) => (
                      <HStack key={index} spacing={3} p={2} bg="gray.50" rounded="md">
                        <Image
                          src={item.product_image || 'https://via.placeholder.com/60'}
                          alt={item.product_name}
                          boxSize="60px"
                          objectFit="cover"
                          borderRadius="md"
                        />
                        <Box flex={1}>
                          <Text fontWeight="medium">{item.product_name}</Text>
                          <Text fontSize="sm" color="gray.500">
                            {item.quantity} x {item.unit_price.toFixed(2)} €
                          </Text>
                        </Box>
                        <Text fontWeight="bold">{item.total.toFixed(2)} €</Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>

                <Divider />

                {/* Total */}
                <HStack justify="space-between" fontSize="lg">
                  <Text fontWeight="bold">Total (vos produits):</Text>
                  <Text fontWeight="bold" color="blue.600">
                    {selectedOrder.seller_total?.toFixed(2)} €
                  </Text>
                </HStack>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Fermer</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default SellerOrdersPage;
