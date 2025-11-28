import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Avatar,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  Divider,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Alert,
  AlertIcon,
  IconButton,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import { EditIcon, ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

const ProfilePage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, token } = useSelector((state) => state.auth);
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // États du formulaire
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // États pour le changement de mot de passe
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProfile();
    fetchOrders();
  }, [token, navigate]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/profile');
      setProfile(response.data);
      setFullName(response.data.full_name || '');
      setPhone(response.data.phone || '');
      setAddress(response.data.address || '');
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger le profil',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await api.get('/orders/history');
      setOrders(response.data);
    } catch (error) {
      console.log('Pas d\'historique de commandes');
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setSaving(true);
      const response = await api.put('/profile', {
        full_name: fullName,
        phone,
        address,
      });
      setProfile(response.data);
      toast({
        title: 'Profil mis à jour',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.detail || 'Impossible de mettre à jour le profil',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Type de fichier non autorisé',
        description: 'Utilisez JPEG, PNG, GIF ou WebP.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setUploadingPhoto(true);
      const formData = new FormData();
      formData.append('photo', file);

      const response = await api.put('/profile/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setProfile({ ...profile, profile_photo: response.data.photo_url });
      toast({
        title: 'Photo mise à jour',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la photo',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Erreur',
        description: 'Les mots de passe ne correspondent pas',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Erreur',
        description: 'Le mot de passe doit contenir au moins 6 caractères',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setChangingPassword(true);
      await api.put('/profile/password', {
        current_password: currentPassword,
        new_password: newPassword,
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      toast({
        title: 'Mot de passe modifié',
        description: 'Votre mot de passe a été changé avec succès',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.detail || 'Impossible de changer le mot de passe',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'red',
      seller: 'green',
      customer: 'blue',
    };
    const labels = {
      admin: 'Administrateur',
      seller: 'Vendeur',
      customer: 'Client',
    };
    return <Badge colorScheme={colors[role] || 'gray'}>{labels[role] || role}</Badge>;
  };

  if (loading) {
    return (
      <Container maxW="container.lg" py={10}>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Chargement du profil...</Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.lg" py={6}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg">Mon Profil</Heading>

        <Box bg="white" p={6} rounded="lg" shadow="md">
          {/* En-tête du profil */}
          <HStack spacing={6} mb={6}>
            <Box position="relative">
              <Avatar
                size="2xl"
                name={profile?.full_name}
                src={profile?.profile_photo}
              />
              <Input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                display="none"
                onChange={handlePhotoChange}
              />
              <IconButton
                icon={<EditIcon />}
                size="sm"
                colorScheme="blue"
                rounded="full"
                position="absolute"
                bottom={0}
                right={0}
                onClick={() => fileInputRef.current?.click()}
                isLoading={uploadingPhoto}
                aria-label="Changer la photo"
              />
            </Box>
            <VStack align="start" spacing={1}>
              <Heading size="md">{profile?.full_name}</Heading>
              <Text color="gray.500">{profile?.email}</Text>
              {getRoleBadge(profile?.role)}
            </VStack>
          </HStack>

          <Divider mb={6} />

          <Tabs colorScheme="blue">
            <TabList>
              <Tab>Informations</Tab>
              <Tab>Sécurité</Tab>
              {profile?.role === 'customer' && <Tab>Historique d'achats</Tab>}
            </TabList>

            <TabPanels>
              {/* Onglet Informations */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel>Nom complet</FormLabel>
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Votre nom complet"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Email</FormLabel>
                    <Input value={profile?.email || ''} isReadOnly bg="gray.50" />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      L'email ne peut pas être modifié
                    </Text>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Téléphone</FormLabel>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Votre numéro de téléphone"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Adresse</FormLabel>
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Votre adresse"
                    />
                  </FormControl>

                  <Button
                    colorScheme="blue"
                    onClick={handleUpdateProfile}
                    isLoading={saving}
                    loadingText="Enregistrement..."
                    alignSelf="flex-start"
                  >
                    Enregistrer les modifications
                  </Button>
                </VStack>
              </TabPanel>

              {/* Onglet Sécurité */}
              <TabPanel>
                <VStack spacing={4} align="stretch" maxW="400px">
                  <Heading size="sm" mb={2}>Changer le mot de passe</Heading>

                  <FormControl>
                    <FormLabel>Mot de passe actuel</FormLabel>
                    <InputGroup>
                      <Input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Entrez votre mot de passe actuel"
                      />
                      <InputRightElement>
                        <IconButton
                          variant="ghost"
                          size="sm"
                          icon={showCurrentPassword ? <ViewOffIcon /> : <ViewIcon />}
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          aria-label="Afficher le mot de passe"
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Nouveau mot de passe</FormLabel>
                    <InputGroup>
                      <Input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Entrez le nouveau mot de passe"
                      />
                      <InputRightElement>
                        <IconButton
                          variant="ghost"
                          size="sm"
                          icon={showNewPassword ? <ViewOffIcon /> : <ViewIcon />}
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          aria-label="Afficher le mot de passe"
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Confirmer le nouveau mot de passe</FormLabel>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirmez le nouveau mot de passe"
                    />
                  </FormControl>

                  <Button
                    colorScheme="blue"
                    onClick={handleChangePassword}
                    isLoading={changingPassword}
                    loadingText="Modification..."
                    isDisabled={!currentPassword || !newPassword || !confirmPassword}
                  >
                    Changer le mot de passe
                  </Button>
                </VStack>
              </TabPanel>

              {/* Onglet Historique d'achats (clients uniquement) */}
              {profile?.role === 'customer' && (
                <TabPanel>
                  {loadingOrders ? (
                    <VStack py={6}>
                      <Spinner />
                      <Text>Chargement de l'historique...</Text>
                    </VStack>
                  ) : orders.length === 0 ? (
                    <Box textAlign="center" py={10}>
                      <Text fontSize="5xl" mb={4}>🛒</Text>
                      <Heading size="md" mb={2} color="gray.600">
                        Aucun achat effectué
                      </Heading>
                      <Text color="gray.500" mb={4}>
                        Vous n'avez pas encore passé de commande sur notre plateforme.
                      </Text>
                      <Button
                        colorScheme="blue"
                        onClick={() => navigate('/products')}
                      >
                        Découvrir nos produits
                      </Button>
                    </Box>
                  ) : (
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Date</Th>
                          <Th>Commande</Th>
                          <Th>Statut</Th>
                          <Th isNumeric>Total</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {orders.map((order) => (
                          <Tr key={order.id}>
                            <Td>{new Date(order.created_at).toLocaleDateString('fr-FR')}</Td>
                            <Td>#{order.id.slice(-8)}</Td>
                            <Td>
                              <Badge
                                colorScheme={
                                  order.status === 'completed' ? 'green' :
                                  order.status === 'pending' ? 'yellow' :
                                  order.status === 'cancelled' ? 'red' : 'gray'
                                }
                              >
                                {order.status}
                              </Badge>
                            </Td>
                            <Td isNumeric>{order.total?.toFixed(2)} €</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  )}
                </TabPanel>
              )}
            </TabPanels>
          </Tabs>
        </Box>
      </VStack>
    </Container>
  );
};

export default ProfilePage;
