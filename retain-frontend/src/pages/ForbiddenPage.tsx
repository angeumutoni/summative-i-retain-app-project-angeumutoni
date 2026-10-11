import { Link as RouterLink } from 'react-router-dom';
import { Button, Stack, Typography } from '@mui/material';

export default function ForbiddenPage() {
  return (
    <Stack spacing={2} sx={{ alignItems: 'center', py: 8, textAlign: 'center' }}>
      <Typography variant="h2" component="h1">
        403
      </Typography>
      <Typography color="text.secondary">
        You do not have permission to view this page. This area is for administrators only.
      </Typography>
      <Button component={RouterLink} to="/dashboard" variant="contained">
        Back to dashboard
      </Button>
    </Stack>
  );
}