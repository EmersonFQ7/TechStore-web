import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../common/Spinner';

export default function ProtectedRoute({ roles = [] }) {
  const { isAuthenticated, loading, hasRole } = useAuth();

  if (loading) return <Spinner fullScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles.length > 0 && !hasRole(...roles)) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}