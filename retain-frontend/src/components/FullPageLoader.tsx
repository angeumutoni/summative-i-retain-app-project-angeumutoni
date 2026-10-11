import { Box, CircularProgress, Typography } from '@mui/material';

interface FullPageLoaderProps {
  message?: string;
}

export default function FullPageLoader({ message = 'Loading…' }: FullPageLoaderProps) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        px: 2,
        textAlign: 'center',
      }}
    >
      <CircularProgress />
      <Typography color="text.secondary">{message}</Typography>
    </Box>
  );
}