import React from 'react';
import { Card, Text, Group, useMantineTheme, Select, rem } from '@mantine/core';

interface ChartCardProps {
  title: string;
  chart: React.ReactNode;
  description?: string;
  filters?: {
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string | null) => void;
  };
}

export function ChartCard({ title, chart, description, filters }: ChartCardProps) {
  const theme = useMantineTheme();

  return (
    <Card withBorder p="lg" radius="md">
      <Group justify="space-between" mb="md">
        <Text fw={700} size="md">{title}</Text>
        
        {filters && (
          <Select
            size="xs"
            value={filters.value}
            onChange={filters.onChange}
            data={filters.options}
            style={{ width: rem(130) }}
          />
        )}
      </Group>

      {description && (
        <Text size="xs" c="dimmed" mb="md">
          {description}
        </Text>
      )}

      <div style={{ height: rem(250) }}>
        {chart}
      </div>
    </Card>
  );
} 