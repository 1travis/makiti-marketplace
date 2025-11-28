import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { updateProduct } from '../store/slices/productSlice';
import api from '../api/axios';
import {
  Box,
  Container,
  Heading,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  VStack,
  HStack,
  Text,
  useToast,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormErrorMessage,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Spinner,
  Alert,
  AlertIcon,
  Image,
  IconButton,
} from '@chakra-ui/react';
import { ChevronRightIcon, DeleteIcon, AttachmentIcon } from '@chakra-ui/icons';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .required('Le nom est requis'),
  description: Yup.string()
    .min(10, 'La description doit contenir au moins 10 caractères')
    .max(2000, 'La description ne peut pas dépasser 2000 caractères')
    .required('La description est requise'),
  price: Yup.number()
    .positive('Le prix doit être positif')
    .required('Le prix est requis'),
  category: Yup.string()
    .required('La catégorie est requise'),
  stock_quantity: Yup.number()
    .integer('La quantité doit être un nombre entier')
    .min(0, 'La quantité ne peut pas être négative')
    .required('La quantité en stock est requise'),
  status: Yup.string()
    .required('Le statut est requis'),
});

const EditProductPage = () => {
  const { productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { loading: updating } = useSelector((state) => state.products);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const categories = [
    { value: 'electronics', label: 'Électronique' },
    { value: 'fashion', label: 'Mode' },
    { value: 'home', label: 'Maison' },
    { value: 'beauty', label: 'Beauté' },
    { value: 'sports', label: 'Sports' },
    { value: 'books', label: 'Livres' },
    { value: 'other', label: 'Autre' },
  ];

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/seller/products/${productId}`);
      console.log('Produit chargé:', response.data);
      setProduct(response.data);
      // Définir l'image actuelle si elle existe
      if (response.data.images && response.data.images.length > 0) {
        console.log('Image trouvée:', response.data.images[0]);
        setCurrentImage(response.data.images[0]);
      } else {
        console.log('Aucune image pour ce produit');
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.detail || 'Produit non trouvé',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      navigate('/seller/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Type de fichier non autorisé',
          description: 'Utilisez JPEG, PNG, GIF ou WebP.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Fichier trop volumineux',
          description: 'La taille maximale est de 5 Mo.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return;
    
    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await api.put(`/seller/products/${productId}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setCurrentImage(response.data.image_url);
      setImageFile(null);
      setImagePreview(null);
      
      toast({
        title: 'Image mise à jour',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.detail || 'Impossible de mettre à jour l\'image',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const removeNewImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const productData = {
        name: values.name,
        description: values.description,
        price: parseFloat(values.price),
        category: values.category,
        stock_quantity: parseInt(values.stock_quantity),
        status: values.status,
      };

      const result = await dispatch(updateProduct({ productId, productData }));

      if (updateProduct.fulfilled.match(result)) {
        toast({
          title: 'Produit mis à jour',
          description: values.status === 'published' 
            ? 'Votre produit est maintenant visible par les clients.'
            : 'Votre produit a été enregistré.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        navigate('/seller/dashboard');
      } else {
        throw new Error(result.payload || 'Une erreur est survenue');
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxW="container.md" py={10}>
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
    <Container maxW="container.md" py={6}>
      <VStack spacing={6} align="stretch">
        {/* Breadcrumb */}
        <Breadcrumb separator={<ChevronRightIcon color="gray.500" />}>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate('/seller/dashboard')}>
              Ma Boutique
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>Modifier le produit</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <Box bg="white" p={6} rounded="lg" shadow="md">
          <Heading size="lg" mb={6}>Modifier le produit</Heading>

          {product.status === 'draft' && (
            <Alert status="info" mb={6} borderRadius="md">
              <AlertIcon />
              Ce produit est en brouillon. Changez le statut en "Publié" pour le rendre visible aux clients.
            </Alert>
          )}

          <Formik
            initialValues={{
              name: product.name || '',
              description: product.description || '',
              price: product.price || '',
              category: product.category || '',
              stock_quantity: product.stock_quantity || 0,
              status: product.status || 'draft',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, errors, touched, isSubmitting, setFieldValue }) => (
              <Form>
                <VStack spacing={5}>
                  {/* Nom du produit */}
                  <FormControl isInvalid={errors.name && touched.name}>
                    <FormLabel>Nom du produit *</FormLabel>
                    <Field
                      as={Input}
                      name="name"
                      placeholder="Ex: iPhone 15 Pro Max"
                    />
                    <FormErrorMessage>{errors.name}</FormErrorMessage>
                  </FormControl>

                  {/* Description */}
                  <FormControl isInvalid={errors.description && touched.description}>
                    <FormLabel>Description *</FormLabel>
                    <Field
                      as={Textarea}
                      name="description"
                      placeholder="Décrivez votre produit en détail..."
                      rows={5}
                    />
                    <FormErrorMessage>{errors.description}</FormErrorMessage>
                  </FormControl>

                  {/* Prix et Stock */}
                  <HStack spacing={4} w="100%" align="start">
                    <FormControl isInvalid={errors.price && touched.price}>
                      <FormLabel>Prix (€) *</FormLabel>
                      <NumberInput
                        min={0}
                        precision={2}
                        value={values.price}
                        onChange={(valueString) => setFieldValue('price', valueString)}
                      >
                        <NumberInputField placeholder="0.00" />
                      </NumberInput>
                      <FormErrorMessage>{errors.price}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={errors.stock_quantity && touched.stock_quantity}>
                      <FormLabel>Quantité en stock *</FormLabel>
                      <NumberInput
                        min={0}
                        value={values.stock_quantity}
                        onChange={(valueString) => setFieldValue('stock_quantity', parseInt(valueString) || 0)}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                      <FormErrorMessage>{errors.stock_quantity}</FormErrorMessage>
                    </FormControl>
                  </HStack>

                  {/* Catégorie */}
                  <FormControl isInvalid={errors.category && touched.category}>
                    <FormLabel>Catégorie *</FormLabel>
                    <Field as={Select} name="category" placeholder="Sélectionnez une catégorie">
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </Field>
                    <FormErrorMessage>{errors.category}</FormErrorMessage>
                  </FormControl>

                  {/* Image du produit */}
                  <FormControl>
                    <FormLabel>Image du produit</FormLabel>
                    <Input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleImageChange}
                      ref={fileInputRef}
                      display="none"
                      id="product-image-edit"
                    />
                    <VStack spacing={3} align="stretch">
                      {/* Image actuelle */}
                      {currentImage && !imagePreview && (
                        <Box>
                          <Text fontSize="sm" color="gray.500" mb={2}>Image actuelle :</Text>
                          <Image
                            src={currentImage}
                            alt="Image actuelle"
                            borderRadius="md"
                            objectFit="cover"
                            w="200px"
                            h="200px"
                            fallback={<Box w="200px" h="200px" bg="gray.100" borderRadius="md" display="flex" alignItems="center" justifyContent="center"><Text color="gray.400">Chargement...</Text></Box>}
                          />
                        </Box>
                      )}
                      
                      {/* Message si pas d'image */}
                      {!currentImage && !imagePreview && (
                        <Text fontSize="sm" color="gray.400" fontStyle="italic">
                          Aucune image pour ce produit
                        </Text>
                      )}
                      
                      {/* Nouvelle image sélectionnée */}
                      {imagePreview && (
                        <Box>
                          <Text fontSize="sm" color="gray.500" mb={2}>Nouvelle image :</Text>
                          <Box position="relative" w="200px">
                            <Image
                              src={imagePreview}
                              alt="Aperçu"
                              borderRadius="md"
                              objectFit="cover"
                              w="200px"
                              h="200px"
                            />
                            <IconButton
                              icon={<DeleteIcon />}
                              colorScheme="red"
                              size="sm"
                              position="absolute"
                              top={2}
                              right={2}
                              onClick={removeNewImage}
                              aria-label="Annuler"
                            />
                          </Box>
                          <Button
                            mt={2}
                            colorScheme="green"
                            size="sm"
                            onClick={uploadImage}
                            isLoading={uploadingImage}
                            loadingText="Upload..."
                          >
                            Enregistrer l'image
                          </Button>
                        </Box>
                      )}
                      
                      {/* Bouton pour changer l'image */}
                      {!imagePreview && (
                        <Box
                          as="label"
                          htmlFor="product-image-edit"
                          cursor="pointer"
                          borderWidth={2}
                          borderStyle="dashed"
                          borderColor="gray.300"
                          borderRadius="md"
                          p={4}
                          textAlign="center"
                          _hover={{ borderColor: 'blue.400', bg: 'gray.50' }}
                        >
                          <HStack justify="center" spacing={2}>
                            <AttachmentIcon color="gray.400" />
                            <Text color="gray.500" fontSize="sm">
                              {currentImage ? 'Changer l\'image' : 'Ajouter une image'}
                            </Text>
                          </HStack>
                        </Box>
                      )}
                    </VStack>
                  </FormControl>

                  {/* Statut */}
                  <FormControl isInvalid={errors.status && touched.status}>
                    <FormLabel>Statut *</FormLabel>
                    <Field as={Select} name="status">
                      <option value="draft">Brouillon (non visible)</option>
                      <option value="published">Publié (visible par les clients)</option>
                      <option value="out_of_stock">Rupture de stock</option>
                      <option value="archived">Archivé</option>
                    </Field>
                    <FormErrorMessage>{errors.status}</FormErrorMessage>
                    <Text fontSize="sm" color="gray.500" mt={1}>
                      {values.status === 'draft' && 'Le produit ne sera pas visible par les clients.'}
                      {values.status === 'published' && 'Le produit sera visible par les clients.'}
                      {values.status === 'out_of_stock' && 'Le produit sera marqué comme indisponible.'}
                      {values.status === 'archived' && 'Le produit sera archivé et non visible.'}
                    </Text>
                  </FormControl>

                  {/* Boutons */}
                  <HStack spacing={4} w="100%" pt={4}>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/seller/dashboard')}
                      isDisabled={isSubmitting}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      colorScheme="blue"
                      isLoading={isSubmitting || updating}
                      loadingText="Enregistrement..."
                      flex={1}
                    >
                      Enregistrer les modifications
                    </Button>
                  </HStack>
                </VStack>
              </Form>
            )}
          </Formik>
        </Box>
      </VStack>
    </Container>
  );
};

export default EditProductPage;
