import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Paper,
  TextInput,
  Avatar,
  Divider,
  Stack,
  PasswordInput,
  Alert,
  LoadingOverlay,
  Box,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconUser, IconKey, IconCheck, IconAlertCircle } from '@tabler/icons-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { DashboardShell } from '../components/layout/DashboardShell';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  organization?: string;
  role: string;
  createdAt: string;
}

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const { token, user } = useAuth();

  // Profile form
  const profileForm = useForm({
    initialValues: {
      name: '',
      email: '',
      organization: '',
    },
    validate: {
      name: (value) => (value.trim().length > 0 ? null : 'Name is required'),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validate: {
      currentPassword: (value) => (value.length > 0 ? null : 'Current password is required'),
      newPassword: (value) => (value.length < 8 ? 'Password must be at least 8 characters' : null),
      confirmPassword: (value, values) => (value !== values.newPassword ? 'Passwords do not match' : null),
    },
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/user/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // If we get a response, use it
      if (response.data) {
        setProfile(response.data);
        profileForm.setValues({
          name: response.data.name || '',
          email: response.data.email || '',
          organization: response.data.organization || '',
        });
      } else {
        // If API doesn't return real data, use mock data for development
        const mockProfile = {
          id: '1',
          email: user?.email || 'user@example.com',
          name: 'John Doe',
          organization: 'Blockchain Inc.',
          role: 'Admin',
          createdAt: '2023-01-15T10:30:00Z',
        };
        
        setProfile(mockProfile);
        profileForm.setValues({
          name: mockProfile.name,
          email: mockProfile.email,
          organization: mockProfile.organization || '',
        });
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.response?.data?.message || 'Failed to load profile');
      
      // Use mock data for development
      const mockProfile = {
        id: '1',
        email: user?.email || 'user@example.com',
        name: 'John Doe',
        organization: 'Blockchain Inc.',
        role: 'Admin',
        createdAt: '2023-01-15T10:30:00Z',
      };
      
      setProfile(mockProfile);
      profileForm.setValues({
        name: mockProfile.name,
        email: mockProfile.email,
        organization: mockProfile.organization || '',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (values: typeof profileForm.values) => {
    try {
      setProfileLoading(true);
      setError(null);
      setSuccess(null);
      
      await axios.put('/api/user/profile', values, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update local state
      if (profile) {
        setProfile({
          ...profile,
          name: values.name,
          email: values.email,
          organization: values.organization,
        });
      }
      
      setSuccess('Profile updated successfully');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const updatePassword = async (values: PasswordFormValues) => {
    try {
      setPasswordLoading(true);
      setError(null);
      setSuccess(null);
      
      await axios.put('/api/user/password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setSuccess('Password updated successfully');
      passwordForm.reset();
    } catch (err: any) {
      console.error('Error updating password:', err);
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
    });
  };

  return (
    <DashboardShell>
      <Container size="md" py={40}>
        <Title order={2} mb={30}>Account Settings</Title>
        
        {error && (
          <Alert 
            icon={<IconAlertCircle size={16} />} 
            title="Error" 
            color="red" 
            mb="xl"
            onClose={() => setError(null)}
            withCloseButton
          >
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert 
            icon={<IconCheck size={16} />} 
            title="Success" 
            color="green" 
            mb="xl"
            onClose={() => setSuccess(null)}
            withCloseButton
          >
            {success}
          </Alert>
        )}
        
        <Paper withBorder p="xl" radius="md" mb="xl">
          <LoadingOverlay visible={loading} loaderProps={{ size: 'md' }} />
          
          <Group align="flex-start" mb={30}>
            <Avatar 
              size={80} 
              radius="xl" 
              color="violet"
              src={profile?.avatar}
            >
              {profile?.name?.charAt(0) || 'U'}
            </Avatar>
            
            <div>
              <Title order={3}>{profile?.name || 'User'}</Title>
              <Text c="dimmed">{profile?.email}</Text>
              <Group gap={5} mt={5}>
                <Text size="sm" fw={500}>Role:</Text>
                <Text size="sm">{profile?.role || 'User'}</Text>
              </Group>
              <Group gap={5} mt={5}>
                <Text size="sm" fw={500}>Member since:</Text>
                <Text size="sm">{profile?.createdAt ? formatDate(profile.createdAt) : 'Unknown'}</Text>
              </Group>
            </div>
          </Group>
          
          <Divider my="md" label="Profile Information" labelPosition="center" />
          
          <form onSubmit={profileForm.onSubmit(updateProfile)}>
            <Stack gap="md">
              <TextInput
                label="Full Name"
                placeholder="Your name"
                required
                leftSection={<IconUser size={16} />}
                {...profileForm.getInputProps('name')}
              />
              
              <TextInput
                label="Email"
                placeholder="your.email@example.com"
                required
                leftSection={<IconUser size={16} />}
                {...profileForm.getInputProps('email')}
              />
              
              <TextInput
                label="Organization (Optional)"
                placeholder="Your company or organization"
                {...profileForm.getInputProps('organization')}
              />
              
              <Group justify="flex-end" mt="md">
                <Button type="submit" loading={profileLoading}>
                  Save Changes
                </Button>
              </Group>
            </Stack>
          </form>
        </Paper>
        
        <Paper withBorder p="xl" radius="md">
          <Box mb={20}>
            <Title order={4}>Change Password</Title>
            <Text size="sm" c="dimmed">
              Use a strong password that you don't use elsewhere
            </Text>
          </Box>
          
          <Divider my="md" />
          
          <form onSubmit={passwordForm.onSubmit(updatePassword)}>
            <Stack gap="md">
              <PasswordInput
                label="Current Password"
                placeholder="Your current password"
                required
                leftSection={<IconKey size={16} />}
                {...passwordForm.getInputProps('currentPassword')}
              />
              
              <PasswordInput
                label="New Password"
                placeholder="New password"
                description="Use at least 8 characters with letters and numbers"
                required
                leftSection={<IconKey size={16} />}
                {...passwordForm.getInputProps('newPassword')}
              />
              
              <PasswordInput
                label="Confirm New Password"
                placeholder="Confirm your new password"
                required
                leftSection={<IconKey size={16} />}
                {...passwordForm.getInputProps('confirmPassword')}
              />
              
              <Group justify="flex-end" mt="md">
                <Button type="submit" loading={passwordLoading}>
                  Update Password
                </Button>
              </Group>
            </Stack>
          </form>
        </Paper>
      </Container>
    </DashboardShell>
  );
} 