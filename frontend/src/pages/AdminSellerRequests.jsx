import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPendingRequests, processSellerRequest, clearSuccessMessage } from '../store/slices/sellerSlice';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  useToast,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  Link,
  SimpleGrid,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import { CheckIcon, CloseIcon, ExternalLinkIcon } from '@chakra-ui/icons';

const AdminSellerRequests = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const { pendingRequests, loading, error, successMessage } = useSelector((state) => state.seller);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedUser, setSelectedUser] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionType, setActionType] = useState(null);

  useEffect(() => {
    dispatch(fetchPendingRequests());
  }, [dispatch]);

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

  const handleApprove = (user) => {
    setSelectedUser(user);
    setActionType('approve');
    onOpen();
  };

  const handleReject = (user) => {
    setSelectedUser(user);
    setActionType('reject');
    setRejectionReason('');
    onOpen();
  };

  const handleConfirmAction = async () => {
    if (selectedUser) {
      await dispatch(processSellerRequest({
        userId: selectedUser.id,
        action: actionType,
        rejectionReason: actionType === 'reject' ? rejectionReason : null
      }));
    }
    onClose();
    setSelectedUser(null);
    setRejectionReason('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDocumentTypeLabel = (type) => {
    const types = {
      'registre_commerce': 'Registre de commerce',
      'licence_commerciale': 'Licence commerciale',
      'carte_artisan': 'Carte d\'artisan',
      'attestation_fiscale': 'Attestation fiscale',
      'autre': 'Autre document officiel'
    };
    return types[type] || type;
  };

  if (loading && pendingRequests.length === 0) {
    return (
      <Container maxW="container.xl" py={10}>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Chargement des demandes...</Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg">Demandes d'approbation vendeur</Heading>
          <Text color="gray.600" mt={2}>
            Examinez et traitez les demandes des vendeurs en attente d'approbation.
          </Text>
        </Box>

        {pendingRequests.length === 0 ? (
          <Alert status="info">
            <AlertIcon />
            Aucune demande en attente pour le moment.
          </Alert>
        ) : (
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            {pendingRequests.map((user) => (
              <Card key={user.id} shadow="md">
                <CardHeader pb={2}>
                  <HStack justify="space-between">
                    <Box>
                      <Heading size="md">{user.full_name}</Heading>
                      <Text color="gray.600" fontSize="sm">{user.email}</Text>
                    </Box>
                    <Badge colorScheme="yellow" fontSize="sm">En attente</Badge>
                  </HStack>
                </CardHeader>
                <CardBody pt={2}>
                  <VStack align="stretch" spacing={3}>
                    {user.seller_request && (
                      <>
                        <Box bg="gray.50" p={3} borderRadius="md">
                          <Text fontWeight="bold" color="blue.600">
                            {user.seller_request.business_name}
                          </Text>
                          <Text fontSize="sm" mt={1}>
                            {user.seller_request.business_description}
                          </Text>
                        </Box>

                        <Accordion allowToggle>
                          <AccordionItem border="none">
                            <AccordionButton px={0}>
                              <Box flex="1" textAlign="left" fontWeight="medium">
                                Voir tous les détails
                              </Box>
                              <AccordionIcon />
                            </AccordionButton>
                            <AccordionPanel px={0}>
                              <VStack align="stretch" spacing={2} fontSize="sm">
                                <HStack>
                                  <Text fontWeight="bold" minW="120px">Adresse :</Text>
                                  <Text>{user.seller_request.business_address}</Text>
                                </HStack>
                                <HStack>
                                  <Text fontWeight="bold" minW="120px">Téléphone :</Text>
                                  <Text>{user.seller_request.business_phone}</Text>
                                </HStack>
                                <HStack>
                                  <Text fontWeight="bold" minW="120px">Document :</Text>
                                  <Text>{getDocumentTypeLabel(user.seller_request.document_type)}</Text>
                                </HStack>
                                <HStack>
                                  <Text fontWeight="bold" minW="120px">Lien :</Text>
                                  <Link
                                    href={user.seller_request.document_url}
                                    isExternal
                                    color="blue.500"
                                  >
                                    Voir le document <ExternalLinkIcon mx="2px" />
                                  </Link>
                                </HStack>
                                <HStack>
                                  <Text fontWeight="bold" minW="120px">Soumis le :</Text>
                                  <Text>{formatDate(user.seller_request.submitted_at)}</Text>
                                </HStack>
                              </VStack>
                            </AccordionPanel>
                          </AccordionItem>
                        </Accordion>

                        <Divider />

                        <HStack spacing={3}>
                          <Button
                            colorScheme="green"
                            leftIcon={<CheckIcon />}
                            flex={1}
                            onClick={() => handleApprove(user)}
                          >
                            Approuver
                          </Button>
                          <Button
                            colorScheme="red"
                            variant="outline"
                            leftIcon={<CloseIcon />}
                            flex={1}
                            onClick={() => handleReject(user)}
                          >
                            Refuser
                          </Button>
                        </HStack>
                      </>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </VStack>

      {/* Modal de confirmation */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {actionType === 'approve' ? 'Approuver la demande' : 'Refuser la demande'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {actionType === 'approve' ? (
              <Text>
                Êtes-vous sûr de vouloir approuver la demande de{' '}
                <strong>{selectedUser?.full_name}</strong> ?
                <br /><br />
                Cette action permettra au vendeur de créer sa boutique et de publier des produits.
              </Text>
            ) : (
              <VStack spacing={4} align="stretch">
                <Text>
                  Êtes-vous sûr de vouloir refuser la demande de{' '}
                  <strong>{selectedUser?.full_name}</strong> ?
                </Text>
                <FormControl>
                  <FormLabel>Raison du refus (optionnel)</FormLabel>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Expliquez la raison du refus..."
                  />
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Annuler
            </Button>
            <Button
              colorScheme={actionType === 'approve' ? 'green' : 'red'}
              onClick={handleConfirmAction}
              isLoading={loading}
            >
              {actionType === 'approve' ? 'Approuver' : 'Refuser'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default AdminSellerRequests;
