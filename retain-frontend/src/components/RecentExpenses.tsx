import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, List, ListItemButton, ListItemText, Paper, Typography } from '@mui/material';
import type { Expense } from '../types';
import { formatCurrency, formatDate } from '../utils/format';

interface RecentExpensesProps {
  expenses: Expense[];
}

export default function RecentExpenses({ expenses }: RecentExpensesProps) {
  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Recent expenses
      </Typography>

      {expenses.length === 0 ? (
        <Typography color="text.secondary">No expenses recorded this month.</Typography>
      ) : (
        <List disablePadding>
          {expenses.map((expense) => (
            <ListItemButton
              key={expense._id}
              component={RouterLink}
              to={`/expenses/${expense._id}`}
              divider
              sx={{ px: 0 }}
            >
              <ListItemText
                primary={expense.title}
                secondary={`${formatDate(expense.date)} · ${expense.category.name}`}
              />
              <Typography sx={{ fontWeight: 600, whiteSpace: 'nowrap', ml: 2 }}>
                {formatCurrency(expense.amount)}
              </Typography>
            </ListItemButton>
          ))}
        </List>
      )}

      <Box sx={{ mt: 2 }}>
        <Button component={RouterLink} to="/expenses" size="small">
          View all expenses
        </Button>
      </Box>
    </Paper>
  );
}