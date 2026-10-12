import { Box, Button, Chip, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import type { BudgetStatus, BudgetSummary } from '../types';
import { formatCurrency } from '../utils/format';

interface BudgetCardProps {
  budget: BudgetSummary | null;
  onEdit: () => void;
}

const STATUS_CONFIG: Record<BudgetStatus, { label: string; color: 'success' | 'warning' | 'error' }> = {
  within: { label: 'Within budget', color: 'success' },
  approaching: { label: 'Approaching budget limit', color: 'warning' },
  over: { label: 'Over budget', color: 'error' },
};

export default function BudgetCard({ budget, onEdit }: BudgetCardProps) {
  if (!budget) {
    return (
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}
        >
          <Box>
            <Typography variant="h6" component="h2">
              Monthly budget
            </Typography>
            <Typography color="text.secondary">No budget set for this month.</Typography>
          </Box>
          <Button variant="contained" onClick={onEdit}>
            Set budget
          </Button>
        </Stack>
      </Paper>
    );
  }

  const config = STATUS_CONFIG[budget.status];
  const over = budget.remaining < 0;

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          Monthly budget
        </Typography>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Chip label={config.label} color={config.color} size="small" />
          <Button size="small" onClick={onEdit}>
            Update
          </Button>
        </Stack>
      </Stack>

      <LinearProgress
        variant="determinate"
        value={Math.min(budget.percentUsed, 100)}
        color={config.color}
        aria-label="Budget used"
        sx={{ height: 12, borderRadius: 6 }}
      />

      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {formatCurrency(budget.spent)} of {formatCurrency(budget.amount)} spent ({budget.percentUsed}%)
      </Typography>
      <Typography sx={{ mt: 1, fontWeight: 600 }} color={over ? 'error' : 'text.primary'}>
        {over
          ? `Over budget by ${formatCurrency(Math.abs(budget.remaining))}`
          : `${formatCurrency(budget.remaining)} remaining`}
      </Typography>
    </Paper>
  );
}