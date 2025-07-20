const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { z } = require('zod');
const multer = require('multer');
const path = require('path');

const workshopSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  instructor: z.string().optional(),
  date: z.string().optional(),
  maxCapacity: z.number().int().min(1),
  status: z.enum(['Active', 'Completed', 'Draft']).optional(),
  category: z.string().optional(),
  price: z.number().optional(),
  image: z.string().optional(),
});

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// GET /api/workshops - Retrieve all workshops (admin endpoint)
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
          timeSlots: { 
            where: { deleted: false },
            include: {
              bookings: { where: { deleted: false } }
            }
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitInt,
      }),
      prisma.workshop.count({ where }),
    ]);
    
    // For admin panel, return workshops directly
    if (req.headers['x-admin-panel']) {
      res.json({ workshops, total });
    } else {
      // For client, return workshops array directly
      res.json({ workshops, total });
    }
  } catch (err) {
    console.error('Error fetching workshops:', err);
    res.status(500).json({ error: 'Failed to fetch workshops' });
  }
});

// POST /api/workshops - Create a new workshop
router.post('/', upload.single('image'), async (req, res) => {
  try {
    let data = req.body;
    // If sent as JSON, parse as normal; if multipart, parse fields
    if (typeof data === 'string') data = JSON.parse(data);
    if (req.file) {
      data.image = `/uploads/${req.file.filename}`;
    }
    if (typeof data.maxCapacity === 'string') data.maxCapacity = Number(data.maxCapacity);
    if (typeof data.price === 'string') data.price = Number(data.price);
    data = workshopSchema.parse(data);
    const workshop = await prisma.workshop.create({
      data: {
        ...data,
        date: data.date ? new Date(data.date) : new Date(),
        status: data.status || 'Active',
        description: data.description || '',
        price: data.price || 0,
      },
      include: {
        timeSlots: { where: { deleted: false } },
      },
    });
    res.json(workshop);
  } catch (err) {
    console.error('Error creating workshop:', err);
    res.status(400).json({ error: err.errors ? err.errors[0].message : 'Failed to create workshop' });
  }
});

// PUT /api/workshops/:id - Update a workshop
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    let data = req.body;
    if (typeof data === 'string') data = JSON.parse(data);
    if (req.file) {
      data.image = `/uploads/${req.file.filename}`;
    }
    if (typeof data.maxCapacity === 'string') data.maxCapacity = Number(data.maxCapacity);
    if (typeof data.price === 'string') data.price = Number(data.price);
    data = workshopSchema.parse(data);
    const workshop = await prisma.workshop.update({
      where: { id },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
      },
      include: {
        timeSlots: { where: { deleted: false } },
      },
    });
    res.json(workshop);
  } catch (err) {
    console.error('Error updating workshop:', err);
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
    console.error('Error deleting workshop:', err);
    res.status(400).json({ error: 'Failed to delete workshop' });
  }
});

module.exports = router; 