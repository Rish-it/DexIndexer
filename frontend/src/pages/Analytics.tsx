import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Text,
  Grid,
  Card,
  RingProgress,
  Group,
  Paper,
  Table,
  Badge,
  Tabs,
  SimpleGrid,
  Box,
  List,
  ThemeIcon,
  Skeleton,
  Alert,
  Button,
  Center,
} from '@mantine/core';
import {
  IconDatabase,
  IconArrowUpRight,
  IconArrowDownRight,
  IconActivity,
  IconClock,
  IconServer,
  IconDatabaseImport,
  IconAlertCircle,
  IconCheck,
  IconCoin,
  IconBoxMultiple,
  IconPlus,
  IconChartLine,
} from '@tabler/icons-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DashboardShell } from '../components/layout/DashboardShell';

interface AnalyticsData {
  activeJobs: number;
  totalJobs: number;
  totalRecordsProcessed: number;
  totalDatabases: number;
  recordsProcessedToday: number;
  recordsChangePercentage: number;
  lastUpdateTime: string;
  topJobs: {
    id: string;
    name: string;
    dataType: string;
    recordsProcessed: number;
    status: string;
  }[];
  dataTypeDistribution: {
    type: string;
    count: number;
    percentage: number;
  }[];
}

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/analytics', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setData(response.data);
      
      // If no data in response, set data to null to show empty state
      if (!response.data || !response.data.totalJobs) {
        setData(null);
      }
    } catch (err: any) {
      console.error('Error fetching analytics data:', err);
      setError(err.response?.data?.message || 'Failed to load analytics data');
      
      // Use mock data for development
      setData({
        activeJobs: 3,
        totalJobs: 5,
        totalRecordsProcessed: 8925641,
        totalDatabases: 2,
        recordsProcessedToday: 356891,
        recordsChangePercentage: 12.4,
        lastUpdateTime: '2023-04-15T15:30:00Z',
        topJobs: [
          { id: '1', name: 'NFT Prices Tracker', dataType: 'nft_prices', recordsProcessed: 2450983, status: 'active' },
          { id: '2', name: 'Token Holders Analysis', dataType: 'token_holders', recordsProcessed: 156729, status: 'paused' },
          { id: '3', name: 'DEX Transactions', dataType: 'transactions', recordsProcessed: 5672391, status: 'failed' },
          { id: '4', name: 'Program Accounts Sync', dataType: 'program_accounts', recordsProcessed: 645538, status: 'active' },
        ],
        dataTypeDistribution: [
          { type: 'NFT Prices', count: 2450983, percentage: 27.5 },
          { type: 'Token Holders', count: 156729, percentage: 1.8 },
          { type: 'Transactions', count: 5672391, percentage: 63.6 },
          { type: 'Program Accounts', count: 645538, percentage: 7.1 },
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'paused': return 'yellow';
      case 'failed': return 'red';
      case 'completed': return 'blue';
      default: return 'gray';
    }
  };

  // No data or jobs available
  if (!loading && (!data || data.totalJobs === 0)) {
    return (
      <DashboardShell>
        <Container size="lg" py={40}>
          <Title order={2} mb={10}>Analytics Dashboard</Title>
          <Text c="dimmed" size="sm" mb={30}>
            Overview of your blockchain data indexing operations
          </Text>
          
          <Paper withBorder p="xl" radius="md">
            <Center py={80}>
              <Box ta="center" maw={600}>
                <IconChartLine size={80} color="gray" style={{ opacity: 0.3 }} />
                <Title order={2} mt="md">No Analytics Data Available</Title>
                <Text c="dimmed" size="md" mt="md" mb="xl">
                  To see analytics data, you need to create at least one indexing job and start collecting data. 
                  Analytics will show data processing metrics and visualizations once your jobs are running.
                </Text>
                <Group justify="center" gap="md">
                  <Button
                    leftSection={<IconDatabase size={16} />}
                    onClick={() => navigate('/database-configs')}
                    variant="outline"
                    size="md"
                  >
                    Set Up Database
                  </Button>
                  <Button
                    leftSection={<IconPlus size={16} />}
                    onClick={() => navigate('/indexing-jobs/create')}
                    size="md"
                  >
                    Create Indexing Job
                  </Button>
                </Group>
              </Box>
            </Center>
          </Paper>
        </Container>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <Container size="lg" py={40}>
        <Title order={2} mb={10}>Analytics Dashboard</Title>
        <Text c="dimmed" size="sm" mb={30}>
          Overview of your blockchain data indexing operations
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

        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md" mb="md">
          <Card withBorder p="md" radius="md">
            <Group>
              <ThemeIcon size={40} radius="md" color="blue">
                <IconActivity size={24} />
              </ThemeIcon>
              <div>
                <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                  Active Jobs
                </Text>
                <Text fw={700} size="xl">
                  {loading ? <Skeleton height={28} width={40} /> : data?.activeJobs} / {loading ? <Skeleton height={28} width={40} /> : data?.totalJobs}
                </Text>
              </div>
            </Group>
          </Card>

          <Card withBorder p="md" radius="md">
            <Group>
              <ThemeIcon size={40} radius="md" color="teal">
                <IconDatabaseImport size={24} />
              </ThemeIcon>
              <div>
                <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                  Records Processed
                </Text>
                <Text fw={700} size="xl">
                  {loading ? <Skeleton height={28} width={100} /> : formatNumber(data?.totalRecordsProcessed || 0)}
                </Text>
              </div>
            </Group>
          </Card>

          <Card withBorder p="md" radius="md">
            <Group>
              <ThemeIcon size={40} radius="md" color="violet">
                <IconDatabase size={24} />
              </ThemeIcon>
              <div>
                <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                  Database Connections
                </Text>
                <Text fw={700} size="xl">
                  {loading ? <Skeleton height={28} width={40} /> : data?.totalDatabases}
                </Text>
              </div>
            </Group>
          </Card>

          <Card withBorder p="md" radius="md">
            <Group>
              <ThemeIcon size={40} radius="md" color={data?.recordsChangePercentage && data.recordsChangePercentage > 0 ? "green" : "red"}>
                {data?.recordsChangePercentage && data.recordsChangePercentage > 0 
                  ? <IconArrowUpRight size={24} /> 
                  : <IconArrowDownRight size={24} />}
              </ThemeIcon>
              <div>
                <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                  Records Today
                </Text>
                <Group gap={5}>
                  <Text fw={700} size="xl">
                    {loading ? <Skeleton height={28} width={100} /> : formatNumber(data?.recordsProcessedToday || 0)}
                  </Text>
                  {data?.recordsChangePercentage && (
                    <Text size="sm" c={data.recordsChangePercentage > 0 ? "green" : "red"}>
                      {data.recordsChangePercentage > 0 ? '+' : ''}{data.recordsChangePercentage}%
                    </Text>
                  )}
                </Group>
              </div>
            </Group>
          </Card>
        </SimpleGrid>

        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Tabs defaultValue="top-jobs">
              <Tabs.List mb="md">
                <Tabs.Tab value="top-jobs">Top Indexing Jobs</Tabs.Tab>
                <Tabs.Tab value="recent-activity">Recent Activity</Tabs.Tab>
              </Tabs.List>
              
              <Tabs.Panel value="top-jobs">
                <Paper withBorder p="md" radius="md">
                  {loading ? (
                    <Skeleton height={320} />
                  ) : (
                    <Table>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Job Name</Table.Th>
                          <Table.Th>Data Type</Table.Th>
                          <Table.Th>Records Processed</Table.Th>
                          <Table.Th>Status</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {data?.topJobs.map((job) => (
                          <Table.Tr key={job.id}>
                            <Table.Td>
                              <Text fw={500}>{job.name}</Text>
                            </Table.Td>
                            <Table.Td>{job.dataType.replace('_', ' ')}</Table.Td>
                            <Table.Td>{formatNumber(job.recordsProcessed)}</Table.Td>
                            <Table.Td>
                              <Badge color={getStatusColor(job.status)}>
                                {job.status}
                              </Badge>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  )}
                </Paper>
              </Tabs.Panel>
              
              <Tabs.Panel value="recent-activity">
                <Paper withBorder p="md" radius="md">
                  {loading ? (
                    <Skeleton height={320} />
                  ) : (
                    <List spacing="md">
                      <List.Item
                        icon={
                          <ThemeIcon color="green" size={24} radius="xl">
                            <IconCheck size={16} />
                          </ThemeIcon>
                        }
                      >
                        <Text fw={500}>NFT Prices Tracker completed a sync</Text>
                        <Text size="sm" c="dimmed">15 minutes ago • 24,891 records processed</Text>
                      </List.Item>
                      
                      <List.Item
                        icon={
                          <ThemeIcon color="red" size={24} radius="xl">
                            <IconAlertCircle size={16} />
                          </ThemeIcon>
                        }
                      >
                        <Text fw={500}>DEX Transactions failed to sync</Text>
                        <Text size="sm" c="dimmed">2 hours ago • Database connection timeout</Text>
                      </List.Item>
                      
                      <List.Item
                        icon={
                          <ThemeIcon color="blue" size={24} radius="xl">
                            <IconDatabase size={16} />
                          </ThemeIcon>
                        }
                      >
                        <Text fw={500}>New database configuration added</Text>
                        <Text size="sm" c="dimmed">Yesterday at 2:45 PM • Production Database</Text>
                      </List.Item>
                      
                      <List.Item
                        icon={
                          <ThemeIcon color="green" size={24} radius="xl">
                            <IconClock size={16} />
                          </ThemeIcon>
                        }
                      >
                        <Text fw={500}>Token Holders Analysis scheduled</Text>
                        <Text size="sm" c="dimmed">Yesterday at 10:30 AM • Daily frequency</Text>
                      </List.Item>
                    </List>
                  )}
                </Paper>
              </Tabs.Panel>
            </Tabs>
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper withBorder p="md" radius="md" h="100%">
              <Title order={5} mb="md">Data Type Distribution</Title>
              
              {loading ? (
                <Skeleton height={280} circle />
              ) : (
                <>
                  <Box ta="center" mb="md">
                    <RingProgress
                      size={180}
                      thickness={16}
                      sections={data?.dataTypeDistribution.map(item => ({
                        value: item.percentage,
                        color: item.type.includes('NFT') ? 'violet' : 
                              item.type.includes('Token') ? 'blue' : 
                              item.type.includes('Transaction') ? 'teal' : 'orange'
                      })) || []}
                      label={
                        <div>
                          <Text fw={700} size="xl" ta="center">{formatNumber(data?.totalRecordsProcessed || 0)}</Text>
                          <Text size="xs" c="dimmed" ta="center">Total Records</Text>
                        </div>
                      }
                    />
                  </Box>
                  
                  <List spacing="xs" size="sm">
                    {data?.dataTypeDistribution.map((item, index) => (
                      <List.Item
                        key={index}
                        icon={
                          <ThemeIcon 
                            size={20} 
                            radius="xl"
                            color={item.type.includes('NFT') ? 'violet' : 
                                  item.type.includes('Token') ? 'blue' : 
                                  item.type.includes('Transaction') ? 'teal' : 'orange'}
                          >
                            {item.type.includes('NFT') ? <IconBoxMultiple size={12} /> :
                             item.type.includes('Token') ? <IconCoin size={12} /> :
                             item.type.includes('Transaction') ? <IconActivity size={12} /> :
                             <IconServer size={12} />}
                          </ThemeIcon>
                        }
                      >
                        <Group justify="space-between">
                          <Text size="sm">{item.type}</Text>
                          <Text size="sm" fw={500}>{item.percentage}%</Text>
                        </Group>
                      </List.Item>
                    ))}
                  </List>
                </>
              )}
              
              {data?.lastUpdateTime && (
                <Text size="xs" c="dimmed" ta="center" mt="md">
                  Last updated: {formatDate(data.lastUpdateTime)}
                </Text>
              )}
            </Paper>
          </Grid.Col>
        </Grid>
      </Container>
    </DashboardShell>
  );
} 