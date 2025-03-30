import { useState } from 'react';
import {
  Container,
  Title,
  Text,
  Paper,
  Switch,
  Divider,
  Stack,
  Group,
  ActionIcon,
  useMantineColorScheme,
  Card,
  SimpleGrid,
  Box,
  Anchor,
  Accordion,
} from '@mantine/core';
import {
  IconSun,
  IconMoon,
  IconBrandGithub,
  IconExternalLink,
  IconFileInfo,
  IconRocket,
  IconBooks,
  IconCode,
  IconDeviceDesktop,
  IconDatabase,
  IconBrandTwitter,
  IconBrandDiscord,
} from '@tabler/icons-react';
import { DashboardShell } from '../components/layout/DashboardShell';

export default function Settings() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const [notification, setNotification] = useState({
    emailNotifications: true,
    jobAlerts: true,
    dailyReports: false,
  });

  const handleThemeChange = () => {
    const newColorScheme = colorScheme === 'dark' ? 'light' : 'dark';
    setColorScheme(newColorScheme);
  };

  const handleNotificationChange = (key: keyof typeof notification) => {
    setNotification({
      ...notification,
      [key]: !notification[key],
    });
  };

  return (
    <DashboardShell>
      <Container size="lg" py={40}>
        <Title order={2} mb={10}>Settings</Title>
        <Text c="dimmed" size="sm" mb={30}>
          Customize your experience and find helpful resources
        </Text>

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mb="xl">
          <Paper withBorder p="md" radius="md">
            <Stack>
              <Title order={4}>Appearance</Title>
              <Divider />
              
              <Group justify="space-between">
                <div>
                  <Text>Dark Mode</Text>
                  <Text size="xs" c="dimmed">
                    Toggle between light and dark theme
                  </Text>
                </div>
                <Group>
                  <ActionIcon 
                    variant="transparent" 
                    color={colorScheme === 'light' ? 'yellow' : 'gray'}
                    onClick={() => setColorScheme('light')}
                  >
                    <IconSun size={20} />
                  </ActionIcon>
                  <Switch
                    checked={colorScheme === 'dark'}
                    onChange={handleThemeChange}
                    size="md"
                  />
                  <ActionIcon 
                    variant="transparent" 
                    color={colorScheme === 'dark' ? 'blue' : 'gray'}
                    onClick={() => setColorScheme('dark')}
                  >
                    <IconMoon size={18} />
                  </ActionIcon>
                </Group>
              </Group>
            </Stack>
          </Paper>

          <Paper withBorder p="md" radius="md">
            <Stack>
              <Title order={4}>Notifications</Title>
              <Divider />
              
              <Group justify="space-between">
                <div>
                  <Text>Email Notifications</Text>
                  <Text size="xs" c="dimmed">
                    Receive important updates via email
                  </Text>
                </div>
                <Switch
                  checked={notification.emailNotifications}
                  onChange={() => handleNotificationChange('emailNotifications')}
                />
              </Group>
              
              <Group justify="space-between">
                <div>
                  <Text>Job Alerts</Text>
                  <Text size="xs" c="dimmed">
                    Get notified when indexing jobs fail or complete
                  </Text>
                </div>
                <Switch
                  checked={notification.jobAlerts}
                  onChange={() => handleNotificationChange('jobAlerts')}
                />
              </Group>
              
              <Group justify="space-between">
                <div>
                  <Text>Daily Reports</Text>
                  <Text size="xs" c="dimmed">
                    Receive daily summary of indexing operations
                  </Text>
                </div>
                <Switch
                  checked={notification.dailyReports}
                  onChange={() => handleNotificationChange('dailyReports')}
                />
              </Group>
            </Stack>
          </Paper>
        </SimpleGrid>

        <Title order={4} mb="md">Documentation & Resources</Title>
        
        <Paper withBorder p="md" radius="md" mb="xl">
          <Accordion variant="separated">
            <Accordion.Item value="getting-started">
              <Accordion.Control icon={<IconRocket size={18} />}>
                Getting Started
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="xs">
                  <Group>
                    <IconFileInfo size={18} />
                    <Anchor href="https://docs.helius.xyz/introduction/what-is-helius" target="_blank">
                      Introduction to Blockchain Indexing
                    </Anchor>
                  </Group>
                  <Group>
                    <IconDatabase size={18} />
                    <Anchor href="https://docs.helius.xyz/api-reference/rpc-endpoints" target="_blank">
                      Setting Up Your First Database
                    </Anchor>
                  </Group>
                  <Group>
                    <IconRocket size={18} />
                    <Anchor href="https://docs.helius.xyz/api-reference/webhooks" target="_blank">
                      Creating Your First Indexing Job
                    </Anchor>
                  </Group>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="api-references">
              <Accordion.Control icon={<IconCode size={18} />}>
                API References & SDKs
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="xs">
                  <Group>
                    <IconCode size={18} />
                    <Anchor href="https://docs.helius.xyz/api-reference/enhanced-transactions-api" target="_blank">
                      REST API Documentation
                    </Anchor>
                  </Group>
                  <Group>
                    <IconBrandGithub size={18} />
                    <Anchor href="https://github.com/helius-labs/helius-sdk" target="_blank">
                      JavaScript SDK
                    </Anchor>
                  </Group>
                  <Group>
                    <IconBrandGithub size={18} />
                    <Anchor href="https://github.com/helius-labs/helius-rpc-proxy" target="_blank">
                      Python SDK
                    </Anchor>
                  </Group>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="tutorials">
              <Accordion.Control icon={<IconBooks size={18} />}>
                Tutorials & Guides
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="xs">
                  <Group>
                    <IconDeviceDesktop size={18} />
                    <Anchor href="https://docs.helius.xyz/use-cases/building-a-wallet" target="_blank">
                      Building a Blockchain Explorer
                    </Anchor>
                  </Group>
                  <Group>
                    <IconDatabase size={18} />
                    <Anchor href="https://docs.helius.xyz/use-cases/nft-projects" target="_blank">
                      NFT Collection Analytics
                    </Anchor>
                  </Group>
                  <Group>
                    <IconCode size={18} />
                    <Anchor href="https://docs.helius.xyz/use-cases/defi-analytics" target="_blank">
                      DeFi Market Dashboards
                    </Anchor>
                  </Group>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Paper>
        
        <Title order={4} mb="md">External Resources</Title>
        
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          <Card withBorder p="md" radius="md">
            <Group mb="md">
              <Box style={{ width: 40, height: 40, borderRadius: '50%', background: '#9945FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text c="white" fw={700}>H</Text>
              </Box>
              <div>
                <Text fw={700}>Helius Platform</Text>
                <Text size="xs" c="dimmed">Official documentation</Text>
              </div>
            </Group>
            <Text size="sm" mb="md">
              Comprehensive guides, API references, and resources for the Helius blockchain data platform.
            </Text>
            <Anchor href="https://docs.helius.xyz/" target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              Visit Documentation
              <IconExternalLink size={14} />
            </Anchor>
          </Card>
          
          <Card withBorder p="md" radius="md">
            <Group mb="md">
              <Box style={{ width: 40, height: 40, borderRadius: '50%', background: '#14F195', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text c="dark" fw={700}>S</Text>
              </Box>
              <div>
                <Text fw={700}>Solana Documentation</Text>
                <Text size="xs" c="dimmed">Developer resources</Text>
              </div>
            </Group>
            <Text size="sm" mb="md">
              Official documentation for Solana blockchain technology, concepts, and development.
            </Text>
            <Anchor href="https://docs.solana.com/" target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              Visit Documentation
              <IconExternalLink size={14} />
            </Anchor>
          </Card>
          
          <Card withBorder p="md" radius="md">
            <Group mb="md">
              <Box style={{ width: 40, height: 40, borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconBrandGithub size={24} color="white" />
              </Box>
              <div>
                <Text fw={700}>GitHub Repository</Text>
                <Text size="xs" c="dimmed">Open source code</Text>
              </div>
            </Group>
            <Text size="sm" mb="md">
              Access open-source examples, tools, and SDKs for blockchain data indexing.
            </Text>
            <Anchor href="https://github.com/helius-labs" target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              Visit Repository
              <IconExternalLink size={14} />
            </Anchor>
          </Card>
        </SimpleGrid>
        
        <Group justify="space-between" mt="xl">
          <Text size="xs" c="dimmed">© 2023 Blockchain Indexer Platform</Text>
          <Group gap="xs">
            <ActionIcon variant="subtle" color="gray">
              <IconBrandTwitter size={18} />
            </ActionIcon>
            <ActionIcon variant="subtle" color="gray">
              <IconBrandDiscord size={18} />
            </ActionIcon>
            <ActionIcon variant="subtle" color="gray">
              <IconBrandGithub size={18} />
            </ActionIcon>
          </Group>
        </Group>
      </Container>
    </DashboardShell>
  );
} 