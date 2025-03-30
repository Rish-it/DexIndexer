import React from 'react';
import { Card, Group, Text, ThemeIcon } from '@mantine/core';
import { IconArrowUpRight, IconArrowDownRight } from '@tabler/icons-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

export function StatCard({ title, value, description, icon, trend, color = 'blue' }: StatCardProps) {
  return (
    <Card withBorder p="lg" radius="md">
      <Group justify="space-between" mb="xs">
        <Text size="sm" fw={500}>
          {title}
        </Text>
        {icon && (
          <ThemeIcon 
            size="lg" 
            radius="md" 
            variant="filled" 
            color={color}
          >
            {icon}
          </ThemeIcon>
        )}
      </Group>

      <Text size="xl" fw={700} mt="sm">
        {value}
      </Text>
      
      {description && (
        <Text size="sm" c="dimmed" mt="sm">
          {description}
        </Text>
      )}
      
      {trend && (
        <Group mt="md" gap="xs">
          <ThemeIcon 
            color={trend.isPositive ? 'teal' : 'red'} 
            variant="light" 
            size="sm" 
            radius="sm"
          >
            {trend.isPositive ? <IconArrowUpRight size={16} /> : <IconArrowDownRight size={16} />}
          </ThemeIcon>
          <Text 
            c={trend.isPositive ? 'teal' : 'red'} 
            fw={500} 
            size="sm"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            {trend.isPositive ? '+' : ''} {Math.abs(trend.value)}%
          </Text>
          <Text size="xs" c="dimmed">compared to previous period</Text>
        </Group>
      )}
    </Card>
  );
} 