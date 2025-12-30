import React from 'react';
import { AuthProvider, useAuth } from './components/AuthContext';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard } from './components/Dashboard';
import { MobileTechApp } from './components/mobile/MobileTechApp';
import { AdminDispatchConsole } from './components/AdminDispatchConsole';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { UserRole } from './types';
import { Layout } from './components/Layout';
import { AccessDenied } from './components/AccessDenied';

const AuthenticatedApp: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return <AccessDenied message="No user found." />;

  switch (user.role) {
    case UserRole.CLIENT:
      return (
        <Layout activeTab="dashboard" onNavigate={() => {}}>
          <Dashboard />
        </Layout>
      );
    case UserRole.TECHNICIAN:
      return (
        <Layout activeTab="mobile-tech" onNavigate={() => {}}>
          <MobileTechApp onLogout={logout} />
        </Layout>
      );
    case UserRole.ADMIN:
      return (
        <Layout activeTab="admin-dispatch" onNavigate={() => {}}>
          <AdminDispatchConsole onDispatchClick={() => {}} onAssign={() => {}} />
        </Layout>
      );
    case UserRole.SUPER_ADMIN:
      return (
        <Layout activeTab="strategic-tower" onNavigate={() => {}}>
          <SuperAdminDashboard />
        </Layout>
      );
    default:
      return <AccessDenied message="Role not recognized." />;
  }
};

const Main: React.FC = () => {
  const { user } = useAuth();
  return user ? <AuthenticatedApp /> : <LoginScreen />;
};

const App: React.FC = () => (
  <AuthProvider>
    <Main />
  </AuthProvider>
);

export default App;
