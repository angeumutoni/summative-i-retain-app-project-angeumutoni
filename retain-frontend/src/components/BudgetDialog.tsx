import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { budgetApi } from '../api/budgets';
import { formatMonth } from '../utils/format';

interface BudgetDialogProps {
  month: string;
  currentAmount: number | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function BudgetDialog({ month, currentAmount, onClose, onSaved }: BudgetDialogProps) {
  const [amount, setAmount] = useState(currentAmount !== null ? String(currentAmount) : '');
  const [fieldError, setFieldError] = useState('');
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const value = Number(amount);
    if (amount === '' || Number.isNaN(value) || value <= 0) {
      setFieldError('Enter a budget greater than 0');
      return;
    }

    setFieldError('');
    setServerError('');
    setSubmitting(true);
    try {
      await budgetApi.set(month, value);
      onSaved();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Could not save the budget');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onClose={submitting ? undefined : onClose} fullWidth maxWidth="xs">
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogTitle>
          {currentAmount !== null ? 'Update' : 'Set'} budget for {formatMonth(month)}
        </DialogTitle>
        <DialogContent>
          {serverError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {serverError}
            </Alert>
          )}
          <TextField
            label="Budget amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={Boolean(fieldError)}
            helperText={fieldError}
            slotProps={{ htmlInput: { min: 0, step: 'any' } }}
            autoFocus
            fullWidth
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save budget'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}