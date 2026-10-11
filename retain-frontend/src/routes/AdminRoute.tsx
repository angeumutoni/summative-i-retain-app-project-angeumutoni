import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import ForbiddenPage from '../pages/ForbiddenPage';

export default function AdminRoute() {
  const { isAdmin } = useAuth();
  return isAdmin ? <Outlet /> : <ForbiddenPage />;
}