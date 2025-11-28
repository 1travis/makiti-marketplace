import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import {
  Box,
  Container,
  Heading,
  Text,
  Image,
  Badge,
  Button,
  VStack,
  HStack,
  Spinner,
  useToast,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Divider,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  SimpleGrid,
} from '@chakra-ui/react';
import { ChevronRightIcon, ArrowBackIcon, ChatIcon } from '@chakra-ui/icons';
import { FiMessageSquare } from 'react-icons/fi';
import ProductReviews from '../components/ProductReviews';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { token, user } = useSelector((state) => state.auth);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

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
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${productId}`);
      setProduct(response.data);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Produit non trouvé',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!token) {
      toast({
        title: 'Connexion requise',
        description: 'Veuillez vous connecter pour ajouter au panier',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      navigate('/login');
      return;
    }

    try {
      setAddingToCart(true);
      await api.post('/cart/add', {
        product_id: productId,
        quantity: quantity,
      });
      toast({
        title: 'Ajouté au panier',
        description: `${quantity} x ${product.name} ajouté(s) au panier`,
        status: 'success',
        duration: 3000,
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
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={10}>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Chargement du produit...</Text>
        </VStack>
      </Container>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <Container maxW="container.xl" py={6}>
      <VStack spacing={6} align="stretch">
        {/* Breadcrumb */}
        <Breadcrumb separator={<ChevronRightIcon color="gray.500" />}>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate('/products')}>
              Produits
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate(`/products?category=${product.category}`)}>
              {categories[product.category] || product.category}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>{product.name}</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <Button
          leftIcon={<ArrowBackIcon />}
          variant="ghost"
          onClick={() => navigate('/products')}
          alignSelf="flex-start"
        >
          Retour aux produits
        </Button>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          {/* Image du produit */}
          <Box
            bg="gray.100"
            borderRadius="lg"
            h={{ base: '300px', md: '400px' }}
            display="flex"
            alignItems="center"
            justifyContent="center"
            overflow="hidden"
          >
            {product.images && product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                objectFit="contain"
                maxH="100%"
                maxW="100%"
              />
            ) : (
              <Text color="gray.400" fontSize="lg">Pas d'image disponible</Text>
            )}
          </Box>

          {/* Détails du produit */}
          <VStack align="stretch" spacing={4}>
            <Badge colorScheme="blue" alignSelf="flex-start">
              {categories[product.category] || product.category}
            </Badge>
            
            <Heading size="xl">{product.name}</Heading>
            
            <HStack>
              <Badge colorScheme={product.stock_quantity > 0 ? 'green' : 'red'} fontSize="md" px={3} py={1}>
                {product.stock_quantity > 0 ? `${product.stock_quantity} en stock` : 'Rupture de stock'}
              </Badge>
            </HStack>

            <Text fontSize="3xl" fontWeight="bold" color="blue.600">
              {product.price.toFixed(2)} €
            </Text>

            <Divider />

            {/* Lien vers le vendeur */}
            {product.seller_id && (
              <Box
                p={4}
                bg="gray.50"
                borderRadius="lg"
                cursor="pointer"
                onClick={() => navigate(`/seller/${product.seller_id}`)}
                _hover={{ bg: 'gray.100' }}
                transition="all 0.2s"
              >
                <HStack justify="space-between">
                  <HStack>
                    <Box w={10} h={10} bg="blue.500" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
                      <Text color="white" fontWeight="bold">V</Text>
                    </Box>
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold" fontSize="sm">Voir le profil du vendeur</Text>
                      <Text fontSize="xs" color="gray.500">Découvrir ses autres produits et avis</Text>
                    </VStack>
                  </HStack>
                  <ChevronRightIcon color="gray.400" />
                </HStack>
              </Box>
            )}

            <Box>
              <Text fontWeight="bold" mb={2}>Description</Text>
              <Text color="gray.600" whiteSpace="pre-wrap">
                {product.description}
              </Text>
            </Box>

            <Divider />

            {/* Quantité et ajout au panier */}
            {product.stock_quantity > 0 && (
              <VStack align="stretch" spacing={4}>
                <HStack>
                  <Text fontWeight="bold">Quantité:</Text>
                  <NumberInput
                    min={1}
                    max={product.stock_quantity}
                    value={quantity}
                    onChange={(_, val) => setQuantity(val)}
                    maxW="100px"
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </HStack>

                <HStack spacing={3}>
                  <Button
                    colorScheme="blue"
                    size="lg"
                    flex={1}
                    onClick={handleAddToCart}
                    isDisabled={product.stock_quantity === 0}
                    isLoading={addingToCart}
                    loadingText="Ajout..."
                  >
                    🛒 Ajouter au panier
                  </Button>
                  {token && user?.role === 'customer' && product.seller_id && (
                    <Button
                      colorScheme="green"
                      size="lg"
                      leftIcon={<FiMessageSquare />}
                      onClick={() => navigate(`/messages?seller=${product.seller_id}&product=${productId}`)}
                    >
                      Contacter
                    </Button>
                  )}
                </HStack>
              </VStack>
            )}

            {product.stock_quantity === 0 && (
              <HStack spacing={3}>
                <Button colorScheme="gray" size="lg" flex={1} isDisabled>
                  Produit indisponible
                </Button>
                {token && user?.role === 'customer' && product.seller_id && (
                  <Button
                    colorScheme="green"
                    size="lg"
                    leftIcon={<FiMessageSquare />}
                    onClick={() => navigate(`/messages?seller=${product.seller_id}&product=${productId}`)}
                  >
                    Contacter
                  </Button>
                )}
              </HStack>
            )}
          </VStack>
        </SimpleGrid>

        {/* Section Avis clients */}
        <Box mt={8}>
          <ProductReviews productId={productId} />
        </Box>
      </VStack>
    </Container>
  );
};

export default ProductDetailPage;
