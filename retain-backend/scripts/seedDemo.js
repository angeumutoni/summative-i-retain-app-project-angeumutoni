import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Budget from '../models/Budget.js';
import Category from '../models/Category.js';
import Expense from '../models/Expense.js';
import User from '../models/User.js';


const DEMO_USER = { name: 'Demo User', email: 'demo.user@example.com', password: 'DemoUser-2026', role: 'user' };
const SAMPLE_USERS = [
  { name: 'Aline Sample', email: 'aline.sample@example.com' },
  { name: 'Patrick Sample', email: 'patrick.sample@example.com' },
];
const LEGACY_DEMO_ADMIN_EMAIL = 'demo.admin@example.com';

const now = new Date();
const YEAR = now.getUTCFullYear();
const MONTH = now.getUTCMonth();
const TODAY = now.getUTCDate();

const monthString = (offset) =>
  new Date(Date.UTC(YEAR, MONTH + offset, 1)).toISOString().slice(0, 7);

// Row format: [day of month, title, amount (RWF), category, payment method, notes]
const DEMO_THIS_MONTH = [
  [1, 'Monthly rent', 120000, 'Accommodation', 'bank_transfer', 'Paid to landlord'],
  [2, 'Internet bundle', 25000, 'Utilities', 'mobile_money'],
  [3, 'Groceries', 32000, 'Food', 'card', 'Weekly shop'],
  [4, 'Moto to town', 1500, 'Transport', 'cash'],
  [5, 'Lunch with colleagues', 6500, 'Food', 'mobile_money'],
  [6, 'Bus card top-up', 5000, 'Transport', 'mobile_money'],
  [7, 'Streaming subscription', 9000, 'Subscriptions', 'card'],
  [8, 'Pharmacy', 7500, 'Health', 'cash', 'Vitamins'],
  [9, 'Online course', 30000, 'Education', 'card', 'Course fee'],
  [10, 'Cinema night', 8000, 'Entertainment', 'cash'],
  [11, 'Dinner with family', 12000, 'Food', 'mobile_money'],
  [12, 'Electricity tokens', 15000, 'Utilities', 'mobile_money'],
  [12, 'Gift for a friend', 10000, 'Uncategorized', 'cash'],
];

const DEMO_LAST_MONTH = [
  [1, 'Monthly rent', 120000, 'Accommodation', 'bank_transfer', 'Paid to landlord'],
  [2, 'Internet bundle', 25000, 'Utilities', 'mobile_money'],
  [4, 'Groceries', 29000, 'Food', 'card', 'Weekly shop'],
  [6, 'Moto rides', 4500, 'Transport', 'cash'],
  [8, 'Lunch at the canteen', 5500, 'Food', 'mobile_money'],
  [9, 'Bus card top-up', 5000, 'Transport', 'mobile_money'],
  [10, 'Streaming subscription', 9000, 'Subscriptions', 'card'],
  [13, 'Doctor visit', 15000, 'Health', 'cash'],
  [15, 'Textbooks', 22000, 'Education', 'card'],
  [17, 'Concert ticket', 18000, 'Entertainment', 'mobile_money'],
  [19, 'Groceries', 26500, 'Food', 'card', 'Weekly shop'],
  [22, 'Electricity tokens', 14000, 'Utilities', 'mobile_money'],
  [24, 'Birthday dinner', 16000, 'Food', 'mobile_money', 'Celebration with friends'],
  [27, 'Phone airtime', 3000, 'Utilities', 'mobile_money'],
];

const ADMIN_THIS_MONTH = [
  [3, 'Team lunch', 9000, 'Food', 'cash'],
  [6, 'Moto to office', 2000, 'Transport', 'cash'],
  [9, 'Phone bundle', 5000, 'Utilities', 'mobile_money'],
];

const ALINE_THIS_MONTH = [
  [2, 'Gym membership', 20000, 'Health', 'mobile_money'],
  [5, 'Taxi to the airport', 12000, 'Transport', 'cash'],
  [8, 'Music subscription', 4000, 'Subscriptions', 'card'],
  [11, 'Weekend trip', 45000, 'Accommodation', 'card', 'Two nights away'],
  [12, 'Book purchase', 8000, 'Education', 'cash'],
];

const PATRICK_THIS_MONTH = [
  [1, 'Football tickets', 10000, 'Entertainment', 'cash'],
  [4, 'Fuel', 25000, 'Transport', 'cash'],
  [7, 'Lunch meeting', 7000, 'Food', 'mobile_money'],
  [10, 'Medication', 6000, 'Health', 'cash'],
  [12, 'Streaming bundle', 6500, 'Subscriptions', 'card'],
];

const total = (rows) => rows.reduce((sum, row) => sum + row[2], 0);
const roundTo = (value, step) => Math.round(value / step) * step;

const toExpenses = (userId, rows, monthOffset, categoryIds) =>
  rows.map(([day, title, amount, categoryName, paymentMethod, notes = '']) => {
    const category = categoryIds.get(categoryName);
    if (!category) {
      throw new Error(`Category "${categoryName}" not found. Run "npm run seed" first.`);
    }
    // Never create expenses dated in the future for the current month
    const safeDay = monthOffset === 0 ? Math.min(day, TODAY) : day;
    return {
      user: userId,
      title,
      amount,
      category,
      date: new Date(Date.UTC(YEAR, MONTH + monthOffset, safeDay)),
      paymentMethod,
      notes,
    };
  });

// Deletes a user together with their own expenses and budgets, in the safe order
const removeUserByEmail = async (email) => {
  const existing = await User.findOne({ email });
  if (!existing) return false;
  await Expense.deleteMany({ user: existing._id });
  await Budget.deleteMany({ user: existing._id });
  await existing.deleteOne();
  return true;
};

const resetUser = async ({ name, email, password, role }) => {
  await removeUserByEmail(email);
  return User.create({ name, email, password: await bcrypt.hash(password, 10), role });
};

const main = async () => {
  await connectDB();

  const categories = await Category.find();
  const categoryIds = new Map(categories.map((category) => [category.name, category._id]));

  // The one and only admin is the account created by "npm run seed"
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const admin = adminEmail ? await User.findOne({ email: adminEmail, role: 'admin' }) : null;
  if (!admin) {
    throw new Error('Admin account not found. Set ADMIN_EMAIL in .env and run "npm run seed" first.');
  }

  if (await removeUserByEmail(LEGACY_DEMO_ADMIN_EMAIL)) {
    console.log(`Removed old demo admin account: ${LEGACY_DEMO_ADMIN_EMAIL}`);
  }

  const demoUser = await resetUser(DEMO_USER);
  await Expense.insertMany(toExpenses(demoUser._id, DEMO_LAST_MONTH, -1, categoryIds));
  await Expense.insertMany(toExpenses(demoUser._id, DEMO_THIS_MONTH, 0, categoryIds));

  // Last month finishes comfortably within budget, this month starts at roughly 85% (approaching)
  await Budget.insertMany([
    { user: demoUser._id, month: monthString(-1), amount: roundTo(total(DEMO_LAST_MONTH) / 0.7, 1000) },
    { user: demoUser._id, month: monthString(0), amount: roundTo(total(DEMO_THIS_MONTH) / 0.85, 1000) },
  ]);

  // Giving the admin a few expenses of their own
  await Expense.deleteMany({ user: admin._id });
  await Budget.deleteMany({ user: admin._id });
  await Expense.insertMany(toExpenses(admin._id, ADMIN_THIS_MONTH, 0, categoryIds));

  const sampleRows = [ALINE_THIS_MONTH, PATRICK_THIS_MONTH];
  for (const [index, sample] of SAMPLE_USERS.entries()) {
    // Sample users cannot be signed in to: they exist to give the admin insights some variety
    const user = await resetUser({ ...sample, password: randomUUID(), role: 'user' });
    await Expense.insertMany(toExpenses(user._id, sampleRows[index], 0, categoryIds));
  }

  console.log('Demo data created.');
  console.log(`  User:  ${DEMO_USER.email}  /  ${DEMO_USER.password}`);
  console.log(`  Admin: ${admin.email} (existing account, password unchanged)`);
  console.log(`  Demo user has ${DEMO_LAST_MONTH.length + DEMO_THIS_MONTH.length} expenses and budgets for ${monthString(-1)} and ${monthString(0)}.`);

  await mongoose.disconnect();
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});