import React from 'react';
import { 
  Box, 
  Container,
  Text, 
  Flex,
  Group,
  useMantineTheme,
  Paper,
  Title,
  Center
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
    <Flex
      direction="column"
      style={{ 
        minHeight: '100vh',
        width: '100%',
        background: `linear-gradient(45deg, ${theme.colors.blue[6]} 0%, ${theme.colors.indigo[9]} 100%)`,
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
          <IconRocket size={24} color="white" />
          <Text size="lg" fw={700} c="white">DexIndexer</Text>
        </Group>
      </Box>
      
      {/* Main content */}
      <Flex
        align="center"
        justify="center"
        style={{ 
          width: '100%', 
          flex: 1,
          minHeight: '100vh'
        }}
      >
        <Container size="xs" py="xl">
          <Paper 
            radius="md" 
            shadow="xl" 
            p={35}
            withBorder
            style={{
              width: '100%',
              backgroundColor: theme.white,
              marginBottom: 20
            }}
          >
            <Title order={2} ta="center" mb="xl">{title}</Title>
            {children}
          </Paper>
          
          {/* Quote */}
          <Text 
            ta="center" 
            c="white" 
            size="sm" 
            fs="italic" 
            mt="md"
            style={{ maxWidth: 600, margin: '0 auto' }}
          >
            "{randomQuote}"
          </Text>
        </Container>
      </Flex>
    </Flex>
  );
} 