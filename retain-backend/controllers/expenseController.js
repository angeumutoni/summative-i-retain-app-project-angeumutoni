import mongoose from 'mongoose';
import Expense, { PAYMENT_METHODS } from '../models/Expense.js';
import Category from '../models/Category.js';

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parseDate = (value, endOfDay = false) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  // a plain YYYY-MM-DD end date should include the whole day
  if (endOfDay && /^\d{4}-\d{2}-\d{2}$/.test(value)) date.setUTCHours(23, 59, 59, 999);
  return date;
};

const findCategory = async (id) => {
  if (!id) return Category.findOne({ isDefault: true });
  if (!mongoose.isValidObjectId(id)) return null;
  return Category.findById(id);
};

const badRequest = (res, message) => res.status(400).json({ message });

export const getExpenses = async (req, res) => {
  const {
    search, category, paymentMethod, startDate, endDate,
    minAmount, maxAmount, sortBy = 'date', order = 'desc',
  } = req.query;

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);

  const filter = { user: req.user._id };

  if (search?.trim()) {
    const pattern = new RegExp(escapeRegex(search.trim()), 'i');
    filter.$or = [{ title: pattern }, { notes: pattern }];
  }

  if (category) {
    if (!mongoose.isValidObjectId(category)) return badRequest(res, 'Invalid category id');
    filter.category = category;
  }

  if (paymentMethod) {
    if (!PAYMENT_METHODS.includes(paymentMethod)) return badRequest(res, 'Invalid payment method');
    filter.paymentMethod = paymentMethod;
  }

  const dateFilter = {};
  if (startDate) {
    const start = parseDate(startDate);
    if (!start) return badRequest(res, 'Invalid start date');
    dateFilter.$gte = start;
  }
  if (endDate) {
    const end = parseDate(endDate, true);
    if (!end) return badRequest(res, 'Invalid end date');
    dateFilter.$lte = end;
  }
  if (Object.keys(dateFilter).length) filter.date = dateFilter;

  const amountFilter = {};
  if (minAmount) {
    if (Number.isNaN(Number(minAmount))) return badRequest(res, 'Invalid minimum amount');
    amountFilter.$gte = Number(minAmount);
  }
  if (maxAmount) {
    if (Number.isNaN(Number(maxAmount))) return badRequest(res, 'Invalid maximum amount');
    amountFilter.$lte = Number(maxAmount);
  }
  if (Object.keys(amountFilter).length) filter.amount = amountFilter;

  const sortField = sortBy === 'amount' ? 'amount' : 'date';
  const direction = order === 'asc' ? 1 : -1;

  const [expenses, total] = await Promise.all([
    Expense.find(filter)
      .populate('category', 'name')
      .sort({ [sortField]: direction, _id: direction })
      .skip((page - 1) * limit)
      .limit(limit),
    Expense.countDocuments(filter),
  ]);

  res.json({
    expenses,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
};

export const getExpense = async (req, res) => {
  const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id })
    .populate('category', 'name');
  if (!expense) return res.status(404).json({ message: 'Expense not found' });
  res.json({ expense });
};

export const createExpense = async (req, res) => {
  const { title, amount, category, date, paymentMethod, notes } = req.body;

  if (!title || !String(title).trim()) return badRequest(res, 'Title is required');
  if (!(Number(amount) > 0)) return badRequest(res, 'Amount must be a number greater than 0');
  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    return badRequest(res, `Payment method must be one of: ${PAYMENT_METHODS.join(', ')}`);
  }

  const categoryDoc = await findCategory(category);
  if (!categoryDoc) return badRequest(res, 'Category not found');

  let expenseDate;
  if (date) {
    expenseDate = parseDate(date);
    if (!expenseDate) return badRequest(res, 'Invalid date');
  }

  const expense = await Expense.create({
    user: req.user._id,
    title: String(title).trim(),
    amount: Number(amount),
    category: categoryDoc._id,
    date: expenseDate,
    paymentMethod,
    notes,
  });
  await expense.populate('category', 'name');

  res.status(201).json({ expense });
};

export const updateExpense = async (req, res) => {
  const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
  if (!expense) return res.status(404).json({ message: 'Expense not found' });

  const { title, amount, category, date, paymentMethod, notes } = req.body;

  if (title !== undefined) {
    if (!String(title).trim()) return badRequest(res, 'Title cannot be empty');
    expense.title = String(title).trim();
  }
  if (amount !== undefined) {
    if (!(Number(amount) > 0)) return badRequest(res, 'Amount must be a number greater than 0');
    expense.amount = Number(amount);
  }
  if (category !== undefined) {
    const categoryDoc = await findCategory(category);
    if (!categoryDoc) return badRequest(res, 'Category not found');
    expense.category = categoryDoc._id;
  }
  if (date !== undefined) {
    const parsed = parseDate(date);
    if (!parsed) return badRequest(res, 'Invalid date');
    expense.date = parsed;
  }
  if (paymentMethod !== undefined) {
    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return badRequest(res, `Payment method must be one of: ${PAYMENT_METHODS.join(', ')}`);
    }
    expense.paymentMethod = paymentMethod;
  }
  if (notes !== undefined) expense.notes = notes;

  await expense.save();
  await expense.populate('category', 'name');
  res.json({ expense });
};

export const deleteExpense = async (req, res) => {
  const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!expense) return res.status(404).json({ message: 'Expense not found' });
  res.json({ message: 'Expense deleted' });
};