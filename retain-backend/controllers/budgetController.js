import Budget from '../models/Budget.js';
import Expense from '../models/Expense.js';
import { isValidMonth, monthRange, budgetSummary } from '../utils/helpers.js';

const buildState = async (userId, month) => {
  const { start, end } = monthRange(month);
  const [budget, totals] = await Promise.all([
    Budget.findOne({ user: userId, month }),
    Expense.aggregate([
      { $match: { user: userId, date: { $gte: start, $lt: end } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);
  const spent = totals[0]?.total ?? 0;
  return { month, spent, budget: budgetSummary(budget?.amount, spent) };
};

export const getBudget = async (req, res) => {
  const { month } = req.params;
  if (!isValidMonth(month)) {
    return res.status(400).json({ message: 'Month must be in YYYY-MM format' });
  }
  res.json(await buildState(req.user._id, month));
};

export const setBudget = async (req, res) => {
  const { month } = req.params;
  const amount = Number(req.body.amount);

  if (!isValidMonth(month)) {
    return res.status(400).json({ message: 'Month must be in YYYY-MM format' });
  }
  if (!(amount > 0)) {
    return res.status(400).json({ message: 'Budget amount must be a number greater than 0' });
  }

  await Budget.findOneAndUpdate(
    { user: req.user._id, month },
    { amount },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );

  res.json(await buildState(req.user._id, month));
};