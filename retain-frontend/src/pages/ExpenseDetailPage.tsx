import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { expenseApi } from '../api/expenses';
import { useCategories } from '../hooks/useCategories';
import { useNotify } from '../context/useNotify';
import ExpenseFormDialog from '../components/ExpenseFormDialog';
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog';
import { PAYMENT_METHOD_LABELS } from '../types';
import type { Expense } from '../types';
import { formatCurrency, formatDate, formatDateTime } from '../utils/format';

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '180px 1fr' },
        gap: { xs: 0.5, sm: 2 },
        py: 1.5,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography component="div">{children}</Typography>
    </Box>
  );
}

export default function ExpenseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const notify = useNotify();
  const { categories } = useCategories();

  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    expenseApi
      .get(id)
      .then((response) => {
        if (!cancelled) setExpense(response.expense);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load the expense');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const backButton = (
    <Button component={RouterLink} to="/expenses" startIcon={<ArrowBackIcon />} sx={{ alignSelf: 'flex-start' }}>
      Back to expenses
    </Button>
  );

  if (loading) {
    return (
      <Stack spacing={2}>
        {backButton}
        <LinearProgress />
      </Stack>
    );
  }

  if (error || !expense) {
    return (
      <Stack spacing={2}>
        {backButton}
        <Alert severity="error">{error || 'Expense not found'}</Alert>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      {backButton}

      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h4" component="h1">
          {expense.title}
        </Typography>
        <Typography variant="h5" color="primary" sx={{ mt: 0.5, mb: 2 }}>
          {formatCurrency(expense.amount)}
        </Typography>
        <Divider />

        <DetailRow label="Category">
          <Chip label={expense.category.name} size="small" />
        </DetailRow>
        <Divider />
        <DetailRow label="Date">{formatDate(expense.date)}</DetailRow>
        <Divider />
        <DetailRow label="Payment method">{PAYMENT_METHOD_LABELS[expense.paymentMethod]}</DetailRow>
        <Divider />
        <DetailRow label="Notes">
          {expense.notes ? expense.notes : <Typography color="text.secondary">No notes</Typography>}
        </DetailRow>
        <Divider />
        <DetailRow label="Recorded">{formatDateTime(expense.createdAt)}</DetailRow>
        <Divider />
        <DetailRow label="Last updated">{formatDateTime(expense.updatedAt)}</DetailRow>

        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button variant="contained" onClick={() => setEditing(true)}>
            Edit
          </Button>
          <Button variant="outlined" color="error" onClick={() => setDeleting(true)}>
            Delete
          </Button>
        </Stack>
      </Paper>

      {editing && (
        <ExpenseFormDialog
          expense={expense}
          categories={categories}
          onClose={() => setEditing(false)}
          onSaved={(updated) => {
            setExpense(updated);
            setEditing(false);
            notify('Expense updated');
          }}
        />
      )}

      {deleting && (
        <ConfirmDeleteDialog
          expense={expense}
          onClose={() => setDeleting(false)}
          onDeleted={() => {
            notify('Expense deleted');
            navigate('/expenses', { replace: true });
          }}
        />
      )}
    </Stack>
  );
}