import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import PublicAnalytics from './pages/PublicAnalytics';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import NotFound from './pages/NotFound';

// Dashboard Pages
import Overview from './pages/dashboard/Overview';
import UrlManagement from './pages/dashboard/UrlManagement';
import Analytics from './pages/dashboard/Analytics';
import Developer from './pages/dashboard/Developer';
import Settings from './pages/dashboard/Settings';

// Admin Pages
import AdminOverview from './pages/admin/AdminOverview';
import UserManager from './pages/admin/UserManager';

import { useAuthStore } from './store/useAuthStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const PrivateRoute = ({ children, role }) => {
  const { user, accessToken } = useAuthStore();
  if (!accessToken) return <Navigate to="/login" />;
  if (role && user?.role !== role) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/analytics/:slug" element={<PublicAnalytics />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* User Dashboard */}
          <Route path="/dashboard" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
            <Route index element={<Overview />} />
            <Route path="links" element={<UrlManagement />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="developer" element={<Developer />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Admin Panel */}
          <Route path="/admin" element={<PrivateRoute role="ADMIN"><AdminLayout /></PrivateRoute>}>
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<UserManager />} />
            <Route path="urls" element={<UrlManagement />} /> {/* Reuse URL management for global view */}
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
          },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
