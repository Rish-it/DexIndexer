import { useDisclosure } from '@mantine/hooks';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AppShell,
  Burger,
  Group,
  NavLink, 
  Text, 
  UnstyledButton,
  Avatar,
  Menu,
  Divider,
  ScrollArea,
} from '@mantine/core';
import { 
  IconDatabase, 
  IconLogout,
  IconUser,
  IconSettings,
  IconChevronDown,
  IconDashboard,
  IconRocket,
  IconChartBar
} from '@tabler/icons-react';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [opened, { toggle }] = useDisclosure();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const mainLinks = [
    { link: '/dashboard', label: 'Dashboard', icon: IconDashboard },
    { link: '/indexing-jobs', label: 'Indexing Jobs', icon: IconRocket },
    { link: '/database-configs', label: 'Database Configs', icon: IconDatabase },
    { link: '/analytics', label: 'Analytics', icon: IconChartBar },
    { link: '/settings', label: 'Settings', icon: IconSettings },
  ];

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ 
        width: 280, 
        breakpoint: 'sm', 
        collapsed: { mobile: !opened } 
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Text size="lg" fw={700}>Blockchain Indexer</Text>
          </Group>
        
          <Menu
            width={200}
            position="bottom-end"
            shadow="md"
          >
            <Menu.Target>
              <UnstyledButton
                style={{ borderRadius: 8, padding: '4px 8px' }} 
                className="user-menu-button"
              >
                <Group gap={7}>
                  <Avatar 
                    color="violet" 
                    radius="xl"
                    size="sm"
                  >
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                  <div style={{ flex: 1 }}>
                    <Text size="sm" fw={500}>
                      {user?.email?.split('@')[0] || 'User'}
                    </Text>
                  </div>
                  <IconChevronDown size={14} stroke={1.5} />
                </Group>
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconUser size={14} />} component={Link} to="/profile">
                Profile
              </Menu.Item>
              <Menu.Item leftSection={<IconSettings size={14} />} component={Link} to="/settings">
                Settings
              </Menu.Item>
              <Divider />
              <Menu.Item 
                color="red" 
                leftSection={<IconLogout size={14} />}
                onClick={handleLogout}
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <ScrollArea>
          <Group justify="space-between" mb="md">
            <Text size="xs" fw={500} c="dimmed">MAIN MENU</Text>
          </Group>

          {mainLinks.map((item) => (
            <NavLink
              key={item.link}
              component={Link}
              to={item.link}
              label={item.label}
              leftSection={<item.icon size={16} stroke={1.5} />}
              active={location.pathname === item.link}
              variant="light"
              mb={5}
            />
          ))}

          <Text size="xs" fw={500} c="dimmed" mt="xl" mb="md">SETTINGS</Text>
          
          <NavLink
            component={Link}
            to="/profile"
            label="Profile"
            leftSection={<IconUser size={16} stroke={1.5} />}
            variant="light"
            mb={5}
          />
          
          <NavLink
            component={Link}
            to="/settings"
            label="Settings"
            leftSection={<IconSettings size={16} stroke={1.5} />}
            variant="light"
            mb={5}
          />
          
          <Divider my="sm" />
          
          <NavLink
            label="Logout"
            leftSection={<IconLogout size={16} stroke={1.5} />}
            variant="subtle"
            color="red"
            onClick={handleLogout}
            mb={5}
          />
        </ScrollArea>
      </AppShell.Navbar>

      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  );
} 