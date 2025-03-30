import React from 'react';
import { Card, Text, Group, Avatar, Stack, Badge, Divider, Button } from '@mantine/core';
import { Link } from 'react-router-dom';

interface ActivityItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  status?: 'success' | 'error' | 'pending' | 'warning';
  icon?: React.ReactNode;
}

interface ActivityCardProps {
  title: string;
  viewAllLink?: string;
  items: ActivityItem[];
  emptyMessage?: string;
  maxItems?: number;
}

export function ActivityCard({ 
  title, 
  viewAllLink, 
  items, 
  emptyMessage = 'No activity found',
  maxItems = 5 
}: ActivityCardProps) {
  const displayedItems = items.slice(0, maxItems);
  
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success': return 'green';
      case 'error': return 'red';
      case 'warning': return 'yellow';
      case 'pending': return 'blue';
      default: return 'gray';
    }
  };
  
  return (
    <Card withBorder p="lg" radius="md">
      <Group justify="space-between" mb="md">
        <Text fw={700} size="md">{title}</Text>
        {viewAllLink && (
          <Button
            variant="subtle"
            size="xs"
            component={Link}
            to={viewAllLink}
          >
            View all
          </Button>
        )}
      </Group>

      {displayedItems.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl" size="sm">
          {emptyMessage}
        </Text>
      ) : (
        <Stack gap="sm">
          {displayedItems.map((item, index) => (
            <React.Fragment key={item.id}>
              <Group>
                {item.icon ? (
                  <div>{item.icon}</div>
                ) : (
                  <Avatar size="md" radius="md" color="blue">
                    {item.title.charAt(0)}
                  </Avatar>
                )}
                
                <div style={{ flex: 1 }}>
                  <Group justify="space-between">
                    <Text size="sm" fw={500}>{item.title}</Text>
                    {item.status && (
                      <Badge color={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    )}
                  </Group>
                  
                  {item.description && (
                    <Text size="xs" c="dimmed">
                      {item.description}
                    </Text>
                  )}
                  
                  <Text size="xs" c="dimmed" mt={4}>
                    {item.timestamp}
                  </Text>
                </div>
              </Group>
              
              {index < displayedItems.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </Stack>
      )}
    </Card>
  );
} 