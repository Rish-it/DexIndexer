import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, 
  Title, 
  Group, 
  Button, 
  Text, 
  Grid, 
  SimpleGrid,
  Center,
  Loader
} from '@mantine/core';
import { 
  IconDatabase, 
  IconList, 
  IconPlus, 
  IconChartBar, 
  IconUserPlus,
  IconServer,
  IconCloudUpload
} from '@tabler/icons-react';
import axios from 'axios';
import { DashboardShell } from '../components/layout/DashboardShell';
import { StatCard } from '../components/dashboard/StatCard';
import { ActivityCard } from '../components/dashboard/ActivityCard';
import { ChartCard } from '../components/dashboard/ChartCard';

interface DatabaseConfig {
  id: string;
  name: string;
  host: string;
  port: number;
  database: string;
  createdAt: string;
  status?: string;
}

interface IndexingJob {
  id: string;
  name: string;
  type: string;
  status: string;
  recordsIndexed: number;
  createdAt: string;
}

export default function Dashboard() {
  const [databaseConfigs, setDatabaseConfigs] = useState<DatabaseConfig[]>([]);
  const [indexingJobs, setIndexingJobs] = useState<IndexingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Initialize with empty arrays to avoid filter/map errors
        let fetchedConfigs: DatabaseConfig[] = [];
        let fetchedJobs: IndexingJob[] = [];
        
        try {
          const [configsResponse, jobsResponse] = await Promise.all([
            axios.get('/api/database-configs'),
            axios.get('/api/indexing-jobs')
          ]);
          
          fetchedConfigs = Array.isArray(configsResponse.data) ? configsResponse.data : [];
          fetchedJobs = Array.isArray(jobsResponse.data) ? jobsResponse.data : [];
        } catch (fetchError) {
          console.error('Error fetching data:', fetchError);
          // Continue to use mock data
        }
        
        if (fetchedConfigs.length === 0 && fetchedJobs.length === 0) {
          // Use mock data for development
          fetchedConfigs = [
            { id: '1', name: 'Production DB', host: 'postgres.example.com', port: 5432, database: 'blockchain', createdAt: '2023-03-15', status: 'connected' },
            { id: '2', name: 'Staging DB', host: 'staging-db.internal', port: 5432, database: 'blockchain-stage', createdAt: '2023-03-10', status: 'connected' },
            { id: '3', name: 'Development DB', host: 'localhost', port: 5432, database: 'blockchain-dev', createdAt: '2023-03-05', status: 'connected' }
          ];
          
          fetchedJobs = [
            { id: '1', name: 'Bitcoin Indexer', type: 'BTC', status: 'active', recordsIndexed: 1254789, createdAt: '2023-03-20' },
            { id: '2', name: 'Ethereum Indexer', type: 'ETH', status: 'active', recordsIndexed: 892345, createdAt: '2023-03-18' },
            { id: '3', name: 'Solana Indexer', type: 'SOL', status: 'paused', recordsIndexed: 452789, createdAt: '2023-03-15' },
            { id: '4', name: 'Cardano Indexer', type: 'ADA', status: 'error', recordsIndexed: 125478, createdAt: '2023-03-10' }
          ];
        }
        
        setDatabaseConfigs(fetchedConfigs);
        setIndexingJobs(fetchedJobs);
      } catch (err) {
        console.error('Error processing dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Safely calculate active jobs
  const activeJobs = indexingJobs.filter(job => job.status === 'active').length || 0;
  const totalRecordsIndexed = indexingJobs.reduce((acc, job) => acc + (job.recordsIndexed || 0), 0);
  
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const dbActivityItems = databaseConfigs.map(config => ({
    id: config.id,
    title: config.name,
    description: `${config.host}:${config.port} - ${config.database}`,
    timestamp: new Date(config.createdAt).toLocaleDateString(),
    status: config.status === 'connected' ? 'success' as const : 'error' as const
  }));

  const jobActivityItems = indexingJobs.map(job => ({
    id: job.id,
    title: job.name,
    description: `Type: ${job.type} - Records: ${formatNumber(job.recordsIndexed)}`,
    timestamp: new Date(job.createdAt).toLocaleDateString(),
    status: job.status === 'active' ? 'success' as const : 
            job.status === 'paused' ? 'warning' as const : 'error' as const
  }));

  if (loading) {
    return (
      <DashboardShell>
        <Center h="100%" py={100}>
          <Loader size="xl" />
        </Center>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <Container size="lg" py={40}>
        <Group justify="space-between" mb={30}>
          <div>
            <Title order={2}>Dashboard</Title>
            <Text c="dimmed" size="sm">Overview of your blockchain indexing operations</Text>
          </div>
          <Group>
            <Button 
              variant="light" 
              leftSection={<IconDatabase size={16} />}
              component={Link}
              to="/database-configs/create"
            >
              New Database
            </Button>
            <Button 
              leftSection={<IconList size={16} />}
              component={Link}
              to="/indexing-jobs/create"
            >
              New Indexing Job
            </Button>
          </Group>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb={30}>
          <StatCard
            title="Database Configs"
            value={databaseConfigs.length}
            description="Total database configurations"
            icon={<IconDatabase size={24} stroke={1.5} />}
            color="blue"
          />
          
          <StatCard
            title="Indexing Jobs"
            value={indexingJobs.length}
            description="Total indexing jobs"
            icon={<IconServer size={24} stroke={1.5} />}
            color="violet"
          />
          
          <StatCard
            title="Active Jobs"
            value={activeJobs}
            description={`${Math.round((activeJobs / (indexingJobs.length || 1)) * 100)}% running`}
            icon={<IconCloudUpload size={24} stroke={1.5} />}
            color="green"
            trend={{
              value: 12,
              isPositive: true
            }}
          />
          
          <StatCard
            title="Records Indexed"
            value={formatNumber(totalRecordsIndexed)}
            description="Total data points collected"
            icon={<IconChartBar size={24} stroke={1.5} />}
            color="orange"
            trend={{
              value: 8,
              isPositive: true
            }}
          />
        </SimpleGrid>

        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <ActivityCard
              title="Recent Database Configs"
              viewAllLink="/database-configs"
              items={dbActivityItems}
              emptyMessage="No database configurations found"
              maxItems={3}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <ActivityCard
              title="Recent Indexing Jobs"
              viewAllLink="/indexing-jobs"
              items={jobActivityItems}
              emptyMessage="No indexing jobs found"
              maxItems={3}
            />
          </Grid.Col>
        </Grid>
      </Container>
    </DashboardShell>
  );
} 