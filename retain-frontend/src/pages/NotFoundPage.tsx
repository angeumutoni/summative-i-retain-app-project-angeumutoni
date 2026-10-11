import { Link as RouterLink } from 'react-router-dom';
import { Button, Container, Stack, Typography } from '@mui/material';

export default function NotFoundPage() {
  return (
    <Container maxWidth="sm">
      <Stack spacing={2} sx={{ alignItems: 'center', py: 10, textAlign: 'center' }}>
        <Typography variant="h2" component="h1">
          404
        </Typography>
        <Typography color="text.secondary">This page does not exist.</Typography>
        <Button component={RouterLink} to="/" variant="contained">
          Go home
        </Button>
      </Stack>
    </Container>
  );
}