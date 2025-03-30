import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader, Center } from '@mantine/core';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DatabaseConfigs from './pages/DatabaseConfigs';
import IndexingJobs from './pages/IndexingJobs';
import CreateIndexingJob from './pages/CreateIndexingJob';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import DatabaseConfigCreate from './pages/DatabaseConfigCreate';

// Context & Services
import { AuthProvider, useAuth } from './contexts/AuthContext';

// ProtectedRoute component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <Center h="100vh">
        <Loader size="xl" />
      </Center>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
}

// PublicRoute component for login/register pages
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <Center h="100vh">
        <Loader size="xl" />
      </Center>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        
        <Route path="/indexing-jobs" element={<ProtectedRoute><IndexingJobs /></ProtectedRoute>} />
        <Route path="/indexing-jobs/create" element={<ProtectedRoute><CreateIndexingJob /></ProtectedRoute>} />
        
        <Route path="/database-configs" element={<ProtectedRoute><DatabaseConfigs /></ProtectedRoute>} />
        <Route path="/database-configs/create" element={<ProtectedRoute><DatabaseConfigCreate /></ProtectedRoute>} />
        
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
