export const PAYMENT_METHODS = ['cash', 'mobile_money', 'card', 'bank_transfer'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  mobile_money: 'Mobile money',
  card: 'Card',
  bank_transfer: 'Bank transfer',
};

export type Role = 'user' | 'admin';
export type BudgetStatus = 'within' | 'approaching' | 'over';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Category {
  _id: string;
  name: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryRef {
  _id: string;
  name: string;
}

export interface Expense {
  _id: string;
  user: string;
  title: string;
  amount: number;
  category: CategoryRef;
  date: string;
  paymentMethod: PaymentMethod;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseInput {
  title: string;
  amount: number;
  category: string;
  date: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ExpenseListResponse {
  expenses: Expense[];
  pagination: Pagination;
}

export interface BudgetSummary {
  amount: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  status: BudgetStatus;
}

export interface BudgetResponse {
  month: string;
  spent: number;
  budget: BudgetSummary | null;
}

export interface CategorySpending {
  categoryId: string;
  name: string;
  total: number;
  count: number;
}

export interface DashboardData {
  month: string;
  totalSpent: number;
  expenseCount: number;
  budget: BudgetSummary | null;
  highestExpense: Expense | null;
  spendingByCategory: CategorySpending[];
  recentExpenses: Expense[];
}

export interface AdminExpense extends Omit<Expense, 'user'> {
  user: { _id: string; name: string; email: string } | null;
}

export interface CategoryStat {
  categoryId: string;
  name: string;
  totalSpent: number;
  expenseCount: number;
}

export interface RecentUser {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AdminInsights {
  totalUsers: number;
  totalExpenses: number;
  totalExpenseValue: number;
  expensesThisMonth: number;
  spendingPerCategory: CategoryStat[];
  topCategories: CategoryStat[];
  bottomCategories: CategoryStat[];
  recentExpenses: AdminExpense[];
  recentUsers: RecentUser[];
}

export interface CategoriesResponse {
  categories: Category[];
}

export interface CategoryResponse {
  category: Category;
}

export interface ExpenseResponse {
  expense: Expense;
}

export interface MessageResponse {
  message: string;
}

export interface DeleteCategoryResponse extends MessageResponse {
  reassignedExpenses: number;
}
export type SortField = 'date' | 'amount';
export type SortOrder = 'asc' | 'desc';

export interface ExpenseFilters {
  search: string;
  category: string;
  paymentMethod: PaymentMethod | '';
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
  sortBy: SortField;
  order: SortOrder;
  page: number;
  limit: number;
}
