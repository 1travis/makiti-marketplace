import { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Icon,
  Progress,
  Divider,
  useColorModeValue,
  Flex,
  Badge,
  Skeleton,
  SkeletonCircle,
} from '@chakra-ui/react';
import { FiStar, FiMessageCircle } from 'react-icons/fi';
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

const ReviewCard = ({ review }) => {
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const replyBg = useColorModeValue('blue.50', 'blue.900');

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box bg={bgColor} p={4} borderRadius="xl">
        <VStack align="stretch" spacing={3}>
          {/* En-tête de l'avis */}
          <Flex justify="space-between" align="start">
            <HStack spacing={3}>
              <Avatar name={review.user_name} size="sm" />
              <VStack align="start" spacing={0}>
                <Text fontWeight="semibold" fontSize="sm">
                  {review.user_name}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {formatDate(review.created_at)}
                </Text>
              </VStack>
            </HStack>
            <StarDisplay rating={review.rating} size={4} />
          </Flex>

          {/* Commentaire */}
          {review.comment && (
            <Text fontSize="sm" color="gray.600">
              {review.comment}
            </Text>
          )}

          {/* Réponse du vendeur */}
          {review.seller_reply && (
            <Box bg={replyBg} p={3} borderRadius="lg" ml={4} borderLeftWidth={3} borderLeftColor="blue.400">
              <HStack spacing={2} mb={1}>
                <Icon as={FiMessageCircle} color="blue.500" />
                <Text fontSize="xs" fontWeight="semibold" color="blue.600">
                  Réponse du vendeur
                </Text>
                {review.seller_reply_at && (
                  <Text fontSize="xs" color="gray.500">
                    • {formatDate(review.seller_reply_at)}
                  </Text>
                )}
              </HStack>
              <Text fontSize="sm" color="gray.700">
                {review.seller_reply}
              </Text>
            </Box>
          )}
        </VStack>
      </Box>
    </MotionBox>
  );
};

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const bgColor = useColorModeValue('white', 'gray.800');
  const statsBgColor = useColorModeValue('gray.50', 'gray.700');
  const sellerBgColor = useColorModeValue('blue.50', 'blue.900');

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/reviews/product/${productId}`);
      setReviews(response.data.reviews || []);
      setStats(response.data.stats);
      setSeller(response.data.seller);
    } catch (error) {
      console.error('Erreur chargement avis:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box bg={bgColor} p={6} borderRadius="xl" shadow="md">
        <VStack align="stretch" spacing={4}>
          <Skeleton height="30px" width="200px" />
          <HStack spacing={4}>
            <SkeletonCircle size="60px" />
            <VStack align="start" flex={1}>
              <Skeleton height="20px" width="100%" />
              <Skeleton height="20px" width="80%" />
            </VStack>
          </HStack>
          <Skeleton height="100px" />
          <Skeleton height="100px" />
        </VStack>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} p={6} borderRadius="xl" shadow="md">
      <VStack align="stretch" spacing={6}>
        {/* Titre */}
        <HStack>
          <Icon as={FiStar} color="yellow.400" boxSize={6} />
          <Text fontSize="xl" fontWeight="bold">
            Avis clients
          </Text>
          {stats && (
            <Badge colorScheme="blue" fontSize="sm">
              {stats.total} avis
            </Badge>
          )}
        </HStack>

        {/* Statistiques */}
        {stats && stats.total > 0 && (
          <Flex
            direction={{ base: 'column', md: 'row' }}
            gap={6}
            p={4}
            bg={statsBgColor}
            borderRadius="xl"
          >
            {/* Note moyenne */}
            <VStack spacing={1}>
              <Text fontSize="4xl" fontWeight="bold" color="blue.600">
                {stats.average}
              </Text>
              <StarDisplay rating={Math.round(stats.average)} size={5} />
              <Text fontSize="sm" color="gray.500">
                sur 5
              </Text>
            </VStack>

            <Divider orientation="vertical" display={{ base: 'none', md: 'block' }} />

            {/* Distribution des notes */}
            <VStack flex={1} align="stretch" spacing={1}>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.distribution?.[star] || 0;
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <HStack key={star} spacing={2}>
                    <HStack spacing={1} minW="50px">
                      <Text fontSize="sm">{star}</Text>
                      <Icon as={FiStar} boxSize={3} color="yellow.400" fill="yellow.400" />
                    </HStack>
                    <Progress
                      value={percentage}
                      size="sm"
                      colorScheme="yellow"
                      flex={1}
                      borderRadius="full"
                    />
                    <Text fontSize="xs" color="gray.500" minW="30px">
                      {count}
                    </Text>
                  </HStack>
                );
              })}
            </VStack>
          </Flex>
        )}

        {/* Info vendeur */}
        {seller && (
          <HStack
            p={3}
            bg={sellerBgColor}
            borderRadius="lg"
            spacing={3}
          >
            <Avatar name={seller.shop_name} size="sm" />
            <VStack align="start" spacing={0} flex={1}>
              <Text fontWeight="semibold" fontSize="sm">
                {seller.shop_name}
              </Text>
              <Text fontSize="xs" color="gray.500">
                Vendeur • {seller.total_reviews} avis
              </Text>
            </VStack>
            {seller.average_rating > 0 && (
              <HStack>
                <Icon as={FiStar} color="yellow.400" fill="yellow.400" />
                <Text fontWeight="bold">{seller.average_rating}</Text>
              </HStack>
            )}
          </HStack>
        )}

        <Divider />

        {/* Liste des avis */}
        {reviews.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Icon as={FiStar} boxSize={12} color="gray.300" mb={4} />
            <Text color="gray.500" fontSize="lg">
              Aucun avis pour le moment
            </Text>
            <Text color="gray.400" fontSize="sm">
              Soyez le premier à donner votre avis !
            </Text>
          </Box>
        ) : (
          <VStack align="stretch" spacing={4}>
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </VStack>
        )}
      </VStack>
    </Box>
  );
};

export default ProductReviews;
