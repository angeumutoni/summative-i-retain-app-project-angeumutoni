import { useEffect } from 'react';
import { Alert, Button, LinearProgress, Pagination, Paper, Stack, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchExpenses } from '../store/expensesSlice';
import { setPage } from '../store/expenseFiltersSlice';
import { useCategories } from '../hooks/useCategories';
import ExpenseFilterBar from '../components/ExpenseFilterBar';
import ExpenseList from '../components/ExpenseList';

export default function ExpensesPage() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.expenseFilters);
  const { items, pagination, status, error } = useAppSelector((state) => state.expenses);
  const { categories, error: categoriesError } = useCategories();

  // Re-fetch whenever any filter, sort or page value changes in Redux
  useEffect(() => {
    dispatch(fetchExpenses());
  }, [dispatch, filters]);

  // If the current page no longer exists (e.g. after filtering), step back to the last one
  useEffect(() => {
    if (status === 'succeeded' && pagination.pages > 0 && filters.page > pagination.pages) {
      dispatch(setPage(pagination.pages));
    }
  }, [status, pagination.pages, filters.page, dispatch]);

  const from = (pagination.page - 1) * pagination.limit + 1;
  const to = from + items.length - 1;

  return (
    <Stack spacing={2}>
      <Typography variant="h4" component="h1">
        Expenses
      </Typography>

      {categoriesError && <Alert severity="warning">{categoriesError}</Alert>}

      <ExpenseFilterBar categories={categories} />

      {status === 'loading' && <LinearProgress />}

      {status === 'failed' && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => dispatch(fetchExpenses())}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {status === 'succeeded' && items.length === 0 && (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No expenses match your filters.</Typography>
        </Paper>
      )}

      {items.length > 0 && (
        <>
          <Typography variant="body2" color="text.secondary">
            Showing {from}–{to} of {pagination.total}
          </Typography>
          <ExpenseList expenses={items} />
        </>
      )}

      {pagination.pages > 1 && (
        <Pagination
          count={pagination.pages}
          page={filters.page}
          onChange={(_, page) => dispatch(setPage(page))}
          color="primary"
          sx={{ alignSelf: 'center' }}
        />
      )}
    </Stack>
  );
}