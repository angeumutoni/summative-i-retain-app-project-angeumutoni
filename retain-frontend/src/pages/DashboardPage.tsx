import { Typography } from '@mui/material';
import { useAuth } from '../context/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();
  return (
    <Typography variant="h4" component="h1">
      Welcome, {user?.name}
    </Typography>
  );
}