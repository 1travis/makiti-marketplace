import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import {
  Box,
  IconButton,
  Badge,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  VStack,
  HStack,
  Text,
  Button,
  Divider,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { BellIcon, CheckIcon, DeleteIcon } from '@chakra-ui/icons';

const NotificationBell = () => {
  const toast = useToast();
  const { token } = useSelector((state) => state.auth);
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (token) {
      fetchUnreadCount();
      // Rafraîchir toutes les 30 secondes
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      setUnreadCount(response.data.count);
    } catch (error) {
      console.log('Erreur notifications:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.log('Erreur chargement notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    fetchNotifications();
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.log('Erreur:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast({
        title: 'Toutes les notifications marquées comme lues',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.log('Erreur:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      const notif = notifications.find(n => n.id === notificationId);
      setNotifications(notifications.filter(n => n.id !== notificationId));
      if (notif && !notif.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.log('Erreur:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_order': return '🛒';
      case 'seller_approved': return '🎉';
      case 'seller_rejected': return '❌';
      case 'low_stock': return '⚠️';
      case 'order_status': return '📦';
      default: return '🔔';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'À l\'instant';
    if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)} h`;
    return date.toLocaleDateString('fr-FR');
  };

  if (!token) return null;

  return (
    <Popover
      isOpen={isOpen}
      onOpen={handleOpen}
      onClose={handleClose}
      placement="bottom-end"
    >
      <PopoverTrigger>
        <Box position="relative" display="inline-block">
          <IconButton
            icon={<BellIcon />}
            variant="ghost"
            color="white"
            _hover={{ bg: 'blue.500' }}
            aria-label="Notifications"
          />
          {unreadCount > 0 && (
            <Badge
              colorScheme="red"
              borderRadius="full"
              position="absolute"
              top="-1"
              right="-1"
              fontSize="xs"
              minW="18px"
              textAlign="center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Box>
      </PopoverTrigger>
      
      <PopoverContent w="350px" maxH="400px">
        <PopoverHeader fontWeight="bold" borderBottomWidth="1px">
          <HStack justify="space-between">
            <Text>Notifications</Text>
            {unreadCount > 0 && (
              <Button size="xs" variant="ghost" onClick={markAllAsRead}>
                Tout marquer lu
              </Button>
            )}
          </HStack>
        </PopoverHeader>
        
        <PopoverBody p={0} overflowY="auto" maxH="300px">
          {loading ? (
            <VStack py={6}>
              <Spinner />
            </VStack>
          ) : notifications.length === 0 ? (
            <VStack py={6} color="gray.500">
              <BellIcon boxSize={8} />
              <Text>Aucune notification</Text>
            </VStack>
          ) : (
            <VStack spacing={0} align="stretch">
              {notifications.map((notif) => (
                <Box
                  key={notif.id}
                  p={3}
                  bg={notif.read ? 'white' : 'blue.50'}
                  borderBottomWidth="1px"
                  _hover={{ bg: 'gray.50' }}
                  cursor="pointer"
                  onClick={() => !notif.read && markAsRead(notif.id)}
                >
                  <HStack align="start" spacing={3}>
                    <Text fontSize="xl">{getNotificationIcon(notif.type)}</Text>
                    <Box flex={1}>
                      <Text fontWeight={notif.read ? 'normal' : 'bold'} fontSize="sm">
                        {notif.title}
                      </Text>
                      <Text fontSize="xs" color="gray.600" noOfLines={2}>
                        {notif.message}
                      </Text>
                      <Text fontSize="xs" color="gray.400" mt={1}>
                        {formatDate(notif.created_at)}
                      </Text>
                    </Box>
                    <IconButton
                      icon={<DeleteIcon />}
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif.id);
                      }}
                      aria-label="Supprimer"
                    />
                  </HStack>
                </Box>
              ))}
            </VStack>
          )}
        </PopoverBody>
        
        {notifications.length > 0 && (
          <PopoverFooter borderTopWidth="1px" textAlign="center">
            <Text fontSize="xs" color="gray.500">
              {notifications.length} notification(s)
            </Text>
          </PopoverFooter>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
