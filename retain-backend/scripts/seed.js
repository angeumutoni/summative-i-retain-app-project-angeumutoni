import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Category from '../models/Category.js';
import User from '../models/User.js';

const CATEGORIES = [
  'Food', 'Transport', 'Accommodation', 'Subscriptions',
  'Utilities', 'Health', 'Entertainment', 'Education',
];

const seed = async () => {
  await connectDB();

  await Category.updateOne(
    { name: 'Uncategorized' },
    { $setOnInsert: { name: 'Uncategorized', isDefault: true } },
    { upsert: true }
  );
  for (const name of CATEGORIES) {
    await Category.updateOne({ name }, { $setOnInsert: { name } }, { upsert: true });
  }
  console.log('Categories seeded');

  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.log('ADMIN_EMAIL / ADMIN_PASSWORD not set: skipping admin creation');
  } else {
    const exists = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
    if (exists) {
      console.log('Admin already exists, skipping');
    } else {
      await User.create({
        name: ADMIN_NAME || 'Admin',
        email: ADMIN_EMAIL,
        password: await bcrypt.hash(ADMIN_PASSWORD, 10),
        role: 'admin',
      });
      console.log(`Admin created: ${ADMIN_EMAIL}`);
    }
  }

  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});