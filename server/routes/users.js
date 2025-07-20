const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// Middleware to check JWT and admin
function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const token = auth.split(' ')[1];
    req.user = jwt.verify(token, JWT_SECRET);
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// GET /api/users - List all users
router.get('/', requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// PUT /api/users/:id/approve - Approve pending admin
router.put('/:id/approve', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.status !== 'PENDING_ADMIN') return res.status(400).json({ error: 'User is not pending admin approval' });
    const updated = await prisma.user.update({
      where: { id },
      data: { role: 'ADMIN', status: 'Active' },
      select: { id: true, name: true, email: true, role: true, status: true },
    });
    res.json(updated);
  } catch (err) {
    console.error('Error approving user:', err);
    res.status(500).json({ error: 'Failed to approve user' });
  }
});

// PUT /api/users/:id/decline - Decline pending admin
router.put('/:id/decline', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.status !== 'PENDING_ADMIN') return res.status(400).json({ error: 'User is not pending admin approval' });
    const updated = await prisma.user.update({
      where: { id },
      data: { status: 'Active', role: 'CUSTOMER' },
      select: { id: true, name: true, email: true, role: true, status: true },
    });
    res.json(updated);
  } catch (err) {
    console.error('Error declining user:', err);
    res.status(500).json({ error: 'Failed to decline user' });
  }
});

// POST /api/users - Add user (admin only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, email, role = 'CUSTOMER', status = 'Active', password } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already in use' });
    const pwd = password || Math.random().toString(36).slice(-8);
    const hashed = await bcrypt.hash(pwd, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role, status },
      select: { id: true, name: true, email: true, role: true, status: true },
    });
    res.json(user);
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT /api/users/:id - Edit user (admin only)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, status, password } = req.body;
    const data = {};
    if (name) data.name = name;
    if (email) data.email = email;
    if (role) data.role = role;
    if (status) data.status = status;
    if (password) data.password = await bcrypt.hash(password, 10);
    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, status: true },
    });
    res.json(user);
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /api/users/:id - Delete user (admin only, soft delete)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.update({
      where: { id },
      data: { deleted: true },
    });
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// GET /api/users/notifications - List notifications for current admin
router.get('/notifications', requireAdmin, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { adminId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// PUT /api/users/notifications/:id/read - Mark notification as read
router.put('/notifications/:id/read', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });
    res.json(notification);
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

module.exports = router; 