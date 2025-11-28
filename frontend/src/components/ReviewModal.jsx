import { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Textarea,
  useToast,
  Box,
  Icon,
  Avatar,
} from '@chakra-ui/react';
import { FiStar } from 'react-icons/fi';
import api from '../api/axios';

const StarRating = ({ rating, setRating, size = 8 }) => {
  const [hover, setHover] = useState(0);

  return (
    <HStack spacing={1}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Box
          key={star}
          cursor="pointer"
          onClick={() => setRating(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
        >
          <Icon
            as={FiStar}
            boxSize={size}
            fill={(hover || rating) >= star ? 'yellow.400' : 'none'}
            color={(hover || rating) >= star ? 'yellow.400' : 'gray.300'}
            transition="all 0.2s"
            _hover={{ transform: 'scale(1.2)' }}
          />
        </Box>
      ))}
    </HStack>
  );
};

const ReviewModal = ({ isOpen, onClose, orderId, seller, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: 'Note requise',
        description: 'Veuillez sélectionner une note de 1 à 5 étoiles',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      await api.post('/reviews', {
        order_id: orderId,
        seller_id: seller.seller_id,
        rating,
        comment: comment.trim() || null,
      });

      toast({
        title: 'Merci pour votre avis !',
        description: 'Votre évaluation a été enregistrée',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Réinitialiser et fermer
      setRating(0);
      setComment('');
      onClose();
      
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.detail || 'Impossible d\'enregistrer l\'avis',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const getRatingText = (rating) => {
    switch (rating) {
      case 1: return 'Très insatisfait';
      case 2: return 'Insatisfait';
      case 3: return 'Correct';
      case 4: return 'Satisfait';
      case 5: return 'Très satisfait';
      default: return 'Sélectionnez une note';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(5px)" />
      <ModalContent borderRadius="xl" mx={4}>
        <ModalHeader borderBottomWidth="1px">
          <HStack>
            <Text>⭐</Text>
            <Text>Évaluer le vendeur</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody py={6}>
          <VStack spacing={6} align="stretch">
            {/* Info vendeur */}
            <HStack spacing={4} p={4} bg="gray.50" borderRadius="lg">
              <Avatar name={seller?.shop_name || seller?.seller_name} size="md" />
              <VStack align="start" spacing={0}>
                <Text fontWeight="bold">{seller?.shop_name || 'Boutique'}</Text>
                <Text fontSize="sm" color="gray.500">{seller?.seller_name}</Text>
              </VStack>
            </HStack>

            {/* Étoiles */}
            <VStack spacing={3}>
              <Text fontWeight="semibold">Comment évaluez-vous ce vendeur ?</Text>
              <StarRating rating={rating} setRating={setRating} />
              <Text 
                fontSize="sm" 
                color={rating > 0 ? 'blue.500' : 'gray.400'}
                fontWeight={rating > 0 ? 'medium' : 'normal'}
              >
                {getRatingText(rating)}
              </Text>
            </VStack>

            {/* Commentaire */}
            <VStack align="stretch" spacing={2}>
              <Text fontWeight="semibold">Votre commentaire (optionnel)</Text>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Partagez votre expérience avec ce vendeur..."
                rows={4}
                resize="none"
                borderRadius="lg"
              />
              <Text fontSize="xs" color="gray.400" textAlign="right">
                {comment.length}/500 caractères
              </Text>
            </VStack>
          </VStack>
        </ModalBody>

        <ModalFooter borderTopWidth="1px" gap={3}>
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={loading}
            isDisabled={rating === 0}
          >
            Envoyer mon avis
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ReviewModal;
