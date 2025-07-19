const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/stats/overview - Dashboard summary stats
router.get('/overview', async (req, res) => {
  try {
    const [totalBookings, activeWorkshops, availableSlots, workshopsWithBookings] = await Promise.all([
      prisma.booking.count({}),
      prisma.workshop.count({ where: { deleted: false } }),
      prisma.timeSlot.aggregate({ _sum: { availableSpots: true }, where: { deleted: false } }),
      prisma.workshop.findMany({
        where: {
          deleted: false,
          bookings: {
            some: {},
          },
        },
        select: { price: true },
      }),
    ]);
    const revenue = workshopsWithBookings.reduce((sum, w) => sum + (w.price || 0), 0);
    res.json({
      totalBookings,
      activeWorkshops,
      availableSlots: availableSlots._sum.availableSpots || 0,
      revenue,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch overview stats' });
  }
});

// GET /api/stats/monthly - Monthly bookings/cancellations for last 6 months
router.get('/monthly', async (req, res) => {
  try {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: d.toLocaleString('default', { month: 'short' }),
        year: d.getFullYear(),
        month: d.getMonth() + 1
      });
    }
    const data = await Promise.all(months.map(async ({ year, month, label }) => {
      const bookings = await prisma.booking.count({
        where: {
          createdAt: {
            gte: new Date(year, month - 1, 1),
            lt: new Date(year, month, 1)
          },
          status: 'CONFIRMED'
        }
      });
      const cancellations = await prisma.booking.count({
        where: {
          updatedAt: {
            gte: new Date(year, month - 1, 1),
            lt: new Date(year, month, 1)
          },
          status: 'CANCELED'
        }
      });
      return { month: label, bookings, cancellations };
    }));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch monthly stats' });
  }
});

// GET /api/stats/popularity - Workshop popularity (bookings per category)
router.get('/popularity', async (req, res) => {
  try {
    const categories = await prisma.workshop.groupBy({
      by: ['category'],
      _count: { _all: true },
      where: { deleted: false }
    });
    res.json(categories.map(c => ({ name: c.category, value: c._count._all })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch popularity stats' });
  }
});

// GET /api/stats/recent-bookings - Recent bookings (last 8)
router.get('/recent-bookings', async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: {
        workshop: true,
        timeSlot: true,
        user: true
      }
    });
    res.json(bookings.map(b => ({
      id: b.bookingCode,
      customer: b.attendeeName || (b.user && b.user.name),
      workshop: b.workshop ? b.workshop.title : '',
      date: b.timeSlot ? b.timeSlot.date : '',
      time: b.timeSlot ? b.timeSlot.startTime : '',
      status: b.status
    })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recent bookings' });
  }
});

module.exports = router; 