import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  TextInput,
  NumberInput,
  Button,
  Group,
  Paper,
  Alert,
  Grid,
  Stepper,
  Card,
  Box,
  Select,
  Checkbox,
  ThemeIcon,
  Center,
  List,
  Stack,
  Radio,
  Divider,
  Accordion,
  MultiSelect,
  LoadingOverlay
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { 
  IconAlertCircle, 
  IconCheck, 
  IconDatabase, 
  IconArrowRight,
  IconRocket,
  IconListDetails,
  IconSettings,
  IconChevronRight,
  IconChevronLeft,
  IconPlus
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

interface DatabaseConfig {
  id: string;
  name: string;
  host: string;
  port: number;
  databaseName: string;
  username: string;
  schema: string;
  ssl: boolean;
  createdAt: string;
}

interface FormValues {
  name: string;
  description: string;
  databaseConfigId: string;
  dataType: string;
  configOptions: {
    frequency: string;
    saveRawData: boolean;
    collections: string[];
    programIds: string[];
    startDate: string;
    webookUrl: string;
  };
}

const DATA_TYPES = [
  {
    value: 'nft_prices',
    label: 'NFT Prices',
    description: 'Track real-time NFT price data across major marketplaces',
  },
  {
    value: 'token_holders',
    label: 'Token Holders',
    description: 'Map token balances for SPL tokens and analyze holdings',
  },
  {
    value: 'transactions',
    label: 'Transactions',
    description: 'Index all transactions for specified programs and accounts',
  },
  {
    value: 'program_accounts',
    label: 'Program Accounts',
    description: 'Sync accounts owned by specific programs with their data',
  },
];

const NFT_COLLECTIONS = [
  { value: 'degenape', label: 'Degen Ape Academy' },
  { value: 'solana_monkey', label: 'Solana Monkey Business' },
  { value: 'okaybears', label: 'Okay Bears' },
  { value: 'mad_lads', label: 'Mad Lads' },
  { value: 'famous_fox', label: 'Famous Fox Federation' },
];

export default function CreateIndexingJob() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [databaseConfigs, setDatabaseConfigs] = useState<DatabaseConfig[]>([]);
  const { token } = useAuth();
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    initialValues: {
      name: '',
      description: '',
      databaseConfigId: '',
      dataType: '',
      configOptions: {
        frequency: 'realtime',
        saveRawData: true,
        collections: [],
        programIds: [],
        startDate: new Date().toISOString().split('T')[0],
        webookUrl: '',
      },
    },
    validate: {
      name: (value) => (value.trim().length === 0 ? 'Job name is required' : null),
      databaseConfigId: (value, values) => 
        activeStep >= 1 && value.trim().length === 0 ? 'Please select a database configuration' : null,
      dataType: (value, values) => 
        activeStep >= 2 && value.trim().length === 0 ? 'Please select a data type to index' : null,
      configOptions: {
        collections: (value, values) => 
          activeStep >= 3 && values.dataType === 'nft_prices' && (!value || value.length === 0) 
            ? 'Please select at least one NFT collection to track' : null,
        programIds: (value, values) => 
          activeStep >= 3 && (values.dataType === 'transactions' || values.dataType === 'program_accounts') 
            && (!value || value.length === 0) ? 'Please enter at least one program ID' : null,
      }
    },
  });

  useEffect(() => {
    fetchDatabaseConfigs();
  }, []);

  const fetchDatabaseConfigs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/database-configs', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setDatabaseConfigs(response.data || []);
      
      // Set mock data for development only if no production data is available
      if (!response.data || response.data.length === 0) {
        // For development/testing purposes only - remove in production
        if (process.env.NODE_ENV === 'development') {
          setDatabaseConfigs([
            { 
              id: '1', 
              name: 'Production Database', 
              host: 'postgres.example.com', 
              port: 5432,
              databaseName: 'blockchain_prod', 
              username: 'prod_user',
              schema: 'public',
              ssl: true,
              createdAt: '2023-04-15T14:22:00Z'
            },
            { 
              id: '2', 
              name: 'Development DB', 
              host: 'localhost', 
              port: 5432,
              databaseName: 'blockchain_dev', 
              username: 'dev_user',
              schema: 'public',
              ssl: false,
              createdAt: '2023-04-10T09:15:00Z'
            },
          ]);
        }
      }
    } catch (err: any) {
      console.error('Error fetching database configs:', err);
      setError(err.response?.data?.message || 'Failed to load database configurations');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    const validateResult = validateStep(activeStep);
    if (validateResult) {
      setActiveStep((current) => current + 1);
    }
  };

  const prevStep = () => {
    setActiveStep((current) => current - 1);
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 0:
        return form.validateField('name').hasError === false;
      case 1:
        return form.validateField('databaseConfigId').hasError === false;
      case 2:
        return form.validateField('dataType').hasError === false;
      case 3:
        if (form.values.dataType === 'nft_prices') {
          return form.validateField('configOptions.collections').hasError === false;
        } else if (form.values.dataType === 'transactions' || form.values.dataType === 'program_accounts') {
          return form.validateField('configOptions.programIds').hasError === false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const response = await api.post('/api/indexing-jobs', form.values, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setSuccess('Indexing job created successfully!');
      
      // Navigate to the jobs list after a short delay
      setTimeout(() => {
        navigate('/indexing-jobs');
      }, 2000);
    } catch (err: any) {
      console.error('Error creating indexing job:', err);
      setError(err.response?.data?.message || 'Failed to create indexing job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Check if there are no database configurations
  if (!loading && databaseConfigs.length === 0) {
    return (
      <DashboardShell>
        <Container size="md" py={40}>
          <Paper withBorder p="xl" radius="md">
            <Box ta="center" py={60}>
              <IconDatabase size={70} color="gray" style={{ opacity: 0.3 }} />
              <Title order={2} mt="md">Database Connection Required</Title>
              <Text size="md" c="dimmed" mt="md" mb="xl" maw={500} mx="auto">
                You need to set up at least one database connection before creating an indexing job.
                Your indexed blockchain data will be stored in the database you configure.
              </Text>
              <Button 
                onClick={() => navigate('/database-configs/create')} 
                leftSection={<IconPlus size={16} />}
                size="md"
              >
                Create Database Configuration
              </Button>
            </Box>
          </Paper>
        </Container>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <Container size="md" py={40}>
        <Paper withBorder p="xl" radius="md">
          <LoadingOverlay visible={loading} loaderProps={{ size: 'md' }} />
          
          <Group mb={30}>
            <IconDatabase size={30} />
            <div>
              <Title order={2}>Create Indexing Job</Title>
              <Text c="dimmed" size="sm">
                Set up a new blockchain data indexing job
              </Text>
            </div>
          </Group>
          
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
              icon={<IconRocket size={16} />} 
              title="Success" 
              color="green" 
              mb="xl"
              onClose={() => setSuccess(null)}
              withCloseButton
            >
              {success}
            </Alert>
          )}
          
          <Stepper active={activeStep} mb="xl">
            <Stepper.Step label="Basic Info" description="Name and description">
              <form>
                <Stack gap="md" mt="xl">
                  <TextInput
                    label="Job Name"
                    placeholder="e.g., NFT Price Tracker"
                    required
                    {...form.getInputProps('name')}
                  />
                  
                  <TextInput
                    label="Description (Optional)"
                    placeholder="Brief description of this indexing job"
                    {...form.getInputProps('description')}
                  />
                </Stack>
              </form>
            </Stepper.Step>
            
            <Stepper.Step label="Select Database" description="Choose a database">
              <form>
                <Stack gap="md" mt="xl">
                  {databaseConfigs.length === 0 ? (
                    <Alert 
                      icon={<IconAlertCircle size={16} />} 
                      title="No Database Configurations" 
                      color="yellow" 
                      mb="xl"
                    >
                      You need to create a database configuration first before you can create an indexing job.
                      <Button 
                        component="a" 
                        href="/database-configs/create" 
                        variant="light" 
                        size="xs" 
                        mt="xs"
                      >
                        Create Database Configuration
                      </Button>
                    </Alert>
                  ) : (
                    <Radio.Group
                      {...form.getInputProps('databaseConfigId')}
                    >
                      <Stack gap="md">
                        {databaseConfigs.map((config) => (
                          <Card key={config.id} withBorder p="sm" radius="md">
                            <Group justify="space-between">
                              <Radio value={config.id} label={null} />
                              <div style={{ flex: 1 }}>
                                <Text fw={500}>{config.name}</Text>
                                <Text size="xs" c="dimmed">
                                  {config.host} - {config.databaseName}
                                </Text>
                              </div>
                            </Group>
                          </Card>
                        ))}
                      </Stack>
                    </Radio.Group>
                  )}
                </Stack>
              </form>
            </Stepper.Step>
            
            <Stepper.Step label="Data Type" description="Choose data to index">
              <form>
                <Stack gap="md" mt="xl">
                  <Radio.Group
                    {...form.getInputProps('dataType')}
                  >
                    <Stack gap="md">
                      {DATA_TYPES.map((type) => (
                        <Card key={type.value} withBorder p="sm" radius="md">
                          <Group justify="space-between">
                            <Radio value={type.value} label={null} />
                            <div style={{ flex: 1 }}>
                              <Text fw={500}>{type.label}</Text>
                              <Text size="xs" c="dimmed">
                                {type.description}
                              </Text>
                            </div>
                          </Group>
                        </Card>
                      ))}
                    </Stack>
                  </Radio.Group>
                </Stack>
              </form>
            </Stepper.Step>
            
            <Stepper.Step label="Configuration" description="Set indexing options">
              <form>
                <Stack gap="md" mt="xl">
                  <Select
                    label="Update Frequency"
                    required
                    data={[
                      { value: 'realtime', label: 'Real-time (Continuous Sync)' },
                      { value: 'hourly', label: 'Hourly' },
                      { value: 'daily', label: 'Daily' },
                    ]}
                    {...form.getInputProps('configOptions.frequency')}
                  />
                  
                  <Checkbox
                    label="Save Raw Transaction Data"
                    description="Store the full raw data in addition to parsed fields"
                    checked={form.values.configOptions.saveRawData}
                    onChange={(event) => form.setFieldValue('configOptions.saveRawData', event.currentTarget.checked)}
                  />
                  
                  <Divider my="md" />
                  
                  {form.values.dataType === 'nft_prices' && (
                    <MultiSelect
                      label="NFT Collections to Track"
                      data={NFT_COLLECTIONS}
                      placeholder="Select NFT collections"
                      required
                      {...form.getInputProps('configOptions.collections')}
                    />
                  )}
                  
                  {(form.values.dataType === 'transactions' || form.values.dataType === 'program_accounts') && (
                    <MultiSelect
                      label="Program IDs"
                      data={[]}
                      placeholder="Enter program IDs to index"
                      searchable
                      required
                      {...form.getInputProps('configOptions.programIds')}
                    />
                  )}
                  
                  {form.values.dataType === 'token_holders' && (
                    <MultiSelect
                      label="Token Mints"
                      data={[]}
                      placeholder="Enter token mint addresses"
                      searchable
                      {...form.getInputProps('configOptions.programIds')}
                    />
                  )}
                  
                  <TextInput
                    label="Webhook URL (Optional)"
                    placeholder="https://example.com/webhook"
                    description="Get notified when data is indexed"
                    {...form.getInputProps('configOptions.webookUrl')}
                  />
                </Stack>
              </form>
            </Stepper.Step>
            
            <Stepper.Completed>
              <Box ta="center" py={40}>
                <Title order={2} mb="md">Ready to Launch!</Title>
                <Text size="lg" mb="xl">
                  Your indexing job is ready to be created. Review the details and click Launch to start indexing.
                </Text>
                
                <Stack gap="md" mb="xl" maw={500} mx="auto">
                  <Card withBorder p="md">
                    <Text fw={700} mb={5}>Job Name:</Text>
                    <Text>{form.values.name}</Text>
                  </Card>
                  
                  <Card withBorder p="md">
                    <Text fw={700} mb={5}>Database:</Text>
                    <Text>{databaseConfigs.find(config => config.id === form.values.databaseConfigId)?.name}</Text>
                  </Card>
                  
                  <Card withBorder p="md">
                    <Text fw={700} mb={5}>Data Type:</Text>
                    <Text>{DATA_TYPES.find(type => type.value === form.values.dataType)?.label}</Text>
                  </Card>
                  
                  <Card withBorder p="md">
                    <Text fw={700} mb={5}>Frequency:</Text>
                    <Text>
                      {form.values.configOptions.frequency === 'realtime' ? 'Real-time' : 
                       form.values.configOptions.frequency === 'hourly' ? 'Hourly' : 'Daily'}
                    </Text>
                  </Card>
                </Stack>
              </Box>
            </Stepper.Completed>
          </Stepper>
          
          <Group justify="space-between" mt="xl">
            {activeStep > 0 ? (
              <Button variant="default" onClick={prevStep} leftSection={<IconChevronLeft size={14} />}>
                Back
              </Button>
            ) : (
              <Button variant="default" onClick={() => navigate('/indexing-jobs')}>
                Cancel
              </Button>
            )}
            
            {activeStep === 4 ? (
              <Button onClick={handleSubmit} rightSection={<IconRocket size={14} />}>
                Launch Indexing Job
              </Button>
            ) : (
              <Button onClick={nextStep} rightSection={<IconChevronRight size={14} />}>
                Next Step
              </Button>
            )}
          </Group>
        </Paper>
      </Container>
    </DashboardShell>
  );
} 