const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { z } = require('zod');

const timeSlotSchema = z.object({
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  availableSpots: z.number().int().min(0),
  workshopId: z.string().min(1),
});

// GET /api/timeslots - List time slots with filters/search
router.get('/', async (req, res) => {
  try {
    const { search = '', workshopId, status, date } = req.query;
    const where = {
      deleted: false,
      ...(workshopId && { workshopId }),
      ...(date && { createdAt: { gte: new Date(date + 'T00:00:00Z'), lt: new Date(date + 'T23:59:59Z') } }),
    };
    let slots = await prisma.timeSlot.findMany({
      where,
      include: { 
        workshop: true,
        bookings: { 
          where: { deleted: false },
          include: { user: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    // Filter by status (Available/Booked)
    if (status === 'Available') slots = slots.filter(s => s.availableSpots > 0);
    if (status === 'Booked') slots = slots.filter(s => s.availableSpots === 0);
    // Filter by search (workshop title or time)
    if (search) {
      slots = slots.filter(s =>
        (s.workshop?.title || '').toLowerCase().includes(search.toLowerCase()) ||
        s.startTime.toLowerCase().includes(search.toLowerCase()) ||
        s.endTime.toLowerCase().includes(search.toLowerCase())
      );
    }
    res.json(slots);
  } catch (err) {
    console.error('Error fetching time slots:', err);
    res.status(500).json({ error: 'Failed to fetch time slots' });
  }
});

// POST /api/timeslots - Add a new time slot
router.post('/', async (req, res) => {
  try {
    const data = timeSlotSchema.parse(req.body);
    const slot = await prisma.timeSlot.create({
      data,
      include: { 
        workshop: true,
        bookings: { 
          where: { deleted: false },
          include: { user: true }
        }
      },
    });
    res.json(slot);
  } catch (err) {
    console.error('Error creating time slot:', err);
    res.status(400).json({ error: err.errors ? err.errors[0].message : 'Failed to create time slot' });
  }
});

// PUT /api/timeslots/:id - Edit a time slot
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = timeSlotSchema.parse(req.body);
    const slot = await prisma.timeSlot.update({
      where: { id },
      data,
      include: { 
        workshop: true,
        bookings: { 
          where: { deleted: false },
          include: { user: true }
        }
      },
    });
    res.json(slot);
  } catch (err) {
    console.error('Error updating time slot:', err);
    res.status(400).json({ error: err.errors ? err.errors[0].message : 'Failed to update time slot' });
  }
});

// DELETE /api/timeslots/:id - Soft delete a time slot
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.timeSlot.update({
      where: { id },
      data: { deleted: true },
    });
    res.json({ message: 'Time slot deleted' });
  } catch (err) {
    console.error('Error deleting time slot:', err);
    res.status(400).json({ error: 'Failed to delete time slot' });
  }
});

module.exports = router; 