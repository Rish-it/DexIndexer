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
  Progress,
  Stack,
  Box,
  Card,
  Tabs,
  Tooltip,
  Flex,
} from '@mantine/core';
import {
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconPlus,
  IconAlertCircle,
  IconPlayerPause,
  IconPlayerPlay,
  IconReload,
  IconCheck,
  IconHourglassFilled,
  IconActivity,
  IconDots,
  IconInfoCircle,
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

interface IndexingJob {
  id: string;
  name: string;
  dataType: string;
  databaseName: string;
  status: 'active' | 'paused' | 'failed' | 'completed' | 'queued';
  progress: number;
  lastRunAt: string;
  recordsProcessed: number;
  frequency: 'realtime' | 'hourly' | 'daily';
  createdAt: string;
  error?: string;
}

export default function IndexingJobs() {
  const [jobs, setJobs] = useState<IndexingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>('all');
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchIndexingJobs();
  }, []);

  const fetchIndexingJobs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/indexing-jobs', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setJobs(response.data || []);
      
      // If no real data, use mock data for development
      if (!response.data || response.data.length === 0) {
        setJobs([
          { 
            id: '1', 
            name: 'NFT Prices Tracker', 
            dataType: 'nft_prices',
            databaseName: 'blockchain_prod',
            status: 'active',
            progress: 67,
            lastRunAt: '2023-04-15T14:22:00Z',
            recordsProcessed: 2450983,
            frequency: 'realtime',
            createdAt: '2023-04-10T09:15:00Z'
          },
          { 
            id: '2', 
            name: 'Token Holders Analysis', 
            dataType: 'token_holders',
            databaseName: 'blockchain_prod',
            status: 'paused',
            progress: 100,
            lastRunAt: '2023-04-14T22:10:00Z',
            recordsProcessed: 156729,
            frequency: 'daily',
            createdAt: '2023-04-05T11:30:00Z'
          },
          { 
            id: '3', 
            name: 'DEX Transactions', 
            dataType: 'transactions',
            databaseName: 'blockchain_dev',
            status: 'failed',
            progress: 45,
            lastRunAt: '2023-04-15T03:41:00Z',
            recordsProcessed: 5672391,
            frequency: 'hourly',
            createdAt: '2023-04-01T16:20:00Z',
            error: 'Database connection timeout after 120 seconds'
          },
          { 
            id: '4', 
            name: 'Program Accounts Sync', 
            dataType: 'program_accounts',
            databaseName: 'blockchain_dev',
            status: 'queued',
            progress: 0,
            lastRunAt: '2023-04-15T10:00:00Z',
            recordsProcessed: 0,
            frequency: 'daily',
            createdAt: '2023-04-14T09:45:00Z'
          },
        ]);
      }
    } catch (err: any) {
      console.error('Error fetching indexing jobs:', err);
      setError(err.response?.data?.message || 'Failed to load indexing jobs');
      
      // Set mock data for development
      setJobs([
        { 
          id: '1', 
          name: 'NFT Prices Tracker', 
          dataType: 'nft_prices',
          databaseName: 'blockchain_prod',
          status: 'active',
          progress: 67,
          lastRunAt: '2023-04-15T14:22:00Z',
          recordsProcessed: 2450983,
          frequency: 'realtime',
          createdAt: '2023-04-10T09:15:00Z'
        },
        { 
          id: '2', 
          name: 'Token Holders Analysis', 
          dataType: 'token_holders',
          databaseName: 'blockchain_prod',
          status: 'paused',
          progress: 100,
          lastRunAt: '2023-04-14T22:10:00Z',
          recordsProcessed: 156729,
          frequency: 'daily',
          createdAt: '2023-04-05T11:30:00Z'
        },
        { 
          id: '3', 
          name: 'DEX Transactions', 
          dataType: 'transactions',
          databaseName: 'blockchain_dev',
          status: 'failed',
          progress: 45,
          lastRunAt: '2023-04-15T03:41:00Z',
          recordsProcessed: 5672391,
          frequency: 'hourly',
          createdAt: '2023-04-01T16:20:00Z',
          error: 'Database connection timeout after 120 seconds'
        },
        { 
          id: '4', 
          name: 'Program Accounts Sync', 
          dataType: 'program_accounts',
          databaseName: 'blockchain_dev',
          status: 'queued',
          progress: 0,
          lastRunAt: '2023-04-15T10:00:00Z',
          recordsProcessed: 0,
          frequency: 'daily',
          createdAt: '2023-04-14T09:45:00Z'
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
      await api.delete(`/api/indexing-jobs/${deleteId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setJobs(jobs.filter(job => job.id !== deleteId));
      setDeleteModalOpen(false);
      setDeleteId(null);
    } catch (err: any) {
      console.error('Delete indexing job error:', err);
      setError(err.response?.data?.message || 'Failed to delete indexing job');
    } finally {
      setLoading(false);
    }
  };

  const handleJobAction = async (jobId: string, action: 'pause' | 'resume' | 'restart') => {
    try {
      await api.post(`/api/indexing-jobs/${jobId}/${action}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update job status in the UI
      setJobs(jobs.map(job => {
        if (job.id === jobId) {
          return {
            ...job,
            status: action === 'pause' ? 'paused' : 
                   action === 'resume' || action === 'restart' ? 'active' : job.status
          };
        }
        return job;
      }));
    } catch (err: any) {
      console.error(`Error ${action} indexing job:`, err);
      setError(err.response?.data?.message || `Failed to ${action} indexing job`);
    }
  };

  const openDeleteModal = (id: string) => {
    setDeleteId(id);
    setDeleteModalOpen(true);
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

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'paused': return 'yellow';
      case 'failed': return 'red';
      case 'completed': return 'blue';
      case 'queued': return 'gray';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <IconActivity size={14} />;
      case 'paused': return <IconPlayerPause size={14} />;
      case 'failed': return <IconAlertCircle size={14} />;
      case 'completed': return <IconCheck size={14} />;
      case 'queued': return <IconHourglassFilled size={14} />;
      default: return <IconDots size={14} />;
    }
  };

  const filteredJobs = statusFilter === 'all' 
    ? jobs 
    : jobs.filter(job => job.status === statusFilter);

  return (
    <DashboardShell>
      <Container size="lg" py={40}>
        <Group justify="space-between" mb={30}>
          <div>
            <Title order={2}>Indexing Jobs</Title>
            <Text c="dimmed" size="sm">
              Manage your blockchain data indexing jobs
            </Text>
          </div>
          <Button 
            leftSection={<IconPlus size={16} />}
            onClick={() => navigate('/indexing-jobs/create')}
          >
            Create Indexing Job
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
        
        <Card withBorder mb="md">
          <Tabs defaultValue="all" onChange={setStatusFilter}>
            <Tabs.List mb="md">
              <Tabs.Tab value="all">All Jobs</Tabs.Tab>
              <Tabs.Tab value="active">Active</Tabs.Tab>
              <Tabs.Tab value="paused">Paused</Tabs.Tab>
              <Tabs.Tab value="queued">Queued</Tabs.Tab>
              <Tabs.Tab value="failed">Failed</Tabs.Tab>
            </Tabs.List>
          </Tabs>
          
          <Paper withBorder p="md" radius="md">
            {filteredJobs.length === 0 ? (
              <Box py={60} ta="center">
                <IconActivity size={64} color="gray" style={{ opacity: 0.3 }} />
                <Title order={3} mt="md">No Indexing Jobs Found</Title>
                <Text c="dimmed" size="md" maw={500} mx="auto" mt="sm" mb="xl">
                  {statusFilter === 'all' 
                    ? "You haven't created any indexing jobs yet. Start capturing blockchain data by creating your first job."
                    : `No ${statusFilter} jobs found. Change the filter or create a new job to get started.`}
                </Text>
                <Button 
                  onClick={() => navigate('/indexing-jobs/create')}
                  leftSection={<IconPlus size={16} />}
                  size="md"
                >
                  Create Your First Job
                </Button>
              </Box>
            ) : (
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Data Type</Table.Th>
                    <Table.Th>Database</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Progress</Table.Th>
                    <Table.Th>Frequency</Table.Th>
                    <Table.Th>Last Run</Table.Th>
                    <Table.Th style={{ width: 50 }}></Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredJobs.map((job) => (
                    <Table.Tr key={job.id}>
                      <Table.Td>
                        <Text fw={500}>{job.name}</Text>
                      </Table.Td>
                      <Table.Td>{job.dataType.replace('_', ' ')}</Table.Td>
                      <Table.Td>{job.databaseName}</Table.Td>
                      <Table.Td>
                        <Badge 
                          color={getStatusColor(job.status)} 
                          leftSection={getStatusIcon(job.status)}
                        >
                          {job.status}
                        </Badge>
                        {job.error && (
                          <Tooltip label={job.error}>
                            <ActionIcon color="red" variant="transparent" size="xs">
                              <IconInfoCircle size={14} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </Table.Td>
                      <Table.Td style={{ width: 150 }}>
                        <Flex align="center" gap="xs">
                          <Box style={{ flex: 1 }}>
                            <Progress 
                              value={job.progress} 
                              color={getStatusColor(job.status)}
                              size="sm"
                            />
                          </Box>
                          <Text size="xs" w={35} ta="right">{job.progress}%</Text>
                        </Flex>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">
                          {job.frequency === 'realtime' ? 'Real-time' : 
                          job.frequency === 'hourly' ? 'Hourly' : 'Daily'}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{formatDate(job.lastRunAt)}</Text>
                        <Text size="xs" c="dimmed">
                          {formatNumber(job.recordsProcessed)} records
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Menu position="bottom-end" shadow="md">
                          <Menu.Target>
                            <ActionIcon variant="subtle">
                              <IconDotsVertical size={16} />
                            </ActionIcon>
                          </Menu.Target>
                          
                          <Menu.Dropdown>
                            {job.status === 'active' && (
                              <Menu.Item 
                                leftSection={<IconPlayerPause size={14} />}
                                onClick={() => handleJobAction(job.id, 'pause')}
                              >
                                Pause Job
                              </Menu.Item>
                            )}
                            {job.status === 'paused' && (
                              <Menu.Item 
                                leftSection={<IconPlayerPlay size={14} />}
                                onClick={() => handleJobAction(job.id, 'resume')}
                              >
                                Resume Job
                              </Menu.Item>
                            )}
                            {(job.status === 'failed' || job.status === 'completed') && (
                              <Menu.Item 
                                leftSection={<IconReload size={14} />}
                                onClick={() => handleJobAction(job.id, 'restart')}
                              >
                                Restart Job
                              </Menu.Item>
                            )}
                            <Menu.Item 
                              leftSection={<IconEdit size={14} />}
                              onClick={() => navigate(`/indexing-jobs/edit/${job.id}`)}
                            >
                              Edit
                            </Menu.Item>
                            <Menu.Item 
                              leftSection={<IconTrash size={14} />}
                              color="red"
                              onClick={() => openDeleteModal(job.id)}
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
        </Card>
        
        <Modal 
          opened={deleteModalOpen} 
          onClose={() => setDeleteModalOpen(false)}
          title="Confirm Deletion"
          centered
        >
          <Text mb="xl">
            Are you sure you want to delete this indexing job? 
            This action cannot be undone. The indexed data will remain in your database.
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
      </Container>
    </DashboardShell>
  );
} 