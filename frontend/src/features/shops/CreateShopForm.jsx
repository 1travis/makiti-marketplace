import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createShop } from '../../store/shopSlice';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  VStack,
  HStack,
  IconButton,
  useToast,
  Text,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

// Schéma de validation
const validationSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .required('Le nom est requis'),
  description: Yup.string()
    .max(1000, 'La description ne peut pas dépasser 1000 caractères')
    .required('La description est requise'),
  contact_email: Yup.string()
    .email('Email invalide')
    .required('Email de contact requis'),
  contact_phone: Yup.string()
    .matches(/^[0-9+\s-]+$/, 'Numéro de téléphone invalide')
    .required('Téléphone de contact requis'),
  address: Yup.object().shape({
    street: Yup.string().required('La rue est requise'),
    city: Yup.string().required('La ville est requise'),
    postal_code: Yup.string().required('Le code postal est requis'),
    country: Yup.string().required('Le pays est requis'),
  }),
  categories: Yup.array()
    .of(Yup.string())
    .min(1, 'Au moins une catégorie est requise'),
  social_media: Yup.object().shape({
    facebook: Yup.string().url('URL Facebook invalide').nullable(),
    twitter: Yup.string().url('URL Twitter invalide').nullable(),
    instagram: Yup.string().url('URL Instagram invalide').nullable(),
  }),
});

const initialValues = {
  name: '',
  description: '',
  logo_url: null,
  banner_url: null,
  contact_email: '',
  contact_phone: '',
  address: {
    street: '',
    city: '',
    postal_code: '',
    country: 'France',
  },
  categories: [],
  social_media: {
    facebook: '',
    twitter: '',
    instagram: '',
  },
};

const CreateShopForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [logoPreview, setLogoPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [availableCategories] = useState([
    'Alimentation',
    'Mode',
    'Électronique',
    'Maison',
    'Beauté',
    'Sport',
    'Loisirs',
    'Autre',
  ]);

  const handleLogoChange = (event, setFieldValue) => {
    const file = event.currentTarget.files[0];
    if (file) {
      setFieldValue('logo_url', file);
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (event, setFieldValue) => {
    const file = event.currentTarget.files[0];
    if (file) {
      setFieldValue('banner_url', file);
      const reader = new FileReader();
      reader.onload = () => {
        setBannerPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Préparer les données JSON (sans les fichiers pour l'instant)
      const shopData = {
        name: values.name,
        description: values.description,
        contact_email: values.contact_email,
        contact_phone: values.contact_phone,
        address: values.address,
        social_media: values.social_media,
        categories: values.categories,
        // Les URLs des images seront gérées plus tard avec un upload séparé
        logo_url: null,
        banner_url: null,
      };

      // Appel à l'API via Redux
      const resultAction = await dispatch(createShop(shopData));
      
      if (createShop.fulfilled.match(resultAction)) {
        toast({
          title: 'Boutique créée avec succès',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        navigate('/dashboard');
      } else {
        throw new Error(resultAction.payload || 'Une erreur est survenue');
      }
    } catch (error) {
      toast({
        title: 'Erreur lors de la création de la boutique',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const CategoryModal = ({ isOpen, onClose, availableCategories, onAddCategory }) => {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Ajouter une catégorie</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Formik
              initialValues={{ category: '', custom_category: '' }}
              onSubmit={(values, { setSubmitting, resetForm }) => {
                if (values.category) {
                  onAddCategory(values.category === 'Autre' ? values.custom_category : values.category);
                }
                resetForm();
                onClose();
                setSubmitting(false);
              }}
            >
              {({ values, handleChange, handleSubmit, isSubmitting }) => (
                <form onSubmit={handleSubmit}>
                  <VStack spacing={4}>
                    <Select
                      name="category"
                      value={values.category}
                      onChange={handleChange}
                      placeholder="Sélectionnez une catégorie"
                      mb={4}
                    >
                      {availableCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </Select>
                    {values.category === 'Autre' && (
                      <Input
                        name="custom_category"
                        value={values.custom_category}
                        onChange={handleChange}
                        placeholder="Entrez le nom de la catégorie"
                      />
                    )}
                    <Button 
                      type="submit" 
                      colorScheme="blue" 
                      mt={4}
                      isDisabled={!values.category || (values.category === 'Autre' && !values.custom_category)}
                    >
                      Ajouter
                    </Button>
                  </VStack>
                </form>
              )}
            </Formik>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  };

  return (
    <Box bg="white" p={6} rounded="lg" shadow="md">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, isSubmitting, setFieldValue }) => {
          const handleAddCategory = (category) => {
            if (category && !values.categories.includes(category)) {
              setFieldValue('categories', [...values.categories, category]);
            }
          };

          return (
            <Form>
              <VStack spacing={6}>
                {/* Logo et bannière */}
                <HStack spacing={6} w="100%" align="flex-start">
                  <Box flex={1}>
                    <FormControl>
                      <FormLabel>Logo de la boutique</FormLabel>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleLogoChange(e, setFieldValue)}
                        p={1}
                      />
                      {logoPreview && (
                        <Box mt={2} boxSize="100px">
                          <Image src={logoPreview} alt="Aperçu du logo" maxH="100%" maxW="100%" objectFit="contain" />
                        </Box>
                      )}
                    </FormControl>
                  </Box>
                  <Box flex={2}>
                    <FormControl>
                      <FormLabel>Bannière de la boutique</FormLabel>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleBannerChange(e, setFieldValue)}
                        p={1}
                      />
                      {bannerPreview && (
                        <Box mt={2} h="150px" w="100%">
                          <Image src={bannerPreview} alt="Aperçu de la bannière" w="100%" h="100%" objectFit="cover" />
                        </Box>
                      )}
                    </FormControl>
                  </Box>
                </HStack>

                {/* Informations de base */}
                <FormControl isInvalid={errors.name && touched.name}>
                  <FormLabel>Nom de la boutique *</FormLabel>
                  <Field
                    as={Input}
                    name="name"
                    placeholder="Nom de votre boutique"
                  />
                  {errors.name && touched.name && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.name}
                    </Text>
                  )}
                </FormControl>

                <FormControl isInvalid={errors.description && touched.description}>
                  <FormLabel>Description *</FormLabel>
                  <Field
                    as={Textarea}
                    name="description"
                    placeholder="Décrivez votre boutique en quelques mots..."
                    rows={4}
                  />
                  {errors.description && touched.description && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.description}
                    </Text>
                  )}
                </FormControl>

                {/* Catégories */}
                <FormControl isInvalid={errors.categories && touched.categories}>
                  <FormLabel>Catégories *</FormLabel>
                  <HStack spacing={2} flexWrap="wrap">
                    {values.categories && values.categories.map((category, index) => (
                      <Box
                        key={index}
                        bg="blue.100"
                        px={3}
                        py={1}
                        borderRadius="full"
                        display="flex"
                        alignItems="center"
                      >
                        <Text mr={2}>{category}</Text>
                        <IconButton
                          aria-label="Supprimer la catégorie"
                          icon={<DeleteIcon />}
                          size="xs"
                          variant="ghost"
                          onClick={() => {
                            const newCategories = [...values.categories];
                            newCategories.splice(index, 1);
                            setFieldValue('categories', newCategories);
                          }}
                        />
                      </Box>
                    ))}
                    <Button
                      leftIcon={<AddIcon />}
                      size="sm"
                      onClick={onOpen}
                    >
                      Ajouter une catégorie
                    </Button>
                  </HStack>
                  {errors.categories && touched.categories && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.categories}
                    </Text>
                  )}
                </FormControl>

                {/* Coordonnées */}
                <FormControl isInvalid={errors.contact_email && touched.contact_email}>
                  <FormLabel>Email de contact *</FormLabel>
                  <Field
                    as={Input}
                    name="contact_email"
                    type="email"
                    placeholder="contact@votreboutique.com"
                  />
                  {errors.contact_email && touched.contact_email && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.contact_email}
                    </Text>
                  )}
                </FormControl>

                <FormControl isInvalid={errors.contact_phone && touched.contact_phone}>
                  <FormLabel>Téléphone de contact *</FormLabel>
                  <Field
                    as={Input}
                    name="contact_phone"
                    placeholder="+33 6 12 34 56 78"
                  />
                  {errors.contact_phone && touched.contact_phone && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.contact_phone}
                    </Text>
                  )}
                </FormControl>

                {/* Adresse */}
                <Box w="100%" borderWidth="1px" borderRadius="lg" p={4}>
                  <Text fontWeight="bold" mb={4}>Adresse de la boutique</Text>
                  
                  <FormControl isInvalid={errors.address?.street && touched.address?.street} mb={4}>
                    <FormLabel>Rue *</FormLabel>
                    <Field
                      as={Input}
                      name="address.street"
                      placeholder="123 Rue de la Paix"
                    />
                    {errors.address?.street && touched.address?.street && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        {errors.address.street}
                      </Text>
                    )}
                  </FormControl>

                  <HStack spacing={4} mb={4}>
                    <FormControl isInvalid={errors.address?.postal_code && touched.address?.postal_code}>
                      <FormLabel>Code postal *</FormLabel>
                      <Field
                        as={Input}
                        name="address.postal_code"
                        placeholder="75001"
                      />
                      {errors.address?.postal_code && touched.address?.postal_code && (
                        <Text color="red.500" fontSize="sm" mt={1}>
                          {errors.address.postal_code}
                        </Text>
                      )}
                    </FormControl>

                    <FormControl isInvalid={errors.address?.city && touched.address?.city}>
                      <FormLabel>Ville *</FormLabel>
                      <Field
                        as={Input}
                        name="address.city"
                        placeholder="Paris"
                      />
                      {errors.address?.city && touched.address?.city && (
                        <Text color="red.500" fontSize="sm" mt={1}>
                          {errors.address.city}
                        </Text>
                      )}
                    </FormControl>
                  </HStack>

                  <FormControl isInvalid={errors.address?.country && touched.address?.country}>
                    <FormLabel>Pays *</FormLabel>
                    <Field
                      as={Select}
                      name="address.country"
                      placeholder="Sélectionnez un pays"
                    >
                      <option value="France">France</option>
                      <option value="Belgique">Belgique</option>
                      <option value="Suisse">Suisse</option>
                      <option value="Canada">Canada</option>
                      <option value="Autre">Autre</option>
                    </Field>
                    {errors.address?.country && touched.address?.country && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        {errors.address.country}
                      </Text>
                    )}
                  </FormControl>
                </Box>

                {/* Réseaux sociaux */}
                <Box w="100%">
                  <Text fontWeight="bold" mb={4}>Réseaux sociaux (optionnel)</Text>
                  
                  <FormControl mb={4} isInvalid={errors.social_media?.facebook && touched.social_media?.facebook}>
                    <FormLabel>Facebook</FormLabel>
                    <Field
                      as={Input}
                      name="social_media.facebook"
                      placeholder="https://facebook.com/votreboutique"
                    />
                    {errors.social_media?.facebook && touched.social_media?.facebook && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        {errors.social_media.facebook}
                      </Text>
                    )}
                  </FormControl>

                  <FormControl mb={4} isInvalid={errors.social_media?.twitter && touched.social_media?.twitter}>
                    <FormLabel>Twitter</FormLabel>
                    <Field
                      as={Input}
                      name="social_media.twitter"
                      placeholder="https://twitter.com/votreboutique"
                    />
                    {errors.social_media?.twitter && touched.social_media?.twitter && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        {errors.social_media.twitter}
                      </Text>
                    )}
                  </FormControl>

                  <FormControl isInvalid={errors.social_media?.instagram && touched.social_media?.instagram}>
                    <FormLabel>Instagram</FormLabel>
                    <Field
                      as={Input}
                      name="social_media.instagram"
                      placeholder="https://instagram.com/votreboutique"
                    />
                    {errors.social_media?.instagram && touched.social_media?.instagram && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        {errors.social_media.instagram}
                      </Text>
                    )}
                  </FormControl>
                </Box>

                {/* Bouton de soumission */}
                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  isLoading={isSubmitting}
                  loadingText="Création en cours..."
                >
                  Créer la boutique
                </Button>
              </VStack>

              <CategoryModal 
                isOpen={isOpen} 
                onClose={onClose}
                availableCategories={availableCategories}
                onAddCategory={handleAddCategory}
              />
            </Form>
          );
        }}
      </Formik>
    </Box>
  );
};

export default CreateShopForm;