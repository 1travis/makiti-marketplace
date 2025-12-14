import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Card,
  CardBody,
  Image,
  Text,
  Badge,
  Button,
  VStack,
  HStack,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  useToast,
  useColorModeValue,
  Flex,
  IconButton,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Checkbox,
  CheckboxGroup,
  Stack,
  Collapse,
  Tooltip,
} from '@chakra-ui/react';
import { SearchIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { FiFilter, FiHeart, FiGrid, FiList } from 'react-icons/fi';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const ProductsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();
  const { token } = useSelector((state) => state.auth);
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [wishlist, setWishlist] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  
  const itemsPerPage = 12;
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const categories = [
    { value: '', label: 'Toutes les catégories', icon: '🏷️' },
    { value: 'electronics', label: 'Électronique', icon: '📱' },
    { value: 'fashion', label: 'Mode', icon: '👗' },
    { value: 'home', label: 'Maison', icon: '🏠' },
    { value: 'beauty', label: 'Beauté', icon: '💄' },
    { value: 'sports', label: 'Sports', icon: '⚽' },
    { value: 'books', label: 'Livres', icon: '📚' },
    { value: 'food', label: 'Alimentation', icon: '🍎' },
    { value: 'other', label: 'Autre', icon: '📦' },
  ];

  useEffect(() => {
    fetchProducts();
    loadWishlist();
  }, [categoryFilter]);

  useEffect(() => {
    // Mettre à jour l'URL avec les paramètres de recherche
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (categoryFilter) params.set('category', categoryFilter);
    setSearchParams(params);
  }, [searchTerm, categoryFilter, setSearchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = categoryFilter ? `?category=${categoryFilter}` : '';
      const response = await api.get(`/products${params}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les produits',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadWishlist = () => {
    const saved = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setWishlist(saved.map(p => p.id));
  };

  const toggleWishlist = (product) => {
    const saved = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const exists = saved.find(p => p.id === product.id);
    
    if (exists) {
      const newList = saved.filter(p => p.id !== product.id);
      localStorage.setItem('wishlist', JSON.stringify(newList));
      setWishlist(newList.map(p => p.id));
      toast({
        title: 'Retiré des favoris',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    } else {
      saved.push(product);
      localStorage.setItem('wishlist', JSON.stringify(saved));
      setWishlist(saved.map(p => p.id));
      toast({
        title: 'Ajouté aux favoris',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const getCategoryLabel = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  // Filtrage et tri des produits
  let filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesStock = !inStockOnly || product.stock_quantity > 0;
    return matchesSearch && matchesPrice && matchesStock;
  });

  // Tri
  filteredProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'newest':
      default:
        return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setPriceRange([0, 10000]);
    setSortBy('newest');
    setInStockOnly(false);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={10}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Chargement des produits...</Text>
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
            <Heading size="lg" mb={1}>Nos Produits</Heading>
            <Text color="gray.500">
              {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
            </Text>
          </Box>
          <HStack>
            <Tooltip label="Vue grille">
              <IconButton
                icon={<FiGrid />}
                variant={viewMode === 'grid' ? 'solid' : 'outline'}
                colorScheme="blue"
                onClick={() => setViewMode('grid')}
                aria-label="Vue grille"
              />
            </Tooltip>
            <Tooltip label="Vue liste">
              <IconButton
                icon={<FiList />}
                variant={viewMode === 'list' ? 'solid' : 'outline'}
                colorScheme="blue"
                onClick={() => setViewMode('list')}
                aria-label="Vue liste"
              />
            </Tooltip>
          </HStack>
        </Flex>

        {/* Barre de recherche et filtres */}
        <Box bg={bgColor} p={4} borderRadius="xl" shadow="sm">
          <Flex gap={4} flexWrap="wrap" align="center">
            <InputGroup maxW={{ base: '100%', md: '350px' }} flex={1}>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                borderRadius="full"
              />
            </InputGroup>
            
            <Select
              maxW="200px"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              borderRadius="full"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </Select>

            <Select
              maxW="180px"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              borderRadius="full"
            >
              <option value="newest">Plus récents</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
              <option value="name">Nom A-Z</option>
            </Select>

            <Button
              leftIcon={<FiFilter />}
              variant="outline"
              colorScheme="blue"
              onClick={onOpen}
              borderRadius="full"
            >
              Filtres
            </Button>

            {(searchTerm || categoryFilter || inStockOnly || priceRange[0] > 0 || priceRange[1] < 1000) && (
              <Button
                variant="ghost"
                colorScheme="red"
                size="sm"
                onClick={resetFilters}
              >
                Réinitialiser
              </Button>
            )}
          </Flex>
        </Box>

        {/* Drawer des filtres avancés */}
        <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="sm">
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader borderBottomWidth="1px">Filtres avancés</DrawerHeader>
            <DrawerBody>
              <VStack spacing={6} align="stretch" py={4}>
                {/* Filtre par prix */}
                <Box>
                  <Text fontWeight="semibold" mb={4}>Prix (€)</Text>
                  <RangeSlider
                    min={0}
                    max={10000}
                    step={10}
                    value={priceRange}
                    onChange={(val) => {
                      setPriceRange(val);
                      setCurrentPage(1);
                    }}
                    colorScheme="blue"
                  >
                    <RangeSliderTrack>
                      <RangeSliderFilledTrack />
                    </RangeSliderTrack>
                    <RangeSliderThumb index={0} />
                    <RangeSliderThumb index={1} />
                  </RangeSlider>
                  <Flex justify="space-between" mt={2}>
                    <Text fontSize="sm" color="gray.500">{priceRange[0]} €</Text>
                    <Text fontSize="sm" color="gray.500">{priceRange[1]} €</Text>
                  </Flex>
                </Box>

                {/* Filtre en stock */}
                <Box>
                  <Checkbox
                    isChecked={inStockOnly}
                    onChange={(e) => {
                      setInStockOnly(e.target.checked);
                      setCurrentPage(1);
                    }}
                    colorScheme="blue"
                  >
                    Uniquement en stock
                  </Checkbox>
                </Box>

                {/* Catégories */}
                <Box>
                  <Text fontWeight="semibold" mb={3}>Catégories</Text>
                  <VStack align="start" spacing={2}>
                    {categories.map((cat) => (
                      <Button
                        key={cat.value}
                        variant={categoryFilter === cat.value ? 'solid' : 'ghost'}
                        colorScheme={categoryFilter === cat.value ? 'blue' : 'gray'}
                        size="sm"
                        w="100%"
                        justifyContent="flex-start"
                        onClick={() => {
                          setCategoryFilter(cat.value);
                          setCurrentPage(1);
                        }}
                      >
                        {cat.icon} {cat.label}
                      </Button>
                    ))}
                  </VStack>
                </Box>

                <Button colorScheme="blue" onClick={onClose} mt={4}>
                  Appliquer les filtres
                </Button>
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        {/* Liste des produits */}
        {paginatedProducts.length === 0 ? (
          <Box textAlign="center" py={10} bg={bgColor} borderRadius="xl" shadow="sm">
            <VStack spacing={4}>
              <Box fontSize="5xl">🔍</Box>
              <Text color="gray.500" fontSize="lg">
                {searchTerm || categoryFilter 
                  ? 'Aucun produit ne correspond à votre recherche' 
                  : 'Aucun produit disponible pour le moment'}
              </Text>
              <Text color="gray.400" fontSize="sm">
                {searchTerm || categoryFilter 
                  ? 'Essayez de modifier vos critères de recherche' 
                  : 'Les vendeurs n\'ont pas encore publié de produits'}
              </Text>
              {(searchTerm || categoryFilter) && (
                <Button colorScheme="blue" variant="outline" onClick={resetFilters}>
                  Réinitialiser les filtres
                </Button>
              )}
            </VStack>
          </Box>
        ) : viewMode === 'grid' ? (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
            {paginatedProducts.map((product) => (
              <MotionBox
                key={product.id}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  bg={bgColor}
                  borderRadius="xl"
                  overflow="hidden"
                  shadow="md"
                  _hover={{ shadow: 'xl' }}
                  position="relative"
                >
                  {/* Bouton favoris */}
                  <IconButton
                    icon={<FiHeart fill={wishlist.includes(product.id) ? 'red' : 'none'} />}
                    position="absolute"
                    top={2}
                    right={2}
                    size="sm"
                    colorScheme={wishlist.includes(product.id) ? 'red' : 'gray'}
                    variant="solid"
                    borderRadius="full"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product);
                    }}
                    aria-label="Ajouter aux favoris"
                    zIndex={1}
                  />
                  
                  <Box
                    h="200px"
                    bg="gray.100"
                    cursor="pointer"
                    onClick={() => navigate(`/products/${product.id}`)}
                    overflow="hidden"
                  >
                    {product.images && product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        objectFit="cover"
                        w="100%"
                        h="100%"
                        transition="transform 0.3s"
                        _hover={{ transform: 'scale(1.05)' }}
                      />
                    ) : (
                      <Flex h="100%" align="center" justify="center">
                        <Text color="gray.400">Pas d'image</Text>
                      </Flex>
                    )}
                  </Box>
                  <CardBody>
                    <VStack align="start" spacing={2}>
                      <Badge colorScheme="blue" fontSize="xs" borderRadius="full">
                        {getCategoryLabel(product.category)}
                      </Badge>
                      <Text
                        fontWeight="bold"
                        fontSize="md"
                        noOfLines={1}
                        cursor="pointer"
                        onClick={() => navigate(`/products/${product.id}`)}
                        _hover={{ color: 'blue.500' }}
                      >
                        {product.name}
                      </Text>
                      <Text color="gray.500" fontSize="sm" noOfLines={2}>
                        {product.description}
                      </Text>
                      <Flex justify="space-between" align="center" w="100%">
                        <Text fontWeight="bold" fontSize="xl" color="blue.600">
                          {product.price?.toFixed(2)} €
                        </Text>
                        <Badge
                          colorScheme={product.stock_quantity > 0 ? 'green' : 'red'}
                          borderRadius="full"
                        >
                          {product.stock_quantity > 0 ? 'En stock' : 'Rupture'}
                        </Badge>
                      </Flex>
                    </VStack>
                  </CardBody>
                </Card>
              </MotionBox>
            ))}
          </SimpleGrid>
        ) : (
          /* Vue liste */
          <VStack spacing={4} align="stretch">
            {paginatedProducts.map((product) => (
              <MotionBox
                key={product.id}
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <Box
                  bg={bgColor}
                  borderRadius="xl"
                  shadow="md"
                  overflow="hidden"
                  _hover={{ shadow: 'lg' }}
                >
                  <Flex>
                    <Box
                      w="200px"
                      h="150px"
                      flexShrink={0}
                      cursor="pointer"
                      onClick={() => navigate(`/products/${product.id}`)}
                      overflow="hidden"
                    >
                      {product.images && product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          objectFit="cover"
                          w="100%"
                          h="100%"
                        />
                      ) : (
                        <Flex h="100%" bg="gray.100" align="center" justify="center">
                          <Text color="gray.400">Pas d'image</Text>
                        </Flex>
                      )}
                    </Box>
                    <Flex flex={1} p={4} justify="space-between" align="center">
                      <VStack align="start" spacing={2} flex={1}>
                        <HStack>
                          <Badge colorScheme="blue" fontSize="xs" borderRadius="full">
                            {getCategoryLabel(product.category)}
                          </Badge>
                          <Badge
                            colorScheme={product.stock_quantity > 0 ? 'green' : 'red'}
                            borderRadius="full"
                          >
                            {product.stock_quantity > 0 ? 'En stock' : 'Rupture'}
                          </Badge>
                        </HStack>
                        <Text
                          fontWeight="bold"
                          fontSize="lg"
                          cursor="pointer"
                          onClick={() => navigate(`/products/${product.id}`)}
                          _hover={{ color: 'blue.500' }}
                        >
                          {product.name}
                        </Text>
                        <Text color="gray.500" fontSize="sm" noOfLines={2}>
                          {product.description}
                        </Text>
                      </VStack>
                      <VStack align="end" spacing={2}>
                        <Text fontWeight="bold" fontSize="2xl" color="blue.600">
                          {product.price?.toFixed(2)} €
                        </Text>
                        <HStack>
                          <IconButton
                            icon={<FiHeart fill={wishlist.includes(product.id) ? 'red' : 'none'} />}
                            size="sm"
                            colorScheme={wishlist.includes(product.id) ? 'red' : 'gray'}
                            variant="outline"
                            onClick={() => toggleWishlist(product)}
                            aria-label="Ajouter aux favoris"
                          />
                          <Button
                            colorScheme="blue"
                            size="sm"
                            onClick={() => navigate(`/products/${product.id}`)}
                          >
                            Voir détails
                          </Button>
                        </HStack>
                      </VStack>
                    </Flex>
                  </Flex>
                </Box>
              </MotionBox>
            ))}
          </VStack>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Flex justify="center" align="center" gap={2} mt={6}>
            <IconButton
              icon={<ChevronLeftIcon />}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              isDisabled={currentPage === 1}
              variant="outline"
              colorScheme="blue"
              aria-label="Page précédente"
            />
            <HStack spacing={1}>
              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i + 1}
                  size="sm"
                  variant={currentPage === i + 1 ? 'solid' : 'outline'}
                  colorScheme="blue"
                  onClick={() => setCurrentPage(i + 1)}
                  display={
                    i + 1 === 1 ||
                    i + 1 === totalPages ||
                    Math.abs(currentPage - (i + 1)) <= 1
                      ? 'flex'
                      : 'none'
                  }
                >
                  {i + 1}
                </Button>
              ))}
            </HStack>
            <IconButton
              icon={<ChevronRightIcon />}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              isDisabled={currentPage === totalPages}
              variant="outline"
              colorScheme="blue"
              aria-label="Page suivante"
            />
            <Text fontSize="sm" color="gray.500" ml={4}>
              Page {currentPage} sur {totalPages}
            </Text>
          </Flex>
        )}
      </VStack>
    </Container>
  );
};

export default ProductsPage;
