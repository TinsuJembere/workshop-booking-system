const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// Zod schemas
const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const subscriberSchema = z.object({
  email: z.string().email(),
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already in use' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: 'CUSTOMER' },
    });
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(400).json({ error: err.errors ? err.errors[0].message : 'Invalid data' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(400).json({ error: err.errors ? err.errors[0].message : 'Invalid data' });
  }
});

// POST /api/subscribe - Newsletter subscription
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = subscriberSchema.parse(req.body);
    // Check if already subscribed
    const existing = await prisma.subscriber.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already subscribed' });
    await prisma.subscriber.create({ data: { email } });
    res.json({ message: 'Subscribed successfully' });
  } catch (err) {
    res.status(400).json({ error: err.errors ? err.errors[0].message : 'Subscription failed' });
  }
});

module.exports = router; 