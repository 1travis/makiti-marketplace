import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Image,
  VStack,
  HStack,
  Button,
  IconButton,
  Badge,
  useToast,
  Spinner,
  useColorModeValue,
  Flex,
} from '@chakra-ui/react';
import { DeleteIcon, ArrowBackIcon } from '@chakra-ui/icons';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { motion } from 'framer-motion';
import api from '../api/axios';

const MotionBox = motion(Box);

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await api.get('/wishlist');
      setWishlist(response.data);
    } catch (error) {
      // Si l'API n'existe pas encore, utiliser le localStorage
      const localWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setWishlist(localWishlist);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      setWishlist(wishlist.filter(item => item.id !== productId));
      toast({
        title: 'Produit retiré des favoris',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      // Fallback localStorage
      const newWishlist = wishlist.filter(item => item.id !== productId);
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
      setWishlist(newWishlist);
      toast({
        title: 'Produit retiré des favoris',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const addToCart = async (product) => {
    try {
      await api.post('/cart/add', {
        product_id: product.id,
        quantity: 1,
      });
      toast({
        title: 'Produit ajouté au panier',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.detail || 'Impossible d\'ajouter au panier',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={10}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Chargement des favoris...</Text>
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
              <FiHeart />
              <Text>Mes Favoris</Text>
            </HStack>
          </Heading>
          {wishlist.length > 0 && (
            <Badge colorScheme="pink" fontSize="md" px={3} py={1} borderRadius="full">
              {wishlist.length} produit{wishlist.length > 1 ? 's' : ''}
            </Badge>
          )}
        </HStack>

        {wishlist.length === 0 ? (
          <Box
            bg={bgColor}
            p={10}
            borderRadius="xl"
            textAlign="center"
            shadow="md"
          >
            <VStack spacing={4}>
              <Box fontSize="6xl">💔</Box>
              <Heading size="md" color="gray.500">
                Votre liste de favoris est vide
              </Heading>
              <Text color="gray.400">
                Parcourez nos produits et ajoutez vos coups de cœur !
              </Text>
              <Button
                as={RouterLink}
                to="/products"
                colorScheme="blue"
                size="lg"
                leftIcon={<FiShoppingCart />}
              >
                Découvrir les produits
              </Button>
            </VStack>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
            {wishlist.map((product) => (
              <MotionBox
                key={product.id}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Box
                  bg={bgColor}
                  borderRadius="xl"
                  overflow="hidden"
                  borderWidth="1px"
                  borderColor={borderColor}
                  shadow="md"
                  position="relative"
                >
                  <IconButton
                    icon={<DeleteIcon />}
                    position="absolute"
                    top={2}
                    right={2}
                    size="sm"
                    colorScheme="red"
                    variant="solid"
                    borderRadius="full"
                    onClick={() => removeFromWishlist(product.id)}
                    aria-label="Retirer des favoris"
                    zIndex={1}
                  />
                  
                  <Image
                    src={product.images?.[0] || 'https://via.placeholder.com/300x200?text=Produit'}
                    alt={product.name}
                    h="180px"
                    w="100%"
                    objectFit="cover"
                    fallbackSrc="https://via.placeholder.com/300x200?text=Produit"
                  />
                  
                  <VStack p={4} align="start" spacing={2}>
                    <Text
                      fontWeight="bold"
                      fontSize="md"
                      noOfLines={1}
                      as={RouterLink}
                      to={`/products/${product.id}`}
                      _hover={{ color: 'blue.500' }}
                    >
                      {product.name}
                    </Text>
                    <Text color="gray.500" fontSize="sm" noOfLines={2}>
                      {product.description}
                    </Text>
                    <Flex justify="space-between" align="center" w="100%">
                      <Text color="blue.600" fontWeight="bold" fontSize="lg">
                        {product.price?.toFixed(2)} €
                      </Text>
                      {product.stock_quantity > 0 ? (
                        <Badge colorScheme="green" fontSize="xs">
                          En stock
                        </Badge>
                      ) : (
                        <Badge colorScheme="red" fontSize="xs">
                          Rupture
                        </Badge>
                      )}
                    </Flex>
                    <Button
                      w="100%"
                      colorScheme="blue"
                      size="sm"
                      leftIcon={<FiShoppingCart />}
                      onClick={() => addToCart(product)}
                      isDisabled={product.stock_quantity === 0}
                    >
                      Ajouter au panier
                    </Button>
                  </VStack>
                </Box>
              </MotionBox>
            ))}
          </SimpleGrid>
        )}
      </VStack>
    </Container>
  );
};

export default WishlistPage;
