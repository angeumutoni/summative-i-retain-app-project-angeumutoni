const CURRENCY = 'RWF';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: CURRENCY,
  maximumFractionDigits: 0,
});

export const formatCurrency = (amount: number): string => currencyFormatter.format(amount);

export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
// YYYY-MM-DD in the user's local timezone, for <input type="date">
export const todayInputValue = (): string => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

// Expense dates are stored as UTC midnight, so the date part of the ISO string is the date
export const toInputDate = (iso: string): string => iso.slice(0, 10);

export const formatDateTime = (iso: string): string =>
  new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
