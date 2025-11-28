import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Image,
  VStack,
  HStack,
  Badge,
  Flex,
  Icon,
  useColorModeValue,
  Skeleton,
  SkeletonText,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiShoppingBag, FiTruck, FiShield, FiHeadphones } from 'react-icons/fi';
import api from '../api/axios';

const MotionBox = motion(Box);

// Composant pour les cartes de produits en vedette
const FeaturedProductCard = ({ product }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <MotionBox
      whileHover={{ y: -5, boxShadow: 'xl' }}
      transition={{ duration: 0.3 }}
    >
      <Box
        bg={bgColor}
        borderRadius="xl"
        overflow="hidden"
        borderWidth="1px"
        borderColor={borderColor}
        _hover={{ borderColor: 'blue.400' }}
      >
        <Box position="relative">
          <Image
            src={product.images?.[0] || 'https://via.placeholder.com/300x200?text=Produit'}
            alt={product.name}
            h="200px"
            w="100%"
            objectFit="cover"
            fallbackSrc="https://via.placeholder.com/300x200?text=Produit"
          />
          {product.stock_quantity < 10 && product.stock_quantity > 0 && (
            <Badge
              position="absolute"
              top={2}
              right={2}
              colorScheme="orange"
              fontSize="xs"
            >
              Stock limité
            </Badge>
          )}
          {product.stock_quantity === 0 && (
            <Badge
              position="absolute"
              top={2}
              right={2}
              colorScheme="red"
              fontSize="xs"
            >
              Rupture
            </Badge>
          )}
        </Box>
        <VStack p={4} align="start" spacing={2}>
          <Text fontWeight="bold" fontSize="lg" noOfLines={1}>
            {product.name}
          </Text>
          <Text color="gray.500" fontSize="sm" noOfLines={2}>
            {product.description}
          </Text>
          <HStack justify="space-between" w="100%">
            <Text color="blue.600" fontWeight="bold" fontSize="xl">
              {product.price?.toFixed(2)} €
            </Text>
            <Button
              as={RouterLink}
              to={`/products/${product.id}`}
              size="sm"
              colorScheme="blue"
              variant="outline"
            >
              Voir
            </Button>
          </HStack>
        </VStack>
      </Box>
    </MotionBox>
  );
};

// Composant pour les catégories
const CategoryCard = ({ name, icon, color }) => {
  const bgColor = useColorModeValue('white', 'gray.800');

  return (
    <MotionBox
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Box
        as={RouterLink}
        to={`/products?category=${name.toLowerCase()}`}
        bg={bgColor}
        p={6}
        borderRadius="xl"
        textAlign="center"
        shadow="md"
        _hover={{ shadow: 'lg', textDecoration: 'none' }}
        cursor="pointer"
      >
        <Box
          bg={`${color}.100`}
          color={`${color}.600`}
          w={16}
          h={16}
          borderRadius="full"
          display="flex"
          alignItems="center"
          justifyContent="center"
          mx="auto"
          mb={3}
          fontSize="2xl"
        >
          {icon}
        </Box>
        <Text fontWeight="semibold">{name}</Text>
      </Box>
    </MotionBox>
  );
};

// Composant pour les avantages
const FeatureCard = ({ icon, title, description }) => {
  const bgColor = useColorModeValue('white', 'gray.800');

  return (
    <VStack
      bg={bgColor}
      p={6}
      borderRadius="xl"
      shadow="md"
      spacing={3}
      textAlign="center"
    >
      <Icon as={icon} boxSize={10} color="blue.500" />
      <Text fontWeight="bold" fontSize="lg">{title}</Text>
      <Text color="gray.500" fontSize="sm">{description}</Text>
    </VStack>
  );
};

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const bgGradient = useColorModeValue(
    'linear(to-r, blue.600, purple.600)',
    'linear(to-r, blue.800, purple.800)'
  );
  const heroBg = useColorModeValue('gray.50', 'gray.900');

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await api.get('/products');
      // Prendre les 8 premiers produits comme "en vedette"
      setFeaturedProducts(response.data.slice(0, 8));
    } catch (error) {
      console.error('Erreur chargement produits:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { name: 'Électronique', icon: '📱', color: 'blue' },
    { name: 'Mode', icon: '👗', color: 'pink' },
    { name: 'Maison', icon: '🏠', color: 'green' },
    { name: 'Sport', icon: '⚽', color: 'orange' },
    { name: 'Beauté', icon: '💄', color: 'purple' },
    { name: 'Alimentation', icon: '🍎', color: 'red' },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box bg={heroBg} py={20}>
        <Container maxW="container.xl">
          <Flex
            direction={{ base: 'column', lg: 'row' }}
            align="center"
            justify="space-between"
            gap={10}
          >
            <MotionBox
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              flex={1}
            >
              <VStack align={{ base: 'center', lg: 'start' }} spacing={6} textAlign={{ base: 'center', lg: 'left' }}>
                <Badge colorScheme="blue" fontSize="md" px={3} py={1} borderRadius="full">
                  🎉 Bienvenue sur Makiti
                </Badge>
                <Heading
                  as="h1"
                  size="2xl"
                  bgGradient={bgGradient}
                  bgClip="text"
                  lineHeight="shorter"
                >
                  Découvrez les meilleurs produits locaux
                </Heading>
                <Text fontSize="xl" color="gray.600" maxW="500px">
                  Achetez directement auprès de vendeurs locaux de confiance. 
                  Qualité garantie, livraison rapide.
                </Text>
                <HStack spacing={4}>
                  <Button
                    as={RouterLink}
                    to="/products"
                    size="lg"
                    colorScheme="blue"
                    leftIcon={<FiShoppingBag />}
                  >
                    Explorer les produits
                  </Button>
                  <Button
                    as={RouterLink}
                    to="/register"
                    size="lg"
                    variant="outline"
                    colorScheme="blue"
                  >
                    Devenir vendeur
                  </Button>
                </HStack>
              </VStack>
            </MotionBox>
            <MotionBox
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              flex={1}
              display={{ base: 'none', lg: 'block' }}
            >
              <Image
                src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600"
                alt="Shopping"
                borderRadius="2xl"
                shadow="2xl"
                maxH="400px"
                objectFit="cover"
              />
            </MotionBox>
          </Flex>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxW="container.xl" py={16}>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
          <FeatureCard
            icon={FiTruck}
            title="Livraison rapide"
            description="Livraison en 24-48h partout dans le pays"
          />
          <FeatureCard
            icon={FiShield}
            title="Paiement sécurisé"
            description="Vos transactions sont 100% sécurisées"
          />
          <FeatureCard
            icon={FiHeadphones}
            title="Support 24/7"
            description="Notre équipe est là pour vous aider"
          />
          <FeatureCard
            icon={FiShoppingBag}
            title="Qualité garantie"
            description="Produits vérifiés et de qualité"
          />
        </SimpleGrid>
      </Container>

      {/* Categories Section */}
      <Box bg={useColorModeValue('gray.50', 'gray.900')} py={16}>
        <Container maxW="container.xl">
          <VStack spacing={10}>
            <VStack spacing={2}>
              <Heading size="xl">Parcourir par catégorie</Heading>
              <Text color="gray.500">Trouvez ce que vous cherchez facilement</Text>
            </VStack>
            <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={6} w="100%">
              {categories.map((cat) => (
                <CategoryCard key={cat.name} {...cat} />
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Featured Products Section */}
      <Container maxW="container.xl" py={16}>
        <VStack spacing={10}>
          <VStack spacing={2}>
            <Heading size="xl">Produits en vedette</Heading>
            <Text color="gray.500">Découvrez notre sélection du moment</Text>
          </VStack>
          
          {loading ? (
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6} w="100%">
              {[...Array(8)].map((_, i) => (
                <Box key={i} bg="white" borderRadius="xl" overflow="hidden" shadow="md">
                  <Skeleton h="200px" />
                  <Box p={4}>
                    <SkeletonText noOfLines={3} spacing={3} />
                  </Box>
                </Box>
              ))}
            </SimpleGrid>
          ) : featuredProducts.length > 0 ? (
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6} w="100%">
              {featuredProducts.map((product) => (
                <FeaturedProductCard key={product.id} product={product} />
              ))}
            </SimpleGrid>
          ) : (
            <Box textAlign="center" py={10}>
              <Text color="gray.500" fontSize="lg">
                Aucun produit disponible pour le moment
              </Text>
              <Button
                as={RouterLink}
                to="/products"
                mt={4}
                colorScheme="blue"
              >
                Voir tous les produits
              </Button>
            </Box>
          )}

          <Button
            as={RouterLink}
            to="/products"
            size="lg"
            colorScheme="blue"
            variant="outline"
          >
            Voir tous les produits
          </Button>
        </VStack>
      </Container>

      {/* CTA Section */}
      <Box bgGradient={bgGradient} py={16}>
        <Container maxW="container.xl">
          <VStack spacing={6} textAlign="center" color="white">
            <Heading size="xl">Prêt à vendre vos produits ?</Heading>
            <Text fontSize="lg" maxW="600px">
              Rejoignez des milliers de vendeurs et commencez à vendre vos produits 
              à une large audience dès aujourd'hui.
            </Text>
            <Button
              as={RouterLink}
              to="/register"
              size="lg"
              colorScheme="whiteAlpha"
              variant="solid"
            >
              Créer mon compte vendeur
            </Button>
          </VStack>
        </Container>
      </Box>

      {/* Footer */}
      <Box bg={useColorModeValue('gray.800', 'gray.900')} color="white" py={10}>
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={8}>
            <VStack align="start" spacing={4}>
              <Heading size="md">Makiti</Heading>
              <Text color="gray.400" fontSize="sm">
                La marketplace locale de confiance pour acheter et vendre.
              </Text>
            </VStack>
            <VStack align="start" spacing={3}>
              <Text fontWeight="bold">Liens utiles</Text>
              <Text as={RouterLink} to="/products" color="gray.400" _hover={{ color: 'white' }}>
                Produits
              </Text>
              <Text as={RouterLink} to="/register" color="gray.400" _hover={{ color: 'white' }}>
                Devenir vendeur
              </Text>
            </VStack>
            <VStack align="start" spacing={3}>
              <Text fontWeight="bold">Support</Text>
              <Text color="gray.400">FAQ</Text>
              <Text color="gray.400">Contact</Text>
            </VStack>
            <VStack align="start" spacing={3}>
              <Text fontWeight="bold">Contact</Text>
              <Text color="gray.400">support@makiti.com</Text>
              <Text color="gray.400">+1 234 567 890</Text>
            </VStack>
          </SimpleGrid>
          <Box borderTopWidth={1} borderColor="gray.700" mt={8} pt={8} textAlign="center">
            <Text color="gray.400" fontSize="sm">
              © 2024 Makiti. Tous droits réservés.
            </Text>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
