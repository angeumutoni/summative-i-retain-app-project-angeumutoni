import { useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { expenseApi } from '../api/expenses';
import type { Expense } from '../types';
import { formatCurrency } from '../utils/format';

interface ConfirmDeleteDialogProps {
  expense: Expense;
  onClose: () => void;
  onDeleted: (expense: Expense) => void;
}

export default function ConfirmDeleteDialog({ expense, onClose, onDeleted }: ConfirmDeleteDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setSubmitting(true);
    setError('');
    try {
      await expenseApi.remove(expense._id);
      onDeleted(expense);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete the expense');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onClose={submitting ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Delete expense?</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <DialogContentText>
          "{expense.title}" ({formatCurrency(expense.amount)}) will be permanently deleted. This
          cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleDelete} color="error" variant="contained" disabled={submitting}>
          {submitting ? 'Deleting…' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}