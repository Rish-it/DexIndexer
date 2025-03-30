import React from 'react';
import { Card, Text, Group, Select } from '@mantine/core';

interface ChartCardProps {
  title: string;
  chart: React.ReactNode;
  description?: string;
  filters?: {
    options: { value: string; label: string }[];
    defaultValue: string;
    onChange: (value: string | null) => void;
  };
}

export function ChartCard({ title, chart, description, filters }: ChartCardProps) {
  return (
    <Card shadow="sm" p="md" radius="md" withBorder>
      <Group justify="space-between" mb="md">
        <Text fw={700} size="md">{title}</Text>
        
        {filters && (
          <Select
            size="xs"
            data={filters.options}
            defaultValue={filters.defaultValue}
            onChange={filters.onChange}
            w={120}
          />
        )}
      </Group>
      
      <div>{chart}</div>
      
      {description && (
        <Text c="dimmed" size="xs" mt="md">
          {description}
        </Text>
      )}
    </Card>
  );
} 