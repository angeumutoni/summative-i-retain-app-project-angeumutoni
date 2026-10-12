import { useEffect, useState } from 'react';
import { Box, Button, MenuItem, Paper, TextField } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  resetFilters,
  setAmountRange,
  setCategory,
  setDateRange,
  setPaymentMethod,
  setSearch,
  setSort,
} from '../store/expenseFiltersSlice';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from '../types';
import type { Category, PaymentMethod } from '../types';

interface ExpenseFilterBarProps {
  categories: Category[];
}

const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Newest first', sortBy: 'date', order: 'desc' },
  { value: 'date_asc', label: 'Oldest first', sortBy: 'date', order: 'asc' },
  { value: 'amount_desc', label: 'Highest amount', sortBy: 'amount', order: 'desc' },
  { value: 'amount_asc', label: 'Lowest amount', sortBy: 'amount', order: 'asc' },
] as const;

const isPaymentMethod = (value: string): value is PaymentMethod =>
  (PAYMENT_METHODS as readonly string[]).includes(value);

export default function ExpenseFilterBar({ categories }: ExpenseFilterBarProps) {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.expenseFilters);

  const [searchInput, setSearchInput] = useState(filters.search);
  const [minInput, setMinInput] = useState(filters.minAmount);
  const [maxInput, setMaxInput] = useState(filters.maxAmount);

  const debouncedSearch = useDebouncedValue(searchInput, 400);
  const debouncedMin = useDebouncedValue(minInput, 500);
  const debouncedMax = useDebouncedValue(maxInput, 500);

  useEffect(() => {
    dispatch(setSearch(debouncedSearch));
  }, [debouncedSearch, dispatch]);

  useEffect(() => {
    dispatch(setAmountRange({ minAmount: debouncedMin, maxAmount: debouncedMax }));
  }, [debouncedMin, debouncedMax, dispatch]);

  const handleSort = (value: string) => {
    const option = SORT_OPTIONS.find((o) => o.value === value);
    if (option) dispatch(setSort({ sortBy: option.sortBy, order: option.order }));
  };

  const handleReset = () => {
    dispatch(resetFilters());
    setSearchInput('');
    setMinInput('');
    setMaxInput('');
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
        }}
      >
        <TextField
          label="Search title or notes"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          sx={{ gridColumn: { sm: 'span 2' } }}
        />

        <TextField
          select
          label="Category"
          value={filters.category}
          onChange={(e) => dispatch(setCategory(e.target.value))}
          slotProps={{ inputLabel: { shrink: true }, select: { displayEmpty: true } }}
        >
          <MenuItem value="">All categories</MenuItem>
          {categories.map((category) => (
            <MenuItem key={category._id} value={category._id}>
              {category.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Payment method"
          value={filters.paymentMethod}
          onChange={(e) =>
            dispatch(setPaymentMethod(isPaymentMethod(e.target.value) ? e.target.value : ''))
          }
          slotProps={{ inputLabel: { shrink: true }, select: { displayEmpty: true } }}
        >
          <MenuItem value="">All methods</MenuItem>
          {PAYMENT_METHODS.map((method) => (
            <MenuItem key={method} value={method}>
              {PAYMENT_METHOD_LABELS[method]}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="From"
          type="date"
          value={filters.startDate}
          onChange={(e) =>
            dispatch(setDateRange({ startDate: e.target.value, endDate: filters.endDate }))
          }
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <TextField
          label="To"
          type="date"
          value={filters.endDate}
          onChange={(e) =>
            dispatch(setDateRange({ startDate: filters.startDate, endDate: e.target.value }))
          }
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <TextField
          label="Min amount"
          type="number"
          value={minInput}
          onChange={(e) => setMinInput(e.target.value)}
          slotProps={{ htmlInput: { min: 0 } }}
        />

        <TextField
          label="Max amount"
          type="number"
          value={maxInput}
          onChange={(e) => setMaxInput(e.target.value)}
          slotProps={{ htmlInput: { min: 0 } }}
        />

        <TextField
          select
          label="Sort by"
          value={`${filters.sortBy}_${filters.order}`}
          onChange={(e) => handleSort(e.target.value)}
        >
          {SORT_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <Button onClick={handleReset} variant="outlined" sx={{ alignSelf: 'center' }}>
          Reset filters
        </Button>
      </Box>
    </Paper>
  );
}