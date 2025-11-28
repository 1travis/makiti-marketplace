import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsers, updateUserRole, deleteUser } from '../store/slices/adminSlice';
import {
  Box,
  Container,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Button,
  useToast,
  Badge,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Spinner,
  Text,
  HStack,
  VStack,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { useRef } from 'react';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const { users, loading, error } = useSelector((state) => state.admin);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

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

  const handleRoleChange = async (userId, newRole) => {
    const result = await dispatch(updateUserRole({ userId, newRole }));
    if (!result.error) {
      toast({
        title: 'Succès',
        description: 'Rôle mis à jour avec succès',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    onOpen();
  };

  const handleDeleteConfirm = async () => {
    if (userToDelete) {
      const result = await dispatch(deleteUser(userToDelete.id));
      if (!result.error) {
        toast({
          title: 'Succès',
          description: 'Utilisateur supprimé avec succès',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    }
    onClose();
    setUserToDelete(null);
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'red';
      case 'seller':
        return 'green';
      case 'customer':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrateur';
      case 'seller':
        return 'Vendeur';
      case 'customer':
        return 'Client';
      default:
        return role;
    }
  };

  if (loading && users.length === 0) {
    return (
      <Container maxW="container.xl" py={10}>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Chargement des utilisateurs...</Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg">Gestion des Utilisateurs</Heading>
        
        <Box bg="white" shadow="md" borderRadius="lg" overflow="hidden">
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th>Nom</Th>
                <Th>Email</Th>
                <Th>Téléphone</Th>
                <Th>Rôle actuel</Th>
                <Th>Changer le rôle</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users.map((user) => (
                <Tr key={user.id}>
                  <Td fontWeight="medium">{user.full_name}</Td>
                  <Td>{user.email}</Td>
                  <Td>{user.phone || '-'}</Td>
                  <Td>
                    <Badge colorScheme={getRoleBadgeColor(user.role)}>
                      {getRoleLabel(user.role)}
                    </Badge>
                  </Td>
                  <Td>
                    {user.role !== 'admin' ? (
                      <Select
                        size="sm"
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        w="150px"
                      >
                        <option value="customer">Client</option>
                        <option value="seller">Vendeur</option>
                      </Select>
                    ) : (
                      <Text fontSize="sm" color="gray.500">-</Text>
                    )}
                  </Td>
                  <Td>
                    {user.role !== 'admin' ? (
                      <Button
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        leftIcon={<DeleteIcon />}
                        onClick={() => handleDeleteClick(user)}
                      >
                        Supprimer
                      </Button>
                    ) : (
                      <Text fontSize="sm" color="gray.500">-</Text>
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {users.length === 0 && !loading && (
          <Box textAlign="center" py={10}>
            <Text color="gray.500">Aucun utilisateur trouvé</Text>
          </Box>
        )}
      </VStack>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Supprimer l'utilisateur
            </AlertDialogHeader>

            <AlertDialogBody>
              Êtes-vous sûr de vouloir supprimer l'utilisateur{' '}
              <strong>{userToDelete?.full_name}</strong> ? Cette action est
              irréversible.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Annuler
              </Button>
              <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}>
                Supprimer
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
};

export default AdminDashboard;
