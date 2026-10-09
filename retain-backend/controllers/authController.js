import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name?.trim() || !email?.trim() || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ message: 'An account with this email already exists' });
  }

  const hashed = await bcrypt.hash(password, 10);
  // role is never read from the request: everyone who signs up is a normal user
  const user = await User.create({ name, email, password: hashed, role: 'user' });

  res.status(201).json({ token: signToken(user._id), user: publicUser(user) });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // password has select:false on the schema, so it must be requested explicitly
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  const valid = user && (await bcrypt.compare(password, user.password));

  if (!valid) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  res.json({ token: signToken(user._id), user: publicUser(user) });
};

export const getMe = async (req, res) => {
  res.json({ user: publicUser(req.user) });
};