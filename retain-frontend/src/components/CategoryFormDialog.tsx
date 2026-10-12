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
import { categoryApi } from '../api/categories';
import type { Category } from '../types';

interface CategoryFormDialogProps {
  category: Category | null;
  onClose: () => void;
  onSaved: (mode: 'created' | 'updated', category: Category) => void;
}

export default function CategoryFormDialog({ category, onClose, onSaved }: CategoryFormDialogProps) {
  const [name, setName] = useState(category?.name ?? '');
  const [fieldError, setFieldError] = useState('');
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) {
      setFieldError('Category name is required');
      return;
    }

    setFieldError('');
    setServerError('');
    setSubmitting(true);
    try {
      const response = category
        ? await categoryApi.update(category._id, trimmed)
        : await categoryApi.create(trimmed);
      onSaved(category ? 'updated' : 'created', response.category);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Could not save the category');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onClose={submitting ? undefined : onClose} fullWidth maxWidth="xs">
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogTitle>{category ? 'Rename category' : 'Add category'}</DialogTitle>
        <DialogContent>
          {serverError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {serverError}
            </Alert>
          )}
          <TextField
            label="Category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={Boolean(fieldError)}
            helperText={fieldError}
            slotProps={{ htmlInput: { maxLength: 40 } }}
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
            {submitting ? 'Saving…' : category ? 'Save changes' : 'Add category'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}