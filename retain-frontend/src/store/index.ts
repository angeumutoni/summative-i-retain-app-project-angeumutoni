import { configureStore } from '@reduxjs/toolkit';
import expenseFiltersReducer from './expenseFiltersSlice';
import expensesReducer from './expensesSlice';

export const store = configureStore({
  reducer: {
    expenseFilters: expenseFiltersReducer,
    expenses: expensesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;