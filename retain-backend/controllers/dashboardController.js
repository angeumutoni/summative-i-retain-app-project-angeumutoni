import Budget from '../models/Budget.js';
import Expense from '../models/Expense.js';
import {
  currentMonth, isValidMonth, monthRange, budgetSummary,
} from '../utils/helpers.js';

export const getDashboard = async (req, res) => {
  const month = req.query.month || currentMonth();
  if (!isValidMonth(month)) {
    return res.status(400).json({ message: 'Month must be in YYYY-MM format' });
  }

  const { start, end } = monthRange(month);
  const match = { user: req.user._id, date: { $gte: start, $lt: end } };

  const [totals, budget, highest, byCategory, recent] = await Promise.all([
    Expense.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    Budget.findOne({ user: req.user._id, month }),
    Expense.findOne(match).sort({ amount: -1 }).populate('category', 'name'),
    Expense.aggregate([
      { $match: match },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: '$category' },
      { $project: { _id: 0, categoryId: '$_id', name: '$category.name', total: 1, count: 1 } },
      { $sort: { total: -1 } },
    ]),
    Expense.find(match).sort({ date: -1, _id: -1 }).limit(5).populate('category', 'name'),
  ]);

  const totalSpent = totals[0]?.total ?? 0;

  res.json({
    month,
    totalSpent,
    expenseCount: totals[0]?.count ?? 0,
    budget: budgetSummary(budget?.amount, totalSpent),
    highestExpense: highest,
    spendingByCategory: byCategory,
    recentExpenses: recent,
  });
};