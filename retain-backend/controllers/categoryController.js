import Category from '../models/Category.js';
import Expense from '../models/Expense.js';

// case-insensitive matching, so "food" and "Food" count as duplicates
const CI = { locale: 'en', strength: 2 };

export const getCategories = async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json({ categories });
};

export const createCategory = async (req, res) => {
  const name = req.body.name?.trim();
  if (!name) {
    return res.status(400).json({ message: 'Category name is required' });
  }

  const exists = await Category.findOne({ name }).collation(CI);
  if (exists) {
    return res.status(409).json({ message: 'A category with this name already exists' });
  }

  const category = await Category.create({ name });
  res.status(201).json({ category });
};

export const updateCategory = async (req, res) => {
  const name = req.body.name?.trim();
  if (!name) {
    return res.status(400).json({ message: 'Category name is required' });
  }

  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }
  if (category.isDefault) {
    return res.status(400).json({ message: 'The default category cannot be renamed' });
  }

  const duplicate = await Category.findOne({ name, _id: { $ne: category._id } }).collation(CI);
  if (duplicate) {
    return res.status(409).json({ message: 'A category with this name already exists' });
  }

  category.name = name;
  await category.save();
  res.json({ category });
};

export const deleteCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }
  if (category.isDefault) {
    return res.status(400).json({ message: 'The default category cannot be deleted' });
  }

  const fallback = await Category.findOne({ isDefault: true });
  if (!fallback) {
    return res.status(500).json({ message: 'Default category is missing: run the seed script' });
  }

  // move affected expenses to the default category before deleting
  const result = await Expense.updateMany(
    { category: category._id },
    { category: fallback._id }
  );
  await category.deleteOne();

  res.json({
    message: `Category deleted. Expenses moved to "${fallback.name}".`,
    reassignedExpenses: result.modifiedCount,
  });
};