// useState retiré car non utilisé
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../../store/slices/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  Text,
  Select,
  FormErrorMessage,
} from '@chakra-ui/react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email invalide')
    .required('Email requis'),
  password: Yup.string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .required('Mot de passe requis'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Les mots de passe ne correspondent pas')
    .required('Confirmation du mot de passe requise'),
  fullName: Yup.string()
    .required('Nom complet requis'),
  phone: Yup.string()
    .matches(/^\+?[0-9]{10,15}$/, 'Numéro de téléphone invalide'),
  role: Yup.string()
    .oneOf(['customer', 'seller'], 'Rôle invalide')
    .required('Rôle requis'),
});

const RegisterForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { loading, error } = useSelector((state) => state.auth);

  return (
    <Box p={8} maxWidth="500px" mx="auto" mt={10} borderWidth={1} borderRadius="lg" boxShadow="lg">
      <Text fontSize="2xl" mb={6} textAlign="center">Créer un compte</Text>
      
      <Formik
        initialValues={{
          email: '',
          password: '',
          confirmPassword: '',
          fullName: '',
          phone: '',
          role: 'customer',
        }}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            const result = await dispatch(register({
              email: values.email,
              password: values.password,
              full_name: values.fullName,
              phone: values.phone,
              role: values.role,
            }));

            if (!result.error) {
              toast({
                title: 'Inscription réussie',
                description: 'Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.',
                status: 'success',
                duration: 5000,
                isClosable: true,
              });
              navigate('/login');
            }
          } catch (error) {
            console.error('Registration error:', error);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form>
            <VStack spacing={4}>
              <Field name="fullName">
                {({ field }) => (
                  <FormControl isInvalid={errors.fullName && touched.fullName}>
                    <FormLabel>Nom complet</FormLabel>
                    <Input {...field} placeholder="Votre nom complet" />
                    <FormErrorMessage>{errors.fullName}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>

              <Field name="email">
                {({ field }) => (
                  <FormControl isInvalid={errors.email && touched.email}>
                    <FormLabel>Email</FormLabel>
                    <Input type="email" {...field} placeholder="votre@email.com" />
                    <FormErrorMessage>{errors.email}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>

              <Field name="phone">
                {({ field }) => (
                  <FormControl isInvalid={errors.phone && touched.phone}>
                    <FormLabel>Téléphone (optionnel)</FormLabel>
                    <Input type="tel" {...field} placeholder="+1234567890" />
                    <FormErrorMessage>{errors.phone}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>

              <Field name="role">
                {({ field }) => (
                  <FormControl isInvalid={errors.role && touched.role}>
                    <FormLabel>Vous êtes</FormLabel>
                    <Select {...field}>
                      <option value="customer">Client</option>
                      <option value="seller">Vendeur</option>
                    </Select>
                    <FormErrorMessage>{errors.role}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>

              <Field name="password">
                {({ field }) => (
                  <FormControl isInvalid={errors.password && touched.password}>
                    <FormLabel>Mot de passe</FormLabel>
                    <Input type="password" {...field} placeholder="••••••" />
                    <FormErrorMessage>{errors.password}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>

              <Field name="confirmPassword">
                {({ field }) => (
                  <FormControl isInvalid={errors.confirmPassword && touched.confirmPassword}>
                    <FormLabel>Confirmer le mot de passe</FormLabel>
                    <Input type="password" {...field} placeholder="••••••" />
                    <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>

              {error && (
                <Box color="red.500" fontSize="sm">
                  {error}
                </Box>
              )}

              <Button
                type="submit"
                colorScheme="blue"
                width="100%"
                isLoading={isSubmitting || loading}
                loadingText="Inscription en cours..."
              >
                S'inscrire
              </Button>

              <Text mt={4} textAlign="center">
                Déjà un compte ?{' '}
                <Text as={Link} to="/login" color="blue.500" fontWeight="medium">
                  Se connecter
                </Text>
              </Text>
            </VStack>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default RegisterForm;