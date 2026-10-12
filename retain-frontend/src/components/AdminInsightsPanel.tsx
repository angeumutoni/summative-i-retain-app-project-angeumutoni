import {
    Alert,
    Box,
    Button,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    Paper,
    Stack,
    Typography,
  } from '@mui/material';
  import RefreshIcon from '@mui/icons-material/Refresh';
  import { useAdminInsights } from '../hooks/useAdminInsights';
  import StatCard from './StatCard';
  import CategoryBreakdown from './CategoryBreakdown';
  import type { AdminExpense, CategoryStat, RecentUser } from '../types';
  import { formatCurrency, formatDate } from '../utils/format';
  
  function CategoryRanking({
    title,
    items,
    emptyMessage,
  }: {
    title: string;
    items: CategoryStat[];
    emptyMessage: string;
  }) {
    return (
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          {title}
        </Typography>
        {items.length === 0 ? (
          <Typography color="text.secondary">{emptyMessage}</Typography>
        ) : (
          <List disablePadding>
            {items.map((item, index) => (
              <ListItem key={item.categoryId} divider disableGutters>
                <ListItemText
                  primary={`${index + 1}. ${item.name}`}
                  secondary={`${item.expenseCount} ${item.expenseCount === 1 ? 'expense' : 'expenses'}`}
                />
                <Typography sx={{ fontWeight: 600, whiteSpace: 'nowrap', ml: 2 }}>
                  {formatCurrency(item.totalSpent)}
                </Typography>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    );
  }
  
  function RecentExpensesList({ expenses }: { expenses: AdminExpense[] }) {
    return (
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Recently added expenses
        </Typography>
        {expenses.length === 0 ? (
          <Typography color="text.secondary">No expenses have been recorded yet.</Typography>
        ) : (
          <List disablePadding>
            {expenses.map((expense) => (
              <ListItem key={expense._id} divider disableGutters>
                <ListItemText
                  primary={expense.title}
                  secondary={`${expense.user ? expense.user.name : 'Deleted user'} · ${expense.category.name} · ${formatDate(expense.createdAt)}`}
                />
                <Typography sx={{ fontWeight: 600, whiteSpace: 'nowrap', ml: 2 }}>
                  {formatCurrency(expense.amount)}
                </Typography>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    );
  }
  
  function RecentUsersList({ users }: { users: RecentUser[] }) {
    return (
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Recently registered users
        </Typography>
        {users.length === 0 ? (
          <Typography color="text.secondary">No users have registered yet.</Typography>
        ) : (
          <List disablePadding>
            {users.map((user) => (
              <ListItem key={user._id} divider disableGutters>
                <ListItemText primary={user.name} secondary={user.email} />
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap', ml: 2 }}>
                  {formatDate(user.createdAt)}
                </Typography>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    );
  }
  
  export default function AdminInsightsPanel() {
    const { data, loading, error, reload } = useAdminInsights();
  
    return (
      <Stack spacing={3}>
        <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
          <Button onClick={reload} disabled={loading} startIcon={<RefreshIcon />}>
            Refresh
          </Button>
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
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              }}
            >
              <StatCard label="Registered users" value={data.totalUsers} />
              <StatCard label="Expenses recorded" value={data.totalExpenses} />
              <StatCard label="Total value of expenses" value={formatCurrency(data.totalExpenseValue)} />
              <StatCard label="Expenses this month" value={data.expensesThisMonth} />
            </Box>
  
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                alignItems: 'start',
              }}
            >
              <CategoryBreakdown
                title="Total spending per category"
                total={data.totalExpenseValue}
                items={data.spendingPerCategory.map((category) => ({
                  categoryId: category.categoryId,
                  name: category.name,
                  total: category.totalSpent,
                  count: category.expenseCount,
                }))}
              />
              <Stack spacing={2}>
                <CategoryRanking
                  title="Top 5 most-used categories"
                  items={data.topCategories.filter((category) => category.expenseCount > 0)}
                  emptyMessage="No expenses have been recorded yet."
                />
                <CategoryRanking
                  title="Bottom 5 least-used categories"
                  items={data.bottomCategories}
                  emptyMessage="There are no categories yet."
                />
              </Stack>
            </Box>
  
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                alignItems: 'start',
              }}
            >
              <RecentExpensesList expenses={data.recentExpenses} />
              <RecentUsersList users={data.recentUsers} />
            </Box>
          </Stack>
        )}
      </Stack>
    );
  }