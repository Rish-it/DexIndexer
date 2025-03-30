import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Paper,
  TextInput,
  PasswordInput,
  NumberInput,
  Switch,
  Divider,
  Stack,
  Alert,
  LoadingOverlay,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconDatabase, IconDeviceFloppy, IconArrowLeft, IconAlertCircle } from '@tabler/icons-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { DashboardShell } from '../components/layout/DashboardShell';

interface DatabaseConfigFormValues {
  name: string;
  host: string;
  port: number;
  username: string;
  password: string;
  databaseName: string;
  schema: string;
  ssl: boolean;
}

export default function DatabaseConfigCreate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const { token } = useAuth();
  const navigate = useNavigate();

  const form = useForm<DatabaseConfigFormValues>({
    initialValues: {
      name: '',
      host: '',
      port: 5432,
      username: '',
      password: '',
      databaseName: '',
      schema: 'public',
      ssl: false,
    },
    validate: {
      name: (value) => (value.trim().length > 0 ? null : 'Name is required'),
      host: (value) => (value.trim().length > 0 ? null : 'Host is required'),
      port: (value) => (value && value > 0 ? null : 'Valid port number is required'),
      username: (value) => (value.trim().length > 0 ? null : 'Username is required'),
      databaseName: (value) => (value.trim().length > 0 ? null : 'Database name is required'),
      schema: (value) => (value.trim().length > 0 ? null : 'Schema is required'),
    },
  });

  const handleSubmit = async (values: DatabaseConfigFormValues) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('/api/database-configs', values, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      navigate('/database-configs');
    } catch (err: any) {
      console.error('Error creating database config:', err);
      setError(err.response?.data?.message || 'Failed to create database configuration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    if (!form.isValid()) {
      form.validate();
      return;
    }

    try {
      setTestLoading(true);
      setTestResult(null);
      
      const response = await axios.post('/api/database-configs/test', form.values, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setTestResult({
        success: true,
        message: 'Connection successful! Database is accessible.'
      });
    } catch (err: any) {
      console.error('Error testing connection:', err);
      setTestResult({
        success: false,
        message: err.response?.data?.message || 'Connection failed. Please check your credentials and try again.'
      });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <DashboardShell>
      <Container size="md" py={40}>
        <Group mb={30}>
          <Button 
            variant="subtle" 
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate('/database-configs')}
          >
            Back to Database Configurations
          </Button>
        </Group>
        
        <Paper withBorder p="xl" radius="md">
          <LoadingOverlay visible={loading} loaderProps={{ size: 'md' }} />
          
          <Title order={2} mb={5}>Add Database Configuration</Title>
          <Text c="dimmed" size="sm" mb={30}>
            Connect your PostgreSQL database for blockchain data indexing
          </Text>
          
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
          
          {testResult && (
            <Alert 
              icon={testResult.success ? <IconDatabase size={16} /> : <IconAlertCircle size={16} />} 
              title={testResult.success ? "Connection Successful" : "Connection Failed"} 
              color={testResult.success ? "green" : "red"} 
              mb="xl"
              onClose={() => setTestResult(null)}
              withCloseButton
            >
              {testResult.message}
            </Alert>
          )}
          
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label="Configuration Name"
                placeholder="e.g., Production Database"
                withAsterisk
                {...form.getInputProps('name')}
              />
              
              <Divider label="Connection Details" labelPosition="center" />
              
              <Group grow>
                <TextInput
                  label="Host"
                  placeholder="e.g., localhost or db.example.com"
                  withAsterisk
                  {...form.getInputProps('host')}
                />
                <NumberInput
                  label="Port"
                  placeholder="5432"
                  min={1}
                  max={65535}
                  defaultValue={5432}
                  withAsterisk
                  {...form.getInputProps('port')}
                />
              </Group>
              
              <Group grow>
                <TextInput
                  label="Database Name"
                  placeholder="e.g., blockchain_data"
                  withAsterisk
                  {...form.getInputProps('databaseName')}
                />
                <TextInput
                  label="Schema"
                  placeholder="e.g., public"
                  defaultValue="public"
                  withAsterisk
                  {...form.getInputProps('schema')}
                />
              </Group>
              
              <Group grow>
                <TextInput
                  label="Username"
                  placeholder="Database username"
                  withAsterisk
                  {...form.getInputProps('username')}
                />
                <PasswordInput
                  label="Password"
                  placeholder="Database password"
                  {...form.getInputProps('password')}
                />
              </Group>
              
              <Switch
                label="Enable SSL"
                description="Use secure connection for your database"
                checked={form.values.ssl}
                onChange={(event) => form.setFieldValue('ssl', event.currentTarget.checked)}
                mt="md"
              />
              
              <Group justify="space-between" mt="xl">
                <Button 
                  variant="outline" 
                  onClick={testConnection}
                  loading={testLoading}
                >
                  Test Connection
                </Button>
                <Button 
                  type="submit" 
                  leftSection={<IconDeviceFloppy size={16} />}
                >
                  Save Configuration
                </Button>
              </Group>
            </Stack>
          </form>
        </Paper>
      </Container>
    </DashboardShell>
  );
} 