const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { z } = require('zod');

const workshopSchema = z.object({
  title: z.string().min(2),
  instructor: z.string().optional(),
  date: z.string().optional(),
  maxCapacity: z.number().int().min(1),
  status: z.enum(['Active', 'Completed', 'Draft']).optional(),
});

// GET /api/workshops - Retrieve all active workshops with time slots, filter by search and category, support pagination
router.get('/', async (req, res) => {
  try {
    const { search, category, page = 1, limit = 8 } = req.query;
    const pageInt = parseInt(page, 10) || 1;
    const limitInt = parseInt(limit, 10) || 8;
    const skip = (pageInt - 1) * limitInt;
    const where = {
      deleted: false,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(category && category !== '' && { category }),
    };
    const [workshops, total] = await Promise.all([
      prisma.workshop.findMany({
        where,
        include: {
          timeSlots: { where: { deleted: false } },
        },
        orderBy: { date: 'asc' },
        skip,
        take: limitInt,
      }),
      prisma.workshop.count({ where }),
    ]);
    res.json({ workshops, total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch workshops' });
  }
});

// POST /api/workshops - Create a new workshop
router.post('/', async (req, res) => {
  try {
    const data = workshopSchema.parse(req.body);
    const workshop = await prisma.workshop.create({
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
        status: data.status || 'Active',
      },
    });
    res.json(workshop);
  } catch (err) {
    res.status(400).json({ error: err.errors ? err.errors[0].message : 'Failed to create workshop' });
  }
});

// PUT /api/workshops/:id - Update a workshop
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = workshopSchema.parse(req.body);
    const workshop = await prisma.workshop.update({
      where: { id },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
      },
    });
    res.json(workshop);
  } catch (err) {
    res.status(400).json({ error: err.errors ? err.errors[0].message : 'Failed to update workshop' });
  }
});

// DELETE /api/workshops/:id - Soft delete a workshop
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.workshop.update({
      where: { id },
      data: { deleted: true },
    });
    res.json({ message: 'Workshop deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete workshop' });
  }
});

module.exports = router; 