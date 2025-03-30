import React from 'react';
import { 
  Box, 
  Container, 
  Text, 
  Flex, 
  Group,
  useMantineTheme,
  Paper,
  Title
} from '@mantine/core';
import { IconRocket } from '@tabler/icons-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function AuthLayout({ children, title }: AuthLayoutProps) {
  const theme = useMantineTheme();
  
  const quotes = [
    "Blockchain is not just a technology, it's a movement.",
    "Index the blockchain, unlock the future.",
    "Data is the oil of the digital economy. Refine it with our tools.",
    "Turn blockchain chaos into actionable insights.",
    "Extract, transform, and load your on-chain data with precision."
  ];
  
  // Pick a random quote
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <Box
      style={{ 
        minHeight: '100vh',
        background: theme.colors.gray[0],
        position: 'relative'
      }}
    >
      {/* Header with logo */}
      <Box 
        p="md" 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 10
        }}
      >
        <Group>
          <IconRocket size={24} />
          <Text size="lg" fw={700}>Blockchain Indexer</Text>
        </Group>
      </Box>
      
      {/* Main content */}
      <Flex 
        direction="column" 
        justify="center" 
        align="center" 
        style={{ 
          minHeight: '100vh', 
          padding: '20px'
        }}
      >
        <Paper 
          radius="md" 
          shadow="xl" 
          p={30}
          withBorder
          style={{
            width: '100%',
            maxWidth: 450,
            marginBottom: 20
          }}
        >
          <Title order={2} ta="center" mb="xl">{title}</Title>
          {children}
        </Paper>
        
        {/* Quote */}
        <Container size="sm">
          <Text 
            ta="center" 
            c="dimmed" 
            size="sm" 
            fs="italic" 
            mt="md"
            style={{ maxWidth: 600, margin: '0 auto' }}
          >
            "{randomQuote}"
          </Text>
        </Container>
      </Flex>
    </Box>
  );
} 