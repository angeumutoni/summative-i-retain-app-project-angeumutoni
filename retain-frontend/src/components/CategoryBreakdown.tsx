import { Box, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import type { CategorySpending } from '../types';
import { formatCurrency } from '../utils/format';

interface CategoryBreakdownProps {
  items: CategorySpending[];
  total: number;
  title?: string;
}

export default function CategoryBreakdown({
  items,
  total,
  title = 'Spending by category',
}: CategoryBreakdownProps) {
  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        {title}
      </Typography>

      {items.length === 0 ? (
        <Typography color="text.secondary">No spending recorded yet.</Typography>
      ) : (
        <Stack spacing={2}>
          {items.map((item) => {
            const share = total > 0 ? (item.total / total) * 100 : 0;
            return (
              <Box key={item.categoryId}>
                <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography>{item.name}</Typography>
                  <Typography sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {formatCurrency(item.total)} · {Math.round(share)}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={share}
                  aria-label={`${item.name} share of spending`}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            );
          })}
        </Stack>
      )}
    </Paper>
  );
}