import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Paper,
  Table,
  ActionIcon,
  Menu,
  Badge,
  Alert,
  Modal,
  Stack,
  List,
  ThemeIcon,
  Box,
} from '@mantine/core';
import {
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconDatabase,
  IconPlus,
  IconServer,
  IconEye,
  IconUser,
  IconAlertCircle,
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

export default function DatabaseConfigs() {
  const [configs, setConfigs] = useState<DatabaseConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<DatabaseConfig | null>(null);
  const { token } = useAuth();
  const navigate = useNavigate();

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
      
      setConfigs(response.data || []);
      
      // If no real data, use mock data for development
      if (!response.data || response.data.length === 0) {
        setConfigs([
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
    } catch (err: any) {
      console.error('Error fetching database configs:', err);
      setError(err.response?.data?.message || 'Failed to load database configurations');
      
      // Set mock data for development
      setConfigs([
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
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      setLoading(true);
      await api.delete(`/api/database-configs/${deleteId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setConfigs(configs.filter(config => config.id !== deleteId));
      setDeleteModalOpen(false);
      setDeleteId(null);
    } catch (err: any) {
      console.error('Delete database config error:', err);
      setError(err.response?.data?.message || 'Failed to delete database configuration');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (id: string) => {
    setDeleteId(id);
    setDeleteModalOpen(true);
  };

  const openDetailsModal = (config: DatabaseConfig) => {
    setSelectedConfig(config);
    setDetailsModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <DashboardShell>
      <Container size="lg" py={40}>
        <Group justify="space-between" mb={30}>
          <div>
            <Title order={2}>Database Configurations</Title>
            <Text c="dimmed" size="sm">
              Manage your PostgreSQL database connections for indexing blockchain data
            </Text>
          </div>
          <Button 
            leftSection={<IconPlus size={16} />}
            onClick={() => navigate('/database-configs/create')}
          >
            New Database
          </Button>
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
        
        <Paper withBorder p="md" radius="md">
          {configs.length === 0 ? (
            <Box py={60} ta="center">
              <IconDatabase size={64} color="gray" style={{ opacity: 0.3 }} />
              <Title order={3} mt="md">No Database Configurations</Title>
              <Text c="dimmed" size="md" maw={500} mx="auto" mt="sm" mb="xl">
                Connect your PostgreSQL database to start indexing blockchain data. You'll need database credentials with write access.
              </Text>
              <Button 
                onClick={() => navigate('/database-configs/create')}
                leftSection={<IconPlus size={16} />}
                size="md"
              >
                Add Your First Database
              </Button>
            </Box>
          ) : (
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Host</Table.Th>
                  <Table.Th>Database</Table.Th>
                  <Table.Th>SSL</Table.Th>
                  <Table.Th>Created</Table.Th>
                  <Table.Th style={{ width: 50 }}></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {configs.map((config) => (
                  <Table.Tr key={config.id}>
                    <Table.Td>{config.name}</Table.Td>
                    <Table.Td>{config.host}:{config.port}</Table.Td>
                    <Table.Td>{config.databaseName}</Table.Td>
                    <Table.Td>
                      <Badge color={config.ssl ? 'green' : 'gray'}>
                        {config.ssl ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{formatDate(config.createdAt)}</Table.Td>
                    <Table.Td>
                      <Menu position="bottom-end" shadow="md">
                        <Menu.Target>
                          <ActionIcon variant="subtle">
                            <IconDotsVertical size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        
                        <Menu.Dropdown>
                          <Menu.Item 
                            leftSection={<IconEye size={14} />}
                            onClick={() => openDetailsModal(config)}
                          >
                            View Details
                          </Menu.Item>
                          <Menu.Item 
                            leftSection={<IconEdit size={14} />}
                            onClick={() => navigate(`/database-configs/edit/${config.id}`)}
                          >
                            Edit
                          </Menu.Item>
                          <Menu.Item 
                            leftSection={<IconTrash size={14} />}
                            color="red"
                            onClick={() => openDeleteModal(config.id)}
                          >
                            Delete
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Paper>
        
        <Modal 
          opened={deleteModalOpen} 
          onClose={() => setDeleteModalOpen(false)}
          title="Confirm Deletion"
          centered
        >
          <Text mb="xl">
            Are you sure you want to delete this database configuration? 
            This will also delete any indexing jobs using this database.
          </Text>
          <Group justify="flex-end">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button color="red" onClick={handleDelete} loading={loading}>
              Delete
            </Button>
          </Group>
        </Modal>
        
        <Modal 
          opened={detailsModalOpen} 
          onClose={() => setDetailsModalOpen(false)}
          title="Database Configuration Details"
          size="md"
          centered
        >
          {selectedConfig && (
            <Stack>
              <Text fw={700} size="lg">{selectedConfig.name}</Text>
              
              <List spacing="xs">
                <List.Item 
                  icon={
                    <ThemeIcon color="blue" size={24} radius="xl">
                      <IconServer size={16} />
                    </ThemeIcon>
                  }
                >
                  <Text fw={500}>Host:</Text> {selectedConfig.host}:{selectedConfig.port}
                </List.Item>
                <List.Item 
                  icon={
                    <ThemeIcon color="blue" size={24} radius="xl">
                      <IconDatabase size={16} />
                    </ThemeIcon>
                  }
                >
                  <Text fw={500}>Database Name:</Text> {selectedConfig.databaseName}
                </List.Item>
                <List.Item 
                  icon={
                    <ThemeIcon color="blue" size={24} radius="xl">
                      <IconUser size={16} />
                    </ThemeIcon>
                  }
                >
                  <Text fw={500}>Username:</Text> {selectedConfig.username}
                </List.Item>
                <List.Item 
                  icon={
                    <ThemeIcon color="blue" size={24} radius="xl">
                      <IconDatabase size={16} />
                    </ThemeIcon>
                  }
                >
                  <Text fw={500}>Schema:</Text> {selectedConfig.schema}
                </List.Item>
                <List.Item 
                  icon={
                    <ThemeIcon color={selectedConfig.ssl ? "green" : "gray"} size={24} radius="xl">
                      <IconDatabase size={16} />
                    </ThemeIcon>
                  }
                >
                  <Text fw={500}>SSL:</Text> {selectedConfig.ssl ? 'Enabled' : 'Disabled'}
                </List.Item>
              </List>
              
              <Group justify="flex-end" mt="md">
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/database-configs/edit/${selectedConfig.id}`)}
                  leftSection={<IconEdit size={16} />}
                >
                  Edit
                </Button>
                <Button onClick={() => setDetailsModalOpen(false)}>
                  Close
                </Button>
              </Group>
            </Stack>
          )}
        </Modal>
      </Container>
    </DashboardShell>
  );
} 