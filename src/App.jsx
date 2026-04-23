import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProjectProvider } from './contexts/ProjectContext';
import { ConversationProvider } from './contexts/ConversationContext';
import { ToastProvider } from './contexts/ToastContext';
import LoginPage from './pages/LoginPage';
import MainLayout from './components/layout/MainLayout';
import ClientLayout from './components/layout/ClientLayout';

function RequireAuth({ role, children }) {
  const { isAuthenticated, isAdmin, isClient, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface-900">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono text-surface-300 uppercase tracking-wider">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (role === 'admin' && !isAdmin) return <Navigate to="/client" replace />;
  if (role === 'client' && isAdmin) return <Navigate to="/admin" replace />;

  return children;
}

function AppRoutes() {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface-900">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated
          ? <Navigate to={isAdmin ? '/admin' : '/client'} replace />
          : <LoginPage />
      } />

      <Route path="/admin/*" element={
        <RequireAuth role="admin">
          <ProjectProvider>
            <ConversationProvider>
              <MainLayout />
            </ConversationProvider>
          </ProjectProvider>
        </RequireAuth>
      } />

      <Route path="/client/*" element={
        <RequireAuth role="client">
          <ProjectProvider>
            <ConversationProvider>
              <ClientLayout />
            </ConversationProvider>
          </ProjectProvider>
        </RequireAuth>
      } />

      <Route path="*" element={
        <Navigate to={isAuthenticated ? (isAdmin ? '/admin' : '/client') : '/login'} replace />
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  );
}
