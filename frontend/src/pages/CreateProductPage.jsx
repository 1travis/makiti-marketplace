import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchMyShop } from '../store/slices/productSlice';
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

const initialValues = {
  name: '',
  description: '',
  price: '',
  category: '',
  stock_quantity: 0,
  status: 'draft',
  images: [],
};

const CreateProductPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { myShop, loading } = useSelector((state) => state.products);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    dispatch(fetchMyShop());
  }, [dispatch]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier le type de fichier
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
      
      // Vérifier la taille (max 5MB)
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

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Créer un FormData pour envoyer l'image
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('description', values.description);
      formData.append('price', parseFloat(values.price));
      formData.append('category', values.category);
      formData.append('stock_quantity', parseInt(values.stock_quantity));
      formData.append('product_status', values.status);
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await api.post('/seller/products/with-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast({
        title: 'Produit créé avec succès',
        description: values.status === 'published' 
          ? 'Votre produit est maintenant visible par les clients.'
          : 'Votre produit a été enregistré comme brouillon.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      navigate('/seller/dashboard');
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.detail || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const categories = [
    { value: 'electronics', label: 'Électronique' },
    { value: 'fashion', label: 'Mode' },
    { value: 'home', label: 'Maison' },
    { value: 'beauty', label: 'Beauté' },
    { value: 'sports', label: 'Sports' },
    { value: 'books', label: 'Livres' },
    { value: 'other', label: 'Autre' },
  ];

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
            <BreadcrumbLink>Nouveau Produit</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <Box bg="white" p={6} rounded="lg" shadow="md">
          <Heading size="lg" mb={6}>Ajouter un nouveau produit</Heading>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
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
                      id="product-image"
                    />
                    <VStack spacing={3} align="stretch">
                      {imagePreview ? (
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
                            onClick={removeImage}
                            aria-label="Supprimer l'image"
                          />
                        </Box>
                      ) : (
                        <Box
                          as="label"
                          htmlFor="product-image"
                          cursor="pointer"
                          borderWidth={2}
                          borderStyle="dashed"
                          borderColor="gray.300"
                          borderRadius="md"
                          p={6}
                          textAlign="center"
                          _hover={{ borderColor: 'blue.400', bg: 'gray.50' }}
                        >
                          <VStack spacing={2}>
                            <AttachmentIcon boxSize={8} color="gray.400" />
                            <Text color="gray.500">
                              Cliquez pour ajouter une image
                            </Text>
                            <Text fontSize="xs" color="gray.400">
                              JPEG, PNG, GIF ou WebP (max 5 Mo)
                            </Text>
                          </VStack>
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
                    </Field>
                    <FormErrorMessage>{errors.status}</FormErrorMessage>
                    <Text fontSize="sm" color="gray.500" mt={1}>
                      {values.status === 'draft' 
                        ? 'Le produit ne sera pas visible par les clients.'
                        : 'Le produit sera immédiatement visible par les clients.'}
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
                      isLoading={isSubmitting}
                      loadingText="Création..."
                      flex={1}
                    >
                      Créer le produit
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

export default CreateProductPage;
