import { Box, Container, Heading, Text } from '@chakra-ui/react';
import CreateShopForm from '../features/shops/CreateShopForm';

const CreateShopPage = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8}>
        <Heading as="h1" size="xl">Créer une nouvelle boutique</Heading>
        <Text color="gray.600" mt={2}>
          Remplissez le formulaire ci-dessous pour créer votre boutique en ligne.
        </Text>
      </Box>
      <CreateShopForm />
    </Container>
  );
};

export default CreateShopPage;