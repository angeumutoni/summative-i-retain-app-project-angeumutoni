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
import { categoryApi } from '../api/categories';
import type { Category, DeleteCategoryResponse } from '../types';

interface ConfirmCategoryDeleteDialogProps {
  category: Category;
  onClose: () => void;
  onDeleted: (result: DeleteCategoryResponse) => void;
}

export default function ConfirmCategoryDeleteDialog({
  category,
  onClose,
  onDeleted,
}: ConfirmCategoryDeleteDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setSubmitting(true);
    setError('');
    try {
      onDeleted(await categoryApi.remove(category._id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete the category');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onClose={submitting ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Delete category?</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <DialogContentText>
          "{category.name}" will be deleted. Any expenses in this category are not lost: they will be
          moved to "Uncategorized".
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleDelete} color="error" variant="contained" disabled={submitting}>
          {submitting ? 'Deleting…' : 'Delete category'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}