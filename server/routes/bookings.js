const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const { z } = require('zod');

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// Middleware to check JWT
function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const token = auth.split(' ')[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

const bookingSchema = z.object({
  workshopId: z.string(),
  timeSlotId: z.string(),
  attendeeName: z.string().min(2),
  attendeeEmail: z.string().email(),
});

// GET /api/bookings - Admin: fetch all bookings with filters, pagination, and search
router.get('/', requireAuth, async (req, res) => {
  try {
    // Only allow admin
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    const { search = '', status, workshopId, startDate, endDate, page = 1, limit = 10 } = req.query;
    const pageInt = parseInt(page, 10) || 1;
    const limitInt = parseInt(limit, 10) || 10;
    const skip = (pageInt - 1) * limitInt;
    
    const where = {
      deleted: false,
      ...(status && { status }),
      ...(workshopId && { workshopId }),
      ...(startDate && endDate && {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      }),
      ...(search && {
        OR: [
          { attendeeName: { contains: search, mode: 'insensitive' } },
          { attendeeEmail: { contains: search, mode: 'insensitive' } },
          { bookingCode: { contains: search, mode: 'insensitive' } },
        ]
      })
    };
    
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          user: true,
          workshop: true,
          timeSlot: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitInt,
      }),
      prisma.booking.count({ where }),
    ]);
    
    res.json({ bookings, total });
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// GET /api/bookings/my - Get user's bookings
router.get('/my', requireAuth, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { 
        userId: req.user.userId,
        deleted: false 
      },
      include: {
        workshop: {
          include: { timeSlots: { where: { deleted: false } } }
        },
        timeSlot: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// POST /api/bookings - Create a booking
router.post('/', requireAuth, async (req, res) => {
  try {
    const { workshopId, timeSlotId, attendeeName, attendeeEmail } = bookingSchema.parse(req.body);
    
    // Check available spots
    const slot = await prisma.timeSlot.findUnique({ where: { id: timeSlotId } });
    if (!slot || slot.availableSpots < 1) {
      return res.status(400).json({ error: 'No spots available for this time slot.' });
    }
    
    // Create booking
    const booking = await prisma.booking.create({
      data: {
        bookingCode: `WB-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        status: 'CONFIRMED',
        userId: req.user.userId,
        workshopId,
        timeSlotId,
        attendeeName,
        attendeeEmail,
        numAttendees: 1,
      },
      include: {
        workshop: true,
        timeSlot: true,
      }
    });
    
    // Decrement available spots
    await prisma.timeSlot.update({
      where: { id: timeSlotId },
      data: { availableSpots: { decrement: 1 } },
    });
    
    // Notify all admins
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN', deleted: false } });
    const notifications = admins.map(admin => ({
      type: 'NEW_BOOKING',
      message: `New booking by ${attendeeName} for ${booking.workshop.title}`,
      adminId: admin.id
    }));
    if (notifications.length) {
      await prisma.notification.createMany({ data: notifications });
    }
    
    res.json({ confirmationId: booking.bookingCode });
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(400).json({ error: err.errors ? err.errors[0].message : 'Booking failed' });
  }
});

// PUT /api/bookings/:id - Update booking (admin only)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, attendeeName, attendeeEmail } = req.body;

    // Only admin can update bookings
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { user: true }
    });
    
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const updateData = {};
    if (status) updateData.status = status;
    if (attendeeName) updateData.attendeeName = attendeeName;
    if (attendeeEmail) updateData.attendeeEmail = attendeeEmail;

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        user: true,
        workshop: true,
        timeSlot: true,
      }
    });
    
    res.json(updatedBooking);
  } catch (err) {
    console.error('Error updating booking:', err);
    res.status(400).json({ error: 'Failed to update booking' });
  }
});

// DELETE /api/bookings/:id - Cancel booking (admin only)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Only admin can delete bookings
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

    console.log('Attempting to delete booking with ID:', id);

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { timeSlot: true }
    });
    
    if (!booking) {
      console.log('Booking not found for ID:', id);
      return res.status(404).json({ error: 'Booking not found' });
    }

    console.log('Found booking:', booking);

    if (booking.status === 'CANCELED') {
      return res.status(400).json({ error: 'Booking already canceled' });
    }

    // Update booking status to CANCELED (soft delete)
    await prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELED',
        updatedAt: new Date()
      }
    });

    // Increment available spots back if the booking was confirmed
    if (booking.status === 'CONFIRMED' && booking.timeSlot) {
      await prisma.timeSlot.update({
        where: { id: booking.timeSlotId },
        data: { availableSpots: { increment: 1 } }
      });
    }

    res.json({ message: 'Booking canceled successfully' });
  } catch (err) {
    console.error('Error canceling booking:', err);
    res.status(400).json({ error: 'Failed to cancel booking: ' + err.message });
  }
});

// GET /api/bookings/:confirmationId - Get booking details by confirmation ID
router.get('/:confirmationId', async (req, res) => {
  try {
    const { confirmationId } = req.params;
    const booking = await prisma.booking.findUnique({
      where: { bookingCode: confirmationId },
      include: {
        workshop: true,
        timeSlot: true,
        user: true,
      },
    });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    console.error('Error fetching booking details:', err);
    res.status(500).json({ error: 'Failed to fetch booking details' });
  }
});

module.exports = router; 