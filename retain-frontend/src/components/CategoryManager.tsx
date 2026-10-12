import { useState } from 'react';
import {
  Alert,
  Button,
  Chip,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setCategory } from '../store/expenseFiltersSlice';
import { useCategories } from '../hooks/useCategories';
import { useNotify } from '../context/useNotify';
import CategoryFormDialog from './CategoryFormDialog';
import ConfirmCategoryDeleteDialog from './ConfirmCategoryDeleteDialog';
import type { Category, DeleteCategoryResponse } from '../types';
import { formatDate } from '../utils/format';

export default function CategoryManager() {
  const dispatch = useAppDispatch();
  const notify = useNotify();
  const activeCategoryFilter = useAppSelector((state) => state.expenseFilters.category);
  const { categories, loading, error, reload } = useCategories();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setFormOpen(true);
  };

  const handleSaved = (mode: 'created' | 'updated', category: Category) => {
    setFormOpen(false);
    setEditing(null);
    notify(
      mode === 'created'
        ? `Category "${category.name}" created`
        : `Category renamed to "${category.name}"`
    );
    reload();
  };

  const handleDeleted = (category: Category, result: DeleteCategoryResponse) => {
    setDeleting(null);

    if (activeCategoryFilter === category._id) dispatch(setCategory(''));

    const moved = result.reassignedExpenses;
    notify(
      moved > 0
        ? `Category "${category.name}" deleted. ${moved} ${moved === 1 ? 'expense' : 'expenses'} moved to Uncategorized.`
        : `Category "${category.name}" deleted.`
    );
    reload();
  };

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' } }}
      >
        <Typography variant="h6" component="h2">
          Expense categories
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Add category
        </Button>
      </Stack>

      <Alert severity="info">
        Deleting a category moves its expenses to the default "Uncategorized" category, so no
        spending data is lost. The default category cannot be renamed or deleted.
      </Alert>

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

      {categories.length > 0 && (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category._id} hover>
                  <TableCell>
                    {category.name}
                    {category.isDefault && (
                      <Chip label="Default" size="small" color="primary" sx={{ ml: 1 }} />
                    )}
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    {formatDate(category.createdAt)}
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    {category.isDefault ? (
                      <Typography variant="body2" color="text.secondary">
                        Protected
                      </Typography>
                    ) : (
                      <>
                        <Tooltip title="Rename">
                          <IconButton
                            aria-label={`Rename ${category.name}`}
                            onClick={() => openEdit(category)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            aria-label={`Delete ${category.name}`}
                            color="error"
                            onClick={() => setDeleting(category)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {formOpen && (
        <CategoryFormDialog
          category={editing}
          onClose={() => setFormOpen(false)}
          onSaved={handleSaved}
        />
      )}

      {deleting && (
        <ConfirmCategoryDeleteDialog
          category={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={(result) => handleDeleted(deleting, result)}
        />
      )}
    </Stack>
  );
}