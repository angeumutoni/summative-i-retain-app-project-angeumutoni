import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import FullPageLoader from '../components/FullPageLoader';

export default function GuestRoute() {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <FullPageLoader message="Connecting to the server. If it has been idle, this can take up to a minute." />
    );
  }

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
  }

  return <Outlet />;
}