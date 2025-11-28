import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { submitSellerRequest, fetchSellerRequestStatus, clearSuccessMessage } from '../store/slices/sellerSlice';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Button,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Spinner,
} from '@chakra-ui/react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  business_name: Yup.string()
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .required('Nom de l\'entreprise requis'),
  business_description: Yup.string()
    .min(20, 'La description doit contenir au moins 20 caractères')
    .required('Description requise'),
  business_address: Yup.string()
    .required('Adresse requise'),
  business_phone: Yup.string()
    .matches(/^[0-9+\s-]+$/, 'Numéro de téléphone invalide')
    .required('Téléphone requis'),
  document_type: Yup.string()
    .required('Type de document requis'),
  document_url: Yup.string()
    .url('URL invalide')
    .required('Lien vers le document requis'),
});

const SellerRequestPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useSelector((state) => state.auth);
  const { status, request, loading, error, successMessage } = useSelector((state) => state.seller);

  useEffect(() => {
    if (user?.role === 'seller') {
      dispatch(fetchSellerRequestStatus());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (successMessage) {
      toast({
        title: 'Succès',
        description: successMessage,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      dispatch(clearSuccessMessage());
    }
  }, [successMessage, toast, dispatch]);

  useEffect(() => {
    if (error) {
      toast({
        title: 'Erreur',
        description: error,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [error, toast]);

  // Vérifier si l'utilisateur est un vendeur
  if (user?.role !== 'seller') {
    return (
      <Container maxW="container.md" py={10}>
        <Alert status="warning">
          <AlertIcon />
          <AlertTitle>Accès restreint</AlertTitle>
          <AlertDescription>
            Vous devez être inscrit en tant que vendeur pour accéder à cette page.
          </AlertDescription>
        </Alert>
      </Container>
    );
  }

  // Afficher le statut si une demande existe
  if (status !== 'none' && status !== 'rejected') {
    return (
      <Container maxW="container.md" py={10}>
        <Card>
          <CardHeader>
            <Heading size="lg">Statut de votre demande</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontWeight="bold" mb={2}>Statut :</Text>
                <Badge
                  colorScheme={
                    status === 'pending' ? 'yellow' :
                    status === 'approved' ? 'green' : 'red'
                  }
                  fontSize="md"
                  p={2}
                >
                  {status === 'pending' ? 'En attente d\'approbation' :
                   status === 'approved' ? 'Approuvé' : 'Refusé'}
                </Badge>
              </Box>

              {status === 'pending' && (
                <Alert status="info">
                  <AlertIcon />
                  Votre demande est en cours d'examen par un administrateur.
                  Vous serez notifié une fois qu'elle sera traitée.
                </Alert>
              )}

              {status === 'approved' && (
                <Alert status="success">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Félicitations !</AlertTitle>
                    <AlertDescription>
                      Votre compte vendeur est approuvé. Vous pouvez maintenant créer votre boutique et publier des produits.
                    </AlertDescription>
                  </Box>
                </Alert>
              )}

              {request && (
                <>
                  <Divider />
                  <Heading size="md">Informations soumises</Heading>
                  <Box>
                    <Text><strong>Nom de l'entreprise :</strong> {request.business_name}</Text>
                    <Text><strong>Description :</strong> {request.business_description}</Text>
                    <Text><strong>Adresse :</strong> {request.business_address}</Text>
                    <Text><strong>Téléphone :</strong> {request.business_phone}</Text>
                    <Text><strong>Type de document :</strong> {request.document_type}</Text>
                    <Text>
                      <strong>Document :</strong>{' '}
                      <a href={request.document_url} target="_blank" rel="noopener noreferrer" style={{ color: 'blue' }}>
                        Voir le document
                      </a>
                    </Text>
                  </Box>
                </>
              )}

              {status === 'approved' && (
                <Button colorScheme="blue" onClick={() => navigate('/shops/new')}>
                  Créer ma boutique
                </Button>
              )}
            </VStack>
          </CardBody>
        </Card>
      </Container>
    );
  }

  // Formulaire de demande
  return (
    <Container maxW="container.md" py={10}>
      <Card>
        <CardHeader>
          <Heading size="lg">Demande d'approbation vendeur</Heading>
          <Text color="gray.600" mt={2}>
            Remplissez ce formulaire pour soumettre votre demande d'approbation.
            Un administrateur examinera vos informations.
          </Text>
        </CardHeader>
        <CardBody>
          {status === 'rejected' && request?.rejection_reason && (
            <Alert status="error" mb={6}>
              <AlertIcon />
              <Box>
                <AlertTitle>Demande précédente refusée</AlertTitle>
                <AlertDescription>
                  Raison : {request.rejection_reason}
                </AlertDescription>
              </Box>
            </Alert>
          )}

          <Formik
            initialValues={{
              business_name: '',
              business_description: '',
              business_address: '',
              business_phone: '',
              document_type: '',
              document_url: '',
            }}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting }) => {
              await dispatch(submitSellerRequest(values));
              setSubmitting(false);
            }}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form>
                <VStack spacing={4}>
                  <Field name="business_name">
                    {({ field }) => (
                      <FormControl isInvalid={errors.business_name && touched.business_name}>
                        <FormLabel>Nom de l'entreprise / Boutique *</FormLabel>
                        <Input {...field} placeholder="Ex: Ma Super Boutique" />
                        {errors.business_name && touched.business_name && (
                          <Text color="red.500" fontSize="sm">{errors.business_name}</Text>
                        )}
                      </FormControl>
                    )}
                  </Field>

                  <Field name="business_description">
                    {({ field }) => (
                      <FormControl isInvalid={errors.business_description && touched.business_description}>
                        <FormLabel>Description de votre activité *</FormLabel>
                        <Textarea
                          {...field}
                          placeholder="Décrivez votre activité, les produits que vous vendez..."
                          rows={4}
                        />
                        {errors.business_description && touched.business_description && (
                          <Text color="red.500" fontSize="sm">{errors.business_description}</Text>
                        )}
                      </FormControl>
                    )}
                  </Field>

                  <Field name="business_address">
                    {({ field }) => (
                      <FormControl isInvalid={errors.business_address && touched.business_address}>
                        <FormLabel>Adresse de l'entreprise *</FormLabel>
                        <Input {...field} placeholder="Adresse complète" />
                        {errors.business_address && touched.business_address && (
                          <Text color="red.500" fontSize="sm">{errors.business_address}</Text>
                        )}
                      </FormControl>
                    )}
                  </Field>

                  <Field name="business_phone">
                    {({ field }) => (
                      <FormControl isInvalid={errors.business_phone && touched.business_phone}>
                        <FormLabel>Téléphone professionnel *</FormLabel>
                        <Input {...field} placeholder="+33 6 12 34 56 78" />
                        {errors.business_phone && touched.business_phone && (
                          <Text color="red.500" fontSize="sm">{errors.business_phone}</Text>
                        )}
                      </FormControl>
                    )}
                  </Field>

                  <Field name="document_type">
                    {({ field }) => (
                      <FormControl isInvalid={errors.document_type && touched.document_type}>
                        <FormLabel>Type de document d'autorisation *</FormLabel>
                        <Select {...field} placeholder="Sélectionnez le type de document">
                          <option value="registre_commerce">Registre de commerce</option>
                          <option value="licence_commerciale">Licence commerciale</option>
                          <option value="carte_artisan">Carte d'artisan</option>
                          <option value="attestation_fiscale">Attestation fiscale</option>
                          <option value="autre">Autre document officiel</option>
                        </Select>
                        {errors.document_type && touched.document_type && (
                          <Text color="red.500" fontSize="sm">{errors.document_type}</Text>
                        )}
                      </FormControl>
                    )}
                  </Field>

                  <Field name="document_url">
                    {({ field }) => (
                      <FormControl isInvalid={errors.document_url && touched.document_url}>
                        <FormLabel>Lien vers le document *</FormLabel>
                        <Input
                          {...field}
                          placeholder="https://drive.google.com/... ou autre lien"
                        />
                        <Text fontSize="sm" color="gray.500" mt={1}>
                          Uploadez votre document sur Google Drive, Dropbox ou autre service et collez le lien ici.
                        </Text>
                        {errors.document_url && touched.document_url && (
                          <Text color="red.500" fontSize="sm">{errors.document_url}</Text>
                        )}
                      </FormControl>
                    )}
                  </Field>

                  <Button
                    type="submit"
                    colorScheme="blue"
                    size="lg"
                    width="100%"
                    isLoading={isSubmitting || loading}
                    loadingText="Soumission en cours..."
                  >
                    Soumettre ma demande
                  </Button>
                </VStack>
              </Form>
            )}
          </Formik>
        </CardBody>
      </Card>
    </Container>
  );
};

export default SellerRequestPage;
