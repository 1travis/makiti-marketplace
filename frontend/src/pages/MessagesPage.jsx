import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Avatar,
  Badge,
  Flex,
  IconButton,
  useColorModeValue,
  Spinner,
  Divider,
  Image,
  useToast,
  InputGroup,
  InputRightElement,
  Icon,
} from '@chakra-ui/react';
import { FiSend, FiMessageSquare, FiArrowLeft, FiTrash2 } from 'react-icons/fi';
import { motion } from 'framer-motion';
import api from '../api/axios';

const MotionBox = motion(Box);

const MessagesPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const { user } = useSelector((state) => state.auth);
  
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const myMessageBg = useColorModeValue('blue.500', 'blue.600');
  const otherMessageBg = useColorModeValue('gray.100', 'gray.700');
  const productBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    fetchConversations();
    
    // Vérifier si on doit ouvrir une conversation spécifique
    const sellerId = searchParams.get('seller');
    const productId = searchParams.get('product');
    if (sellerId) {
      startNewConversation(sellerId, productId);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Polling pour les nouveaux messages
  useEffect(() => {
    if (selectedConversation) {
      const interval = setInterval(() => {
        fetchMessages(selectedConversation.id, true);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/conversations');
      setConversations(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const startNewConversation = async (sellerId, productId = null) => {
    try {
      const url = productId 
        ? `/conversations/start/${sellerId}?product_id=${productId}`
        : `/conversations/start/${sellerId}`;
      const response = await api.post(url);
      
      // Rafraîchir la liste et sélectionner la conversation
      await fetchConversations();
      const conv = conversations.find(c => c.id === response.data.id);
      if (conv) {
        selectConversation(conv);
      } else {
        // Si la conversation n'est pas encore dans la liste, la créer temporairement
        selectConversation({
          id: response.data.id,
          other_user_name: 'Vendeur',
          shop_name: 'Boutique'
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de démarrer la conversation',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const selectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    await fetchMessages(conversation.id);
    inputRef.current?.focus();
  };

  const fetchMessages = async (conversationId, silent = false) => {
    try {
      if (!silent) setLoadingMessages(true);
      const response = await api.get(`/conversations/${conversationId}/messages`);
      setMessages(response.data);
      
      // Mettre à jour le compteur de non lus
      if (!silent) {
        setConversations(prev => prev.map(c => 
          c.id === conversationId ? { ...c, unread_count: 0 } : c
        ));
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);
      const response = await api.post(`/conversations/${selectedConversation.id}/messages`, {
        content: newMessage
      });
      
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      
      // Mettre à jour la conversation dans la liste
      setConversations(prev => prev.map(c => 
        c.id === selectedConversation.id 
          ? { ...c, last_message: { content: newMessage, created_at: new Date() } }
          : c
      ));
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer le message',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const deleteConversation = async (conversationId) => {
    if (!window.confirm('Supprimer cette conversation ?')) return;
    
    try {
      await api.delete(`/conversations/${conversationId}`);
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
      }
      toast({
        title: 'Conversation supprimée',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    
    if (diff < 60000) return 'À l\'instant';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={10}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Chargement des messages...</Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={6}>
      <Box
        bg={bgColor}
        borderRadius="2xl"
        shadow="xl"
        overflow="hidden"
        h="calc(100vh - 150px)"
        display="flex"
      >
        {/* Liste des conversations */}
        <Box
          w={{ base: selectedConversation ? '0' : '100%', md: '350px' }}
          display={{ base: selectedConversation ? 'none' : 'block', md: 'block' }}
          borderRight="1px"
          borderColor={borderColor}
          overflow="hidden"
        >
          <Box p={4} borderBottom="1px" borderColor={borderColor}>
            <Heading size="md">
              <HStack>
                <Icon as={FiMessageSquare} />
                <Text>Messages</Text>
              </HStack>
            </Heading>
          </Box>

          <Box overflowY="auto" h="calc(100% - 65px)">
            {conversations.length === 0 ? (
              <VStack py={10} spacing={4}>
                <Icon as={FiMessageSquare} boxSize={12} color="gray.300" />
                <Text color="gray.500" textAlign="center" px={4}>
                  Aucune conversation.<br />
                  Contactez un vendeur depuis une page produit.
                </Text>
              </VStack>
            ) : (
              conversations.map((conv) => (
                <Box
                  key={conv.id}
                  p={4}
                  cursor="pointer"
                  bg={selectedConversation?.id === conv.id ? hoverBg : 'transparent'}
                  _hover={{ bg: hoverBg }}
                  onClick={() => selectConversation(conv)}
                  borderBottom="1px"
                  borderColor={borderColor}
                >
                  <Flex justify="space-between" align="start">
                    <HStack spacing={3} flex={1}>
                      <Avatar name={conv.other_user_name} size="md" />
                      <VStack align="start" spacing={0} flex={1}>
                        <HStack>
                          <Text fontWeight="bold" fontSize="sm">{conv.other_user_name}</Text>
                          {conv.unread_count > 0 && (
                            <Badge colorScheme="red" borderRadius="full">
                              {conv.unread_count}
                            </Badge>
                          )}
                        </HStack>
                        <Text fontSize="xs" color="gray.500">{conv.shop_name}</Text>
                        {conv.last_message && (
                          <Text fontSize="sm" color="gray.500" noOfLines={1}>
                            {conv.last_message.content}
                          </Text>
                        )}
                      </VStack>
                    </HStack>
                    <VStack align="end" spacing={1}>
                      <Text fontSize="xs" color="gray.400">
                        {conv.updated_at && formatTime(conv.updated_at)}
                      </Text>
                      <IconButton
                        icon={<FiTrash2 />}
                        size="xs"
                        variant="ghost"
                        colorScheme="red"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conv.id);
                        }}
                      />
                    </VStack>
                  </Flex>
                  {conv.product && (
                    <HStack mt={2} p={2} bg={productBg} borderRadius="md">
                      <Image
                        src={conv.product.image}
                        alt={conv.product.name}
                        boxSize="40px"
                        objectFit="cover"
                        borderRadius="md"
                      />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="xs" fontWeight="medium" noOfLines={1}>{conv.product.name}</Text>
                        <Text fontSize="xs" color="blue.500">{conv.product.price} €</Text>
                      </VStack>
                    </HStack>
                  )}
                </Box>
              ))
            )}
          </Box>
        </Box>

        {/* Zone de chat */}
        <Box flex={1} display="flex" flexDirection="column">
          {selectedConversation ? (
            <>
              {/* En-tête */}
              <Box p={4} borderBottom="1px" borderColor={borderColor}>
                <HStack>
                  <IconButton
                    icon={<FiArrowLeft />}
                    display={{ base: 'flex', md: 'none' }}
                    variant="ghost"
                    onClick={() => setSelectedConversation(null)}
                  />
                  <Avatar name={selectedConversation.other_user_name} size="sm" />
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="bold">{selectedConversation.other_user_name}</Text>
                    <Text fontSize="xs" color="gray.500">{selectedConversation.shop_name}</Text>
                  </VStack>
                </HStack>
              </Box>

              {/* Messages */}
              <Box flex={1} overflowY="auto" p={4}>
                {loadingMessages ? (
                  <Flex justify="center" py={10}>
                    <Spinner />
                  </Flex>
                ) : messages.length === 0 ? (
                  <VStack py={10} spacing={4}>
                    <Icon as={FiMessageSquare} boxSize={10} color="gray.300" />
                    <Text color="gray.500">Commencez la conversation !</Text>
                  </VStack>
                ) : (
                  <VStack spacing={3} align="stretch">
                    {messages.map((msg, index) => (
                      <MotionBox
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        alignSelf={msg.is_mine ? 'flex-end' : 'flex-start'}
                        maxW="70%"
                      >
                        <Box
                          bg={msg.is_mine ? myMessageBg : otherMessageBg}
                          color={msg.is_mine ? 'white' : 'inherit'}
                          px={4}
                          py={2}
                          borderRadius="2xl"
                          borderBottomRightRadius={msg.is_mine ? 'sm' : '2xl'}
                          borderBottomLeftRadius={msg.is_mine ? '2xl' : 'sm'}
                        >
                          <Text>{msg.content}</Text>
                          <Text 
                            fontSize="xs" 
                            opacity={0.7} 
                            textAlign="right"
                            mt={1}
                          >
                            {formatTime(msg.created_at)}
                          </Text>
                        </Box>
                      </MotionBox>
                    ))}
                    <div ref={messagesEndRef} />
                  </VStack>
                )}
              </Box>

              {/* Zone de saisie */}
              <Box p={4} borderTop="1px" borderColor={borderColor}>
                <InputGroup>
                  <Input
                    ref={inputRef}
                    placeholder="Écrivez votre message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    borderRadius="full"
                    pr="50px"
                  />
                  <InputRightElement w="50px">
                    <IconButton
                      icon={<FiSend />}
                      colorScheme="blue"
                      borderRadius="full"
                      size="sm"
                      onClick={sendMessage}
                      isLoading={sending}
                      isDisabled={!newMessage.trim()}
                    />
                  </InputRightElement>
                </InputGroup>
              </Box>
            </>
          ) : (
            <Flex flex={1} align="center" justify="center" display={{ base: 'none', md: 'flex' }}>
              <VStack spacing={4}>
                <Icon as={FiMessageSquare} boxSize={16} color="gray.300" />
                <Text color="gray.500" fontSize="lg">
                  Sélectionnez une conversation
                </Text>
              </VStack>
            </Flex>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default MessagesPage;
