import { useState } from 'react';
import { Alert, Box, Button, LinearProgress, Stack, Typography } from '@mui/material';
import { useAuth } from '../context/useAuth';
import { useNotify } from '../context/useNotify';
import { useDashboard } from '../hooks/useDashboard';
import MonthSelector from '../components/MonthSelector';
import BudgetCard from '../components/BudgetCard';
import BudgetDialog from '../components/BudgetDialog';
import StatCard from '../components/StatCard';
import CategoryBreakdown from '../components/CategoryBreakdown';
import RecentExpenses from '../components/RecentExpenses';
import { currentMonthValue, formatCurrency, formatMonth } from '../utils/format';

export default function DashboardPage() {
  const { user } = useAuth();
  const notify = useNotify();

  const [month, setMonth] = useState(currentMonthValue());
  const [budgetOpen, setBudgetOpen] = useState(false);
  const { data, loading, error, reload } = useDashboard(month);

  const handleBudgetSaved = () => {
    setBudgetOpen(false);
    notify(`Budget saved for ${formatMonth(month)}`);
    reload();
  };

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' } }}
      >
        <Box>
          <Typography variant="h4" component="h1">
            Dashboard
          </Typography>
          <Typography color="text.secondary">Welcome back, {user?.name}</Typography>
        </Box>
        <MonthSelector month={month} onChange={setMonth} />
      </Stack>

      {loading && <LinearProgress />}

      {error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={reload}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {data && (
        <Stack spacing={3} sx={{ opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s' }}>
          <BudgetCard budget={data.budget} onEdit={() => setBudgetOpen(true)} />

          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            }}
          >
            <StatCard
              label={`Total spent in ${formatMonth(month)}`}
              value={formatCurrency(data.totalSpent)}
              caption={`${data.expenseCount} ${data.expenseCount === 1 ? 'expense' : 'expenses'}`}
            />
            <StatCard
              label="Remaining budget"
              value={data.budget ? formatCurrency(data.budget.remaining) : 'No budget set'}
              caption={data.budget && data.budget.remaining < 0 ? 'Over budget' : undefined}
            />
            <StatCard
              label="Highest expense"
              value={data.highestExpense ? formatCurrency(data.highestExpense.amount) : '—'}
              caption={data.highestExpense?.title}
            />
          </Box>

          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              alignItems: 'start',
            }}
          >
            <CategoryBreakdown items={data.spendingByCategory} total={data.totalSpent} />
            <RecentExpenses expenses={data.recentExpenses} />
          </Box>
        </Stack>
      )}

      {budgetOpen && (
        <BudgetDialog
          month={month}
          currentAmount={data?.budget?.amount ?? null}
          onClose={() => setBudgetOpen(false)}
          onSaved={handleBudgetSaved}
        />
      )}
    </Stack>
  );
}