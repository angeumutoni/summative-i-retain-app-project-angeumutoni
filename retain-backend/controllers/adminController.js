import User from '../models/User.js';
import Expense from '../models/Expense.js';
import Category from '../models/Category.js';
import { currentMonth, monthRange } from '../utils/helpers.js';

export const getInsights = async (req, res) => {
  const { start, end } = monthRange(currentMonth());

  const [totalUsers, totals, expensesThisMonth, categories, usage, recentExpenses, recentUsers] =
    await Promise.all([
      User.countDocuments({ role: 'user' }),
      Expense.aggregate([
        { $group: { _id: null, count: { $sum: 1 }, value: { $sum: '$amount' } } },
      ]),
      Expense.countDocuments({ date: { $gte: start, $lt: end } }),
      Category.find().lean(),
      Expense.aggregate([
        { $group: { _id: '$category', totalSpent: { $sum: '$amount' }, expenseCount: { $sum: 1 } } },
      ]),
      Expense.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('user', 'name email')
        .populate('category', 'name')
        .lean(),
      User.find({ role: 'user' })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('name email createdAt')
        .lean(),
    ]);

  const stats = new Map(usage.map((u) => [String(u._id), u]));
  const perCategory = categories.map((c) => ({
    categoryId: c._id,
    name: c.name,
    totalSpent: stats.get(String(c._id))?.totalSpent ?? 0,
    expenseCount: stats.get(String(c._id))?.expenseCount ?? 0,
  }));

  const byName = (a, b) => a.name.localeCompare(b.name);

  res.json({
    totalUsers,
    totalExpenses: totals[0]?.count ?? 0,
    totalExpenseValue: totals[0]?.value ?? 0,
    expensesThisMonth,
    spendingPerCategory: [...perCategory].sort((a, b) => b.totalSpent - a.totalSpent || byName(a, b)),
    topCategories: [...perCategory]
      .sort((a, b) => b.expenseCount - a.expenseCount || byName(a, b))
      .slice(0, 5),
    bottomCategories: [...perCategory]
      .sort((a, b) => a.expenseCount - b.expenseCount || byName(a, b))
      .slice(0, 5),
    recentExpenses,
    recentUsers,
  });
};