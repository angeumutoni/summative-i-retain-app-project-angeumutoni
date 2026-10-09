const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

export const isValidMonth = (month) => MONTH_REGEX.test(month);

export const currentMonth = () => new Date().toISOString().slice(0, 7);

// start is inclusive, end is exclusive (the first moment of the next month, UTC)
export const monthRange = (month) => {
  const [year, mon] = month.split('-').map(Number);
  return {
    start: new Date(Date.UTC(year, mon - 1, 1)),
    end: new Date(Date.UTC(year, mon, 1)),
  };
};

export const APPROACHING_THRESHOLD = 80;

export const budgetSummary = (amount, spent) => {
  if (amount == null) return null;
  const percentUsed = Math.round((spent / amount) * 1000) / 10;
  let status = 'within';
  if (spent > amount) status = 'over';
  else if (percentUsed >= APPROACHING_THRESHOLD) status = 'approaching';
  return { amount, spent, remaining: amount - spent, percentUsed, status };
};