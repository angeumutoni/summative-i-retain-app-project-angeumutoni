import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, LinearProgress, Pagination, Paper, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchExpenses } from '../store/expensesSlice';
import { setPage } from '../store/expenseFiltersSlice';
import { useCategories } from '../hooks/useCategories';
import { useNotify } from '../context/useNotify';
import ExpenseFilterBar from '../components/ExpenseFilterBar';
import ExpenseList from '../components/ExpenseList';
import ExpenseFormDialog from '../components/ExpenseFormDialog';
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog';
import type { Expense } from '../types';

export default function ExpensesPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const notify = useNotify();

  const filters = useAppSelector((state) => state.expenseFilters);
  const { items, pagination, status, error } = useAppSelector((state) => state.expenses);
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState<Expense | null>(null);

  // Re-fetch whenever any filter, sort or page value changes in Redux
  useEffect(() => {
    dispatch(fetchExpenses());
  }, [dispatch, filters]);

  // If the current page no longer exists (after filtering or deleting), step back to the last one
  useEffect(() => {
    if (status === 'succeeded' && pagination.pages > 0 && filters.page > pagination.pages) {
      dispatch(setPage(pagination.pages));
    }
  }, [status, pagination.pages, filters.page, dispatch]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (expense: Expense) => {
    setEditing(expense);
    setFormOpen(true);
  };

  const handleSaved = (_expense: Expense, mode: 'created' | 'updated') => {
    setFormOpen(false);
    setEditing(null);
    notify(mode === 'created' ? 'Expense added' : 'Expense updated');
    dispatch(fetchExpenses());
  };

  const handleDeleted = (expense: Expense) => {
    setDeleting(null);
    notify(`Deleted "${expense.title}"`);
    dispatch(fetchExpenses());
  };

  const from = (pagination.page - 1) * pagination.limit + 1;
  const to = from + items.length - 1;

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' } }}
      >
        <Typography variant="h4" component="h1">
          Expenses
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
          disabled={categoriesLoading}
        >
          Add expense
        </Button>
      </Stack>

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
          <Typography color="text.secondary">
            No expenses match your filters. Add one with the button above.
          </Typography>
        </Paper>
      )}

      {items.length > 0 && (
        <>
          <Typography variant="body2" color="text.secondary">
            Showing {from}–{to} of {pagination.total}
          </Typography>
          <ExpenseList
            expenses={items}
            onView={(expense) => navigate(`/expenses/${expense._id}`)}
            onEdit={openEdit}
            onDelete={setDeleting}
          />
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

      {formOpen && (
        <ExpenseFormDialog
          expense={editing}
          categories={categories}
          onClose={() => setFormOpen(false)}
          onSaved={handleSaved}
        />
      )}

      {deleting && (
        <ConfirmDeleteDialog
          expense={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={handleDeleted}
        />
      )}
    </Stack>
  );
}