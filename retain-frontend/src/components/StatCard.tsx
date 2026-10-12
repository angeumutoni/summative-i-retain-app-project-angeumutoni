import type { ReactNode } from 'react';
import { Paper, Typography } from '@mui/material';

interface StatCardProps {
  label: string;
  value: ReactNode;
  caption?: string;
}

export default function StatCard({ label, value, caption }: StatCardProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h5" component="p" sx={{ fontWeight: 700, mt: 0.5, wordBreak: 'break-word' }}>
        {value}
      </Typography>
      {caption && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {caption}
        </Typography>
      )}
    </Paper>
  );
}