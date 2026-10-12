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
  MenuItem,
  Stack,
  TextField,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { expenseApi } from '../api/expenses';
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from '../types';
import type { Category, Expense, ExpenseInput, PaymentMethod } from '../types';
import { toInputDate, todayInputValue } from '../utils/format';

interface ExpenseFormDialogProps {
  expense: Expense | null;
  categories: Category[];
  onClose: () => void;
  onSaved: (expense: Expense, mode: 'created' | 'updated') => void;
}

interface FormState {
  title: string;
  amount: string;
  category: string;
  date: string;
  paymentMethod: PaymentMethod | '';
  notes: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const isPaymentMethod = (value: string): value is PaymentMethod =>
  (PAYMENT_METHODS as readonly string[]).includes(value);

const buildInitialState = (expense: Expense | null, categories: Category[]): FormState => {
  if (expense) {
    return {
      title: expense.title,
      amount: String(expense.amount),
      category: expense.category._id,
      date: toInputDate(expense.date),
      paymentMethod: expense.paymentMethod,
      notes: expense.notes,
    };
  }
  return {
    title: '',
    amount: '',
    category: categories.find((category) => category.isDefault)?._id ?? '',
    date: todayInputValue(),
    paymentMethod: '',
    notes: '',
  };
};

const validate = (form: FormState): FormErrors => {
  const errors: FormErrors = {};
  const amount = Number(form.amount);

  if (!form.title.trim()) errors.title = 'Title is required';
  if (form.amount === '' || Number.isNaN(amount) || amount <= 0) {
    errors.amount = 'Enter an amount greater than 0';
  }
  if (!form.category) errors.category = 'Choose a category';
  if (!form.date) errors.date = 'Choose a date';
  if (!form.paymentMethod) errors.paymentMethod = 'Choose a payment method';
  return errors;
};

export default function ExpenseFormDialog({
  expense,
  categories,
  onClose,
  onSaved,
}: ExpenseFormDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [form, setForm] = useState<FormState>(() => buildInitialState(expense, categories));
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0 || form.paymentMethod === '') return;

    const input: ExpenseInput = {
      title: form.title.trim(),
      amount: Number(form.amount),
      category: form.category,
      date: form.date,
      paymentMethod: form.paymentMethod,
      notes: form.notes.trim(),
    };

    setSubmitting(true);
    setServerError('');
    try {
      const response = expense
        ? await expenseApi.update(expense._id, input)
        : await expenseApi.create(input);
      onSaved(response.expense, expense ? 'updated' : 'created');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Could not save the expense');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onClose={submitting ? undefined : onClose} fullWidth maxWidth="sm" fullScreen={fullScreen}>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogTitle>{expense ? 'Edit expense' : 'Add expense'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {serverError && <Alert severity="error">{serverError}</Alert>}

            <TextField
              label="Title"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              error={Boolean(errors.title)}
              helperText={errors.title}
              autoFocus
              required
              fullWidth
            />

            <TextField
              label="Amount"
              type="number"
              value={form.amount}
              onChange={(e) => update('amount', e.target.value)}
              error={Boolean(errors.amount)}
              helperText={errors.amount}
              slotProps={{ htmlInput: { min: 0, step: 'any' } }}
              required
              fullWidth
            />

            <TextField
              select
              label="Category"
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
              error={Boolean(errors.category)}
              helperText={errors.category}
              required
              fullWidth
            >
              {categories.map((category) => (
                <MenuItem key={category._id} value={category._id}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Date"
              type="date"
              value={form.date}
              onChange={(e) => update('date', e.target.value)}
              error={Boolean(errors.date)}
              helperText={errors.date}
              slotProps={{ inputLabel: { shrink: true } }}
              required
              fullWidth
            />

            <TextField
              select
              label="Payment method"
              value={form.paymentMethod}
              onChange={(e) =>
                update('paymentMethod', isPaymentMethod(e.target.value) ? e.target.value : '')
              }
              error={Boolean(errors.paymentMethod)}
              helperText={errors.paymentMethod}
              required
              fullWidth
            >
              {PAYMENT_METHODS.map((method) => (
                <MenuItem key={method} value={method}>
                  {PAYMENT_METHOD_LABELS[method]}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Notes (optional)"
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
              multiline
              minRows={3}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? 'Saving…' : expense ? 'Save changes' : 'Add expense'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}