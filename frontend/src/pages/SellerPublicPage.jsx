import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Image,
  Badge,
  Button,
  Avatar,
  Flex,
  Divider,
  Spinner,
  useColorModeValue,
  Card,
  CardBody,
  Icon,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import { StarIcon, ChatIcon, TimeIcon } from '@chakra-ui/icons';
import { FiPackage, FiMapPin, FiPhone, FiMessageSquare, FiShoppingBag } from 'react-icons/fi';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const SellerPublicPage = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useSelector((state) => state.auth);
  
  const [sellerData, setSellerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const replyBg = useColorModeValue('blue.50', 'blue.900');

  const categories = {
    electronics: 'Électronique',
    fashion: 'Mode',
    home: 'Maison',
    beauty: 'Beauté',
    sports: 'Sports',
    books: 'Livres',
    other: 'Autre',
  };

  useEffect(() => {
    fetchSellerData();
  }, [sellerId]);

  const fetchSellerData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/sellers/${sellerId}/public`);
      setSellerData(response.data);
    } catch (err) {
      setError('Vendeur non trouvé');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleContactSeller = () => {
    if (!token) {
      navigate('/login');
      return;
    }
    navigate(`/messages?seller=${sellerId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long'
    });
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<StarIcon key={i} color="yellow.400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<StarIcon key={i} color="yellow.200" />);
      } else {
        stars.push(<StarIcon key={i} color="gray.300" />);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={10}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Chargement du profil vendeur...</Text>
        </VStack>
      </Container>
    );
  }

  if (error || !sellerData) {
    return (
      <Container maxW="container.xl" py={10}>
        <VStack spacing={4}>
          <Text fontSize="xl" color="red.500">{error || 'Vendeur non trouvé'}</Text>
          <Button onClick={() => navigate('/products')}>Retour aux produits</Button>
        </VStack>
      </Container>
    );
  }

  const { seller, shop, products, reviews, stats } = sellerData;

  return (
    <Box bg={bgColor} minH="100vh" py={6}>
      <Container maxW="container.xl">
        {/* En-tête du profil */}
        <MotionBox
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card bg={cardBg} shadow="xl" borderRadius="2xl" overflow="hidden" mb={6}>
            {/* Bannière */}
            <Box
              h="150px"
              bgGradient="linear(to-r, blue.500, purple.600)"
              position="relative"
            />
            
            <CardBody pt={0}>
              <Flex direction={{ base: 'column', md: 'row' }} align={{ base: 'center', md: 'flex-start' }} gap={6}>
                {/* Avatar */}
                <Avatar
                  size="2xl"
                  name={seller.name}
                  src={seller.avatar || shop?.logo}
                  mt="-60px"
                  border="4px solid"
                  borderColor={cardBg}
                  shadow="lg"
                />
                
                {/* Infos vendeur */}
                <VStack align={{ base: 'center', md: 'flex-start' }} flex={1} spacing={2} mt={{ base: 0, md: 4 }}>
                  <HStack>
                    <Heading size="lg">{shop?.name || seller.name}</Heading>
                    <Badge colorScheme="green" fontSize="sm">Vendeur vérifié</Badge>
                  </HStack>
                  
                  <Text color="gray.500" fontSize="md">
                    {seller.name}
                  </Text>
                  
                  {seller.bio && (
                    <Text color="gray.600" maxW="600px" textAlign={{ base: 'center', md: 'left' }}>
                      {seller.bio}
                    </Text>
                  )}
                  
                  <HStack spacing={4} mt={2} flexWrap="wrap" justify={{ base: 'center', md: 'flex-start' }}>
                    <HStack>
                      {renderStars(stats.average_rating)}
                      <Text fontWeight="bold">{stats.average_rating?.toFixed(1) || '0'}</Text>
                      <Text color="gray.500">({stats.total_reviews} avis)</Text>
                    </HStack>
                    
                    <HStack color="gray.500">
                      <Icon as={TimeIcon} />
                      <Text>Membre depuis {formatDate(seller.member_since)}</Text>
                    </HStack>
                  </HStack>
                </VStack>
                
                {/* Boutons d'action */}
                <VStack spacing={3} mt={{ base: 4, md: 4 }}>
                  {user?.role === 'customer' && (
                    <Button
                      colorScheme="blue"
                      size="lg"
                      leftIcon={<FiMessageSquare />}
                      onClick={handleContactSeller}
                      w="full"
                    >
                      Contacter
                    </Button>
                  )}
                </VStack>
              </Flex>
            </CardBody>
          </Card>
        </MotionBox>

        {/* Statistiques */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
          <Card bg={cardBg} shadow="md" borderRadius="xl">
            <CardBody textAlign="center">
              <Stat>
                <StatLabel color="gray.500">Produits</StatLabel>
                <StatNumber color="blue.500">{stats.total_products}</StatNumber>
                <StatHelpText>En vente</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card bg={cardBg} shadow="md" borderRadius="xl">
            <CardBody textAlign="center">
              <Stat>
                <StatLabel color="gray.500">Note moyenne</StatLabel>
                <StatNumber color="yellow.500">
                  <HStack justify="center">
                    <StarIcon />
                    <Text>{stats.average_rating?.toFixed(1) || '0'}</Text>
                  </HStack>
                </StatNumber>
                <StatHelpText>/5</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card bg={cardBg} shadow="md" borderRadius="xl">
            <CardBody textAlign="center">
              <Stat>
                <StatLabel color="gray.500">Avis clients</StatLabel>
                <StatNumber color="green.500">{stats.total_reviews}</StatNumber>
                <StatHelpText>Reçus</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card bg={cardBg} shadow="md" borderRadius="xl">
            <CardBody textAlign="center">
              <Stat>
                <StatLabel color="gray.500">Réponse</StatLabel>
                <StatNumber color="purple.500">Rapide</StatNumber>
                <StatHelpText>En général</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Infos boutique */}
        {shop && (
          <Card bg={cardBg} shadow="md" borderRadius="xl" mb={6}>
            <CardBody>
              <Heading size="md" mb={4}>📍 Informations de la boutique</Heading>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                {shop.address && (
                  <HStack>
                    <Icon as={FiMapPin} color="blue.500" />
                    <Text>
                      {typeof shop.address === 'object' 
                        ? `${shop.address.street || ''}, ${shop.address.city || ''} ${shop.address.postal_code || ''}`
                        : shop.address}
                    </Text>
                  </HStack>
                )}
                {shop.phone && (
                  <HStack>
                    <Icon as={FiPhone} color="green.500" />
                    <Text>{shop.phone}</Text>
                  </HStack>
                )}
                {shop.description && (
                  <Text color="gray.600" gridColumn={{ md: 'span 3' }}>
                    {shop.description}
                  </Text>
                )}
              </SimpleGrid>
            </CardBody>
          </Card>
        )}

        {/* Onglets Produits / Avis */}
        <Tabs colorScheme="blue" variant="enclosed">
          <TabList>
            <Tab>
              <HStack>
                <Icon as={FiShoppingBag} />
                <Text>Produits ({products.length})</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack>
                <StarIcon />
                <Text>Avis ({reviews.length})</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* Produits */}
            <TabPanel px={0}>
              {products.length === 0 ? (
                <Card bg={cardBg} p={10} textAlign="center">
                  <VStack spacing={4}>
                    <Icon as={FiPackage} boxSize={12} color="gray.300" />
                    <Text color="gray.500">Aucun produit disponible pour le moment</Text>
                  </VStack>
                </Card>
              ) : (
                <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
                  {products.map((product) => (
                    <MotionBox
                      key={product.id}
                      whileHover={{ y: -5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card
                        bg={cardBg}
                        shadow="md"
                        borderRadius="xl"
                        overflow="hidden"
                        cursor="pointer"
                        onClick={() => navigate(`/products/${product.id}`)}
                        _hover={{ shadow: 'xl' }}
                      >
                        <Box h="180px" bg="gray.100" overflow="hidden">
                          {product.images?.[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              w="100%"
                              h="100%"
                              objectFit="cover"
                            />
                          ) : (
                            <Flex h="100%" align="center" justify="center">
                              <Icon as={FiPackage} boxSize={10} color="gray.300" />
                            </Flex>
                          )}
                        </Box>
                        <CardBody>
                          <VStack align="stretch" spacing={2}>
                            <Badge colorScheme="blue" alignSelf="flex-start" fontSize="xs">
                              {categories[product.category] || product.category}
                            </Badge>
                            <Text fontWeight="bold" noOfLines={2}>{product.name}</Text>
                            <HStack justify="space-between">
                              <Text color="blue.600" fontWeight="bold" fontSize="lg">
                                {product.price?.toFixed(2)} €
                              </Text>
                              <Badge colorScheme={product.stock_quantity > 0 ? 'green' : 'red'}>
                                {product.stock_quantity > 0 ? 'En stock' : 'Épuisé'}
                              </Badge>
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    </MotionBox>
                  ))}
                </SimpleGrid>
              )}
            </TabPanel>

            {/* Avis */}
            <TabPanel px={0}>
              {reviews.length === 0 ? (
                <Card bg={cardBg} p={10} textAlign="center">
                  <VStack spacing={4}>
                    <StarIcon boxSize={12} color="gray.300" />
                    <Text color="gray.500">Aucun avis pour le moment</Text>
                  </VStack>
                </Card>
              ) : (
                <VStack spacing={4} align="stretch">
                  {reviews.map((review) => (
                    <Card key={review.id} bg={cardBg} shadow="sm" borderRadius="xl">
                      <CardBody>
                        <Flex justify="space-between" align="start" mb={3}>
                          <HStack>
                            <Avatar size="sm" name={review.user_name} />
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="bold">{review.user_name}</Text>
                              <Text fontSize="xs" color="gray.500">
                                {new Date(review.created_at).toLocaleDateString('fr-FR')}
                              </Text>
                            </VStack>
                          </HStack>
                          <HStack>
                            {renderStars(review.rating)}
                          </HStack>
                        </Flex>
                        
                        {review.comment && (
                          <Text color="gray.600" mb={3}>{review.comment}</Text>
                        )}
                        
                        {review.seller_reply && (
                          <Box bg={replyBg} p={3} borderRadius="md" mt={3}>
                            <Text fontSize="sm" fontWeight="bold" color="blue.600" mb={1}>
                              Réponse du vendeur :
                            </Text>
                            <Text fontSize="sm">{review.seller_reply}</Text>
                          </Box>
                        )}
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Box>
  );
};

export default SellerPublicPage;
