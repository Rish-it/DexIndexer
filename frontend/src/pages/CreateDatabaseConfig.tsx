import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  TextInput,
  PasswordInput,
  NumberInput,
  Switch,
  Button,
  Group,
  Paper,
  Alert,
  Divider,
  Grid,
  Stepper,
  Card,
  Box,
  List,
  ThemeIcon,
  Center,
  Code
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { 
  IconAlertCircle, 
  IconCheck, 
  IconCircleCheck, 
  IconDatabase, 
  IconServer,
  IconKey,
  IconArrowRight,
  IconUser
} from '@tabler/icons-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { DashboardShell } from '../components/layout/DashboardShell';

// Configure Axios with explicit backend URL
const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Important for CORS with credentials
});

export default function CreateDatabaseConfig() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const { token } = useAuth();
  const navigate = useNavigate();

  const form = useForm({
    initialValues: {
      name: '',
      host: '',
      port: 5432,
      username: '',
      password: '',
      databaseName: '',
      ssl: false,
      schema: 'public',
    },
    validate: {
      name: (value) => (value ? null : 'Name is required'),
      host: (value) => (value ? null : 'Host is required'),
      port: (value) => (value < 1 || value > 65535 ? 'Port must be between 1 and 65535' : null),
      username: (value) => (value ? null : 'Username is required'),
      databaseName: (value) => (value ? null : 'Database name is required'),
    },
  });

  const testConnection = async () => {
    try {
      setTestingConnection(true);
      setTestResult(null);
      
      const response = await api.post('/api/database-configs/test', form.values, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setTestResult({
        success: true,
        message: 'Connection successful! Database is accessible.'
      });
      
      // Move to next step if successful
      setActiveStep(1);
    } catch (err: any) {
      console.error('Test connection error:', err);
      setTestResult({
        success: false,
        message: err.response?.data?.message || 'Connection failed. Please check your credentials.'
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/api/database-configs', values, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setSuccess('Database configuration created successfully.');
      setActiveStep(2);
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/database-configs');
      }, 2000);
    } catch (err: any) {
      console.error('Create database config error:', err);
      setError(err.response?.data?.message || 'Failed to create database configuration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell>
      <Container size="md" py={40}>
        <Title order={2} mb={10}>Connect Your Database</Title>
        <Text c="dimmed" size="sm" mb={30}>
          Connect your PostgreSQL database to start indexing blockchain data
        </Text>
        
        <Paper withBorder p="md" radius="md" mb="xl">
          <Stepper active={activeStep} orientation="horizontal" mb="xl">
            <Stepper.Step 
              label="Connection Details" 
              description="Enter database credentials" 
              icon={<IconDatabase size={18} />}
            />
            <Stepper.Step 
              label="Test Connection" 
              description="Verify database access" 
              icon={<IconServer size={18} />}
            />
            <Stepper.Step 
              label="Finalize" 
              description="Create configuration" 
              icon={<IconKey size={18} />}
            />
          </Stepper>

          {activeStep === 0 && (
            <>
              {testResult && (
                <Alert 
                  icon={testResult.success ? <IconCheck size={16} /> : <IconAlertCircle size={16} />} 
                  title={testResult.success ? "Connection Successful" : "Connection Failed"} 
                  color={testResult.success ? "green" : "red"} 
                  mb="md"
                >
                  {testResult.message}
                </Alert>
              )}

              <form>
                <TextInput
                  label="Configuration Name"
                  placeholder="e.g., Production Database"
                  description="A friendly name to identify this database"
                  required
                  mb="md"
                  {...form.getInputProps('name')}
                />
                
                <Grid>
                  <Grid.Col span={{ base: 12, sm: 8 }}>
                    <TextInput
                      label="Host"
                      placeholder="e.g., db.example.com or 192.168.1.1"
                      description="Database server hostname or IP address"
                      required
                      mb="md"
                      {...form.getInputProps('host')}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 4 }}>
                    <NumberInput
                      label="Port"
                      placeholder="5432"
                      description="PostgreSQL port"
                      required
                      min={1}
                      max={65535}
                      mb="md"
                      {...form.getInputProps('port')}
                    />
                  </Grid.Col>
                </Grid>
                
                <TextInput
                  label="Database Name"
                  placeholder="e.g., blockchain_data"
                  description="The name of the PostgreSQL database"
                  required
                  mb="md"
                  {...form.getInputProps('databaseName')}
                />
                
                <TextInput
                  label="Schema"
                  placeholder="public"
                  description="Database schema (default: public)"
                  mb="md"
                  {...form.getInputProps('schema')}
                />
                
                <Grid>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      label="Username"
                      placeholder="Database username"
                      required
                      mb="md"
                      {...form.getInputProps('username')}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <PasswordInput
                      label="Password"
                      placeholder="Database password"
                      mb="md"
                      {...form.getInputProps('password')}
                    />
                  </Grid.Col>
                </Grid>
                
                <Switch
                  label="Use SSL Connection"
                  description="Enable secure SSL connection to the database"
                  checked={form.values.ssl}
                  onChange={(event) => form.setFieldValue('ssl', event.currentTarget.checked)}
                  mb="xl"
                />
                
                <Group justify="flex-end" mt="md">
                  <Button 
                    onClick={testConnection} 
                    loading={testingConnection}
                    disabled={!form.isValid()}
                  >
                    Test Connection
                  </Button>
                </Group>
              </form>
            </>
          )}

          {activeStep === 1 && (
            <>
              <Alert 
                icon={<IconCheck size={16} />} 
                title="Connection Verified" 
                color="green" 
                mb="xl"
              >
                Your database connection has been successfully verified. Continue to create the database configuration.
              </Alert>
              
              <Card withBorder mb="xl">
                <Text fw={500} size="lg" mb="md">Connection Details Summary</Text>
                <List spacing="xs">
                  <List.Item 
                    icon={
                      <ThemeIcon color="blue" size={24} radius="xl">
                        <IconDatabase size={16} />
                      </ThemeIcon>
                    }
                  >
                    <Text fw={500}>Name:</Text> {form.values.name}
                  </List.Item>
                  <List.Item 
                    icon={
                      <ThemeIcon color="blue" size={24} radius="xl">
                        <IconServer size={16} />
                      </ThemeIcon>
                    }
                  >
                    <Text fw={500}>Host:</Text> {form.values.host}:{form.values.port}
                  </List.Item>
                  <List.Item 
                    icon={
                      <ThemeIcon color="blue" size={24} radius="xl">
                        <IconDatabase size={16} />
                      </ThemeIcon>
                    }
                  >
                    <Text fw={500}>Database:</Text> {form.values.databaseName}
                  </List.Item>
                  <List.Item 
                    icon={
                      <ThemeIcon color="blue" size={24} radius="xl">
                        <IconUser size={16} />
                      </ThemeIcon>
                    }
                  >
                    <Text fw={500}>Username:</Text> {form.values.username}
                  </List.Item>
                  <List.Item 
                    icon={
                      <ThemeIcon color="blue" size={24} radius="xl">
                        <IconDatabase size={16} />
                      </ThemeIcon>
                    }
                  >
                    <Text fw={500}>Schema:</Text> {form.values.schema}
                  </List.Item>
                  <List.Item 
                    icon={
                      <ThemeIcon color="blue" size={24} radius="xl">
                        <IconCircleCheck size={16} />
                      </ThemeIcon>
                    }
                  >
                    <Text fw={500}>SSL:</Text> {form.values.ssl ? 'Enabled' : 'Disabled'}
                  </List.Item>
                </List>
              </Card>
              
              <Box mb="xl">
                <Text fw={500} size="lg" mb="md">What Will Happen Next?</Text>
                <Text size="sm" mb="md">
                  After creating this database configuration, you'll be able to:
                </Text>
                <List spacing="sm" withPadding>
                  <List.Item>
                    Create indexing jobs for Solana blockchain data
                  </List.Item>
                  <List.Item>
                    Select specific data types to index into your database
                  </List.Item>
                  <List.Item>
                    Configure automatic updates and synchronization
                  </List.Item>
                  <List.Item>
                    Monitor the indexing process in real-time
                  </List.Item>
                </List>
              </Box>
              
              {error && (
                <Alert 
                  icon={<IconAlertCircle size={16} />}
                  title="Error" 
                  color="red" 
                  mb="xl"
                >
                  {error}
                </Alert>
              )}
              
              <Group justify="space-between">
                <Button 
                  variant="subtle" 
                  onClick={() => setActiveStep(0)}
                >
                  Go Back
                </Button>
                <Button 
                  onClick={() => handleSubmit(form.values)} 
                  loading={loading}
                  rightSection={<IconArrowRight size={16} />}
                >
                  Create Database Configuration
                </Button>
              </Group>
            </>
          )}

          {activeStep === 2 && (
            <Center py={30}>
              <Box style={{ textAlign: 'center', maxWidth: 500 }}>
                <ThemeIcon color="green" size={48} radius="xl" mb="md" mx="auto">
                  <IconCheck size={24} />
                </ThemeIcon>
                <Title order={3} mb="sm">Configuration Created Successfully</Title>
                <Text c="dimmed" mb="xl">
                  Your database configuration has been created and is ready to use with indexing jobs.
                </Text>
                <Alert mb="xl" color="blue">
                  <Text fw={500} mb="xs">Hint: Create tables automatically</Text>
                  <Text size="sm">
                    You can have the system automatically create all necessary tables for blockchain data 
                    by creating an indexing job and selecting the "Create tables if not exist" option.
                  </Text>
                </Alert>
                <Code block mb="xl">
                  {`CREATE TABLE tokens (
  token_address VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255),
  symbol VARCHAR(64),
  decimals INT,
  total_supply NUMERIC,
  last_updated_at TIMESTAMP DEFAULT NOW()
);`}
                </Code>
                <Button onClick={() => navigate('/indexing-jobs/create')}>
                  Create Your First Indexing Job
                </Button>
              </Box>
            </Center>
          )}
        </Paper>
      </Container>
    </DashboardShell>
  );
} 