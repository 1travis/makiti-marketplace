import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../store/slices/authSlice';
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
} from '@chakra-ui/react';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login({ email, password }));
    
    if (!result.error) {
      toast({
        title: 'Connexion réussie',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/dashboard');
    }
  };

  return (
    <Box p={8} maxWidth="500px" mx="auto" mt={10} borderWidth={1} borderRadius="lg" boxShadow="lg">
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl id="email" isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Entrez votre email"
            />
          </FormControl>
          
          <FormControl id="password" isRequired>
            <FormLabel>Mot de passe</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Entrez votre mot de passe"
            />
          </FormControl>
          
          {error && (
            <Box color="red.500" fontSize="sm">
              {error}
            </Box>
          )}
          
          <Button
            type="submit"
            colorScheme="blue"
            width="100%"
            isLoading={loading}
            loadingText="Connexion en cours..."
          >
            Se connecter
          </Button>

          <Text mt={4} textAlign="center">
            Pas encore de compte ?{' '}
            <Text as={Link} to="/register" color="blue.500" fontWeight="medium">
              S'inscrire
            </Text>
          </Text>
        </VStack>
      </form>
    </Box>
  );
};

export default LoginForm;