import React from 'react';
import { Card, Text, Group, ThemeIcon, useMantineTheme, rem } from '@mantine/core';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

export function StatCard({ title, value, description, icon, trend, color }: StatCardProps) {
  const theme = useMantineTheme();
  const defaultColor = theme.primaryColor;
  const cardColor = color || defaultColor;

  return (
    <Card withBorder p="lg" radius="md">
      <Group justify="space-between" mb={5}>
        <Text size="sm" fw={700} c="dimmed">
          {title}
        </Text>
        <ThemeIcon 
          size="lg" 
          variant="light"
          color={cardColor}
          style={{ backgroundColor: `rgba(${theme.colors[cardColor][6]}, 0.1)` }}
        >
          {icon}
        </ThemeIcon>
      </Group>

      <Text fw={700} size="xl">
        {value}
      </Text>

      {description && (
        <Text size="xs" c="dimmed" mt={4}>
          {description}
        </Text>
      )}

      {trend && (
        <Group mt="md" gap="xs">
          <Text 
            c={trend.isPositive ? 'teal' : 'red'} 
            fw={500}
            size="sm"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </Text>
          <Text size="xs" c="dimmed">compared to previous period</Text>
        </Group>
      )}
    </Card>
  );
} 