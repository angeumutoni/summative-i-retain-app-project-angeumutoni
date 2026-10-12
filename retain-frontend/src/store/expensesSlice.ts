import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { expenseApi } from '../api/expenses';
import type { Expense, ExpenseFilters, ExpenseListResponse, Pagination } from '../types';

interface ExpensesState {
  items: Expense[];
  pagination: Pagination;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  currentRequestId: string | null;
}

const initialState: ExpensesState = {
  items: [],
  pagination: { page: 1, limit: 10, total: 0, pages: 0 },
  status: 'idle',
  error: null,
  currentRequestId: null,
};

export const fetchExpenses = createAsyncThunk<
  ExpenseListResponse,
  void,
  { state: { expenseFilters: ExpenseFilters }; rejectValue: string }
>('expenses/fetch', async (_, { getState, rejectWithValue }) => {
  try {
    return await expenseApi.list(getState().expenseFilters);
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to load expenses');
  }
});

const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    clearExpenses: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.pending, (state, action) => {
        state.status = 'loading';
        state.error = null;
        state.currentRequestId = action.meta.requestId;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;
        state.items = action.payload.expenses;
        state.pagination = action.payload.pagination;
        state.status = 'succeeded';
        state.currentRequestId = null;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;
        state.status = 'failed';
        state.error = action.payload ?? action.error.message ?? 'Failed to load expenses';
        state.currentRequestId = null;
      });
  },
});

export const { clearExpenses } = expensesSlice.actions;
export default expensesSlice.reducer;