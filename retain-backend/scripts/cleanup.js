import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Budget from '../models/Budget.js';
import Expense from '../models/Expense.js';
import User from '../models/User.js';

const emails = process.argv
  .slice(2)
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const cleanup = async () => {
  if (emails.length === 0) {
    console.log('Usage: npm run cleanup -- email1@example.com email2@example.com');
    return;
  }

  await connectDB();

  for (const email of emails) {
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`Not found: ${email}`);
      continue;
    }
    if (user.role === 'admin') {
      console.log(`Skipped admin account: ${email}`);
      continue;
    }

    const expenses = await Expense.deleteMany({ user: user._id });
    const budgets = await Budget.deleteMany({ user: user._id });
    await user.deleteOne();
    console.log(`Deleted ${email}: ${expenses.deletedCount} expenses, ${budgets.deletedCount} budgets`);
  }

  await mongoose.disconnect();
};

cleanup().catch((error) => {
  console.error(error);
  process.exit(1);
});