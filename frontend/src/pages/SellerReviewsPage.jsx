import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Badge,
  useToast,
  Spinner,
  useColorModeValue,
  Avatar,
  Icon,
  Progress,
  Divider,
  Textarea,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { FiStar, FiMessageCircle, FiSend, FiTrendingUp } from 'react-icons/fi';
import { motion } from 'framer-motion';
import api from '../api/axios';

const MotionBox = motion(Box);

const StarDisplay = ({ rating, size = 4 }) => {
  return (
    <HStack spacing={0.5}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Icon
          key={star}
          as={FiStar}
          boxSize={size}
          fill={rating >= star ? 'yellow.400' : 'none'}
          color={rating >= star ? 'yellow.400' : 'gray.300'}
        />
      ))}
    </HStack>
  );
};

const SellerReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { user } = useSelector((state) => state.auth);
  const bgColor = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    if (user?.id) {
      fetchReviews();
    }
  }, [user]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/reviews/seller/${user.id}`);
      setReviews(response.data.reviews || []);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Erreur chargement avis:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les avis',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const openReplyModal = (review) => {
    setSelectedReview(review);
    setReplyText(review.seller_reply || '');
    onOpen();
  };

  const handleReply = async () => {
    if (!replyText.trim()) {
      toast({
        title: 'Réponse vide',
        description: 'Veuillez écrire une réponse',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setReplying(true);
      await api.post(`/reviews/${selectedReview.id}/reply`, {
        reply: replyText.trim(),
      });

      toast({
        title: 'Réponse envoyée',
        description: 'Votre réponse a été publiée',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onClose();
      fetchReviews();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.detail || 'Impossible d\'envoyer la réponse',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setReplying(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={10}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Chargement des avis...</Text>
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
            <Heading size="lg" mb={1}>
              <HStack>
                <Icon as={FiStar} color="yellow.400" />
                <Text>Avis clients</Text>
              </HStack>
            </Heading>
            <Text color="gray.500">
              Gérez les avis de vos clients et répondez-leur
            </Text>
          </Box>
        </Flex>

        {/* Statistiques */}
        {stats && (
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
            <Box bg={bgColor} p={4} borderRadius="xl" shadow="md">
              <Stat>
                <StatLabel>Note moyenne</StatLabel>
                <StatNumber>
                  <HStack>
                    <Text>{stats.average}</Text>
                    <Icon as={FiStar} color="yellow.400" fill="yellow.400" />
                  </HStack>
                </StatNumber>
                <StatHelpText>sur 5</StatHelpText>
              </Stat>
            </Box>
            <Box bg={bgColor} p={4} borderRadius="xl" shadow="md">
              <Stat>
                <StatLabel>Total des avis</StatLabel>
                <StatNumber>{stats.total}</StatNumber>
                <StatHelpText>avis reçus</StatHelpText>
              </Stat>
            </Box>
            <Box bg={bgColor} p={4} borderRadius="xl" shadow="md">
              <Stat>
                <StatLabel>Avis positifs</StatLabel>
                <StatNumber color="green.500">
                  {(stats.distribution?.['5'] || 0) + (stats.distribution?.['4'] || 0)}
                </StatNumber>
                <StatHelpText>4-5 étoiles</StatHelpText>
              </Stat>
            </Box>
            <Box bg={bgColor} p={4} borderRadius="xl" shadow="md">
              <Stat>
                <StatLabel>À répondre</StatLabel>
                <StatNumber color="orange.500">
                  {reviews.filter(r => !r.seller_reply).length}
                </StatNumber>
                <StatHelpText>sans réponse</StatHelpText>
              </Stat>
            </Box>
          </SimpleGrid>
        )}

        {/* Distribution des notes */}
        {stats && stats.total > 0 && (
          <Box bg={bgColor} p={6} borderRadius="xl" shadow="md">
            <Text fontWeight="semibold" mb={4}>Distribution des notes</Text>
            <VStack align="stretch" spacing={2}>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.distribution?.[star] || 0;
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <HStack key={star} spacing={4}>
                    <HStack spacing={1} minW="60px">
                      <Text fontWeight="medium">{star}</Text>
                      <Icon as={FiStar} boxSize={4} color="yellow.400" fill="yellow.400" />
                    </HStack>
                    <Progress
                      value={percentage}
                      size="md"
                      colorScheme={star >= 4 ? 'green' : star >= 3 ? 'yellow' : 'red'}
                      flex={1}
                      borderRadius="full"
                    />
                    <Text fontSize="sm" color="gray.500" minW="60px" textAlign="right">
                      {count} ({percentage.toFixed(0)}%)
                    </Text>
                  </HStack>
                );
              })}
            </VStack>
          </Box>
        )}

        {/* Liste des avis */}
        <Box>
          <Text fontWeight="semibold" fontSize="lg" mb={4}>
            Tous les avis ({reviews.length})
          </Text>

          {reviews.length === 0 ? (
            <Box bg={bgColor} p={10} borderRadius="xl" textAlign="center" shadow="md">
              <Icon as={FiStar} boxSize={12} color="gray.300" mb={4} />
              <Text color="gray.500" fontSize="lg">
                Aucun avis pour le moment
              </Text>
              <Text color="gray.400" fontSize="sm">
                Les avis de vos clients apparaîtront ici
              </Text>
            </Box>
          ) : (
            <VStack align="stretch" spacing={4}>
              {reviews.map((review) => (
                <MotionBox
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box bg={bgColor} p={5} borderRadius="xl" shadow="md">
                    <VStack align="stretch" spacing={4}>
                      {/* En-tête */}
                      <Flex justify="space-between" align="start" flexWrap="wrap" gap={2}>
                        <HStack spacing={3}>
                          <Avatar name={review.user_name} size="md" />
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="semibold">{review.user_name}</Text>
                            <Text fontSize="sm" color="gray.500">
                              {formatDate(review.created_at)}
                            </Text>
                          </VStack>
                        </HStack>
                        <VStack align="end" spacing={1}>
                          <StarDisplay rating={review.rating} size={5} />
                          {!review.seller_reply && (
                            <Badge colorScheme="orange" fontSize="xs">
                              En attente de réponse
                            </Badge>
                          )}
                        </VStack>
                      </Flex>

                      {/* Commentaire */}
                      {review.comment && (
                        <Box bg={cardBg} p={4} borderRadius="lg">
                          <Text>{review.comment}</Text>
                        </Box>
                      )}

                      {/* Réponse existante */}
                      {review.seller_reply && (
                        <Box
                          bg="blue.50"
                          p={4}
                          borderRadius="lg"
                          borderLeftWidth={4}
                          borderLeftColor="blue.400"
                        >
                          <HStack mb={2}>
                            <Icon as={FiMessageCircle} color="blue.500" />
                            <Text fontSize="sm" fontWeight="semibold" color="blue.600">
                              Votre réponse
                            </Text>
                            {review.seller_reply_at && (
                              <Text fontSize="xs" color="gray.500">
                                • {formatDate(review.seller_reply_at)}
                              </Text>
                            )}
                          </HStack>
                          <Text>{review.seller_reply}</Text>
                        </Box>
                      )}

                      {/* Bouton répondre */}
                      <Button
                        leftIcon={<FiMessageCircle />}
                        colorScheme={review.seller_reply ? 'gray' : 'blue'}
                        variant={review.seller_reply ? 'outline' : 'solid'}
                        size="sm"
                        alignSelf="flex-start"
                        onClick={() => openReplyModal(review)}
                      >
                        {review.seller_reply ? 'Modifier la réponse' : 'Répondre'}
                      </Button>
                    </VStack>
                  </Box>
                </MotionBox>
              ))}
            </VStack>
          )}
        </Box>
      </VStack>

      {/* Modal de réponse */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(5px)" />
        <ModalContent borderRadius="xl" mx={4}>
          <ModalHeader>
            <HStack>
              <Icon as={FiMessageCircle} color="blue.500" />
              <Text>Répondre à l'avis</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <VStack align="stretch" spacing={4}>
              {/* Avis du client */}
              {selectedReview && (
                <Box bg={cardBg} p={4} borderRadius="lg">
                  <HStack mb={2}>
                    <Avatar name={selectedReview.user_name} size="sm" />
                    <Text fontWeight="semibold">{selectedReview.user_name}</Text>
                    <StarDisplay rating={selectedReview.rating} size={3} />
                  </HStack>
                  <Text fontSize="sm" color="gray.600">
                    {selectedReview.comment || 'Pas de commentaire'}
                  </Text>
                </Box>
              )}

              {/* Zone de réponse */}
              <Box>
                <Text fontWeight="semibold" mb={2}>Votre réponse</Text>
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Écrivez votre réponse au client..."
                  rows={4}
                  resize="none"
                />
                <Text fontSize="xs" color="gray.400" textAlign="right" mt={1}>
                  {replyText.length}/500 caractères
                </Text>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={onClose}>
              Annuler
            </Button>
            <Button
              colorScheme="blue"
              leftIcon={<FiSend />}
              onClick={handleReply}
              isLoading={replying}
              isDisabled={!replyText.trim()}
            >
              Envoyer la réponse
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default SellerReviewsPage;
