const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@workshop.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@workshop.com',
      password: '$2a$10$adminhashedpassword',
      role: 'ADMIN',
    },
  });
  const customer = await prisma.user.upsert({
    where: { email: 'emily.chen@example.com' },
    update: {},
    create: {
      name: 'Emily Chen',
      email: 'emily.chen@example.com',
      password: '$2a$10$customerhashedpassword',
      role: 'CUSTOMER',
    },
  });

  // Create multiple workshops with images and categories
  const workshops = [
    {
      title: 'Digital Photography Masterclass: Advanced Techniques',
      description: 'Learn advanced photography skills from industry experts.',
      date: new Date('2024-11-03T09:00:00Z'),
      maxCapacity: 20,
      image: '/3.png',
      category: 'Tech',
      price: Math.floor(Math.random() * 81) + 20, // $20-$100
      timeSlots: [
        { startTime: '09:00 AM', endTime: '12:00 PM', availableSpots: 10 },
        { startTime: '01:00 PM', endTime: '03:00 PM', availableSpots: 10 },
      ],
    },
    {
      title: 'Yoga for Beginners',
      description: 'A relaxing introduction to yoga.',
      date: new Date('2024-12-01T10:00:00Z'),
      maxCapacity: 15,
      image: '/5.png',
      category: 'Wellness',
      price: Math.floor(Math.random() * 81) + 20,
      timeSlots: [
        { startTime: '10:00 AM', endTime: '11:30 AM', availableSpots: 15 },
      ],
    },
    {
      title: 'Creative Writing: Crafting Compelling Stories',
      description: 'Unlock your creativity and learn to write engaging stories.',
      date: new Date('2024-12-10T14:00:00Z'),
      maxCapacity: 12,
      image: '/2.png',
      category: 'Art',
      price: Math.floor(Math.random() * 81) + 20,
      timeSlots: [
        { startTime: '02:00 PM', endTime: '04:00 PM', availableSpots: 12 },
      ],
    },
    {
      title: 'Beginner Coding Bootcamp',
      description: 'Start your journey into programming with hands-on projects.',
      date: new Date('2024-12-15T09:00:00Z'),
      maxCapacity: 18,
      image: '/1.png',
      category: 'Tech',
      price: Math.floor(Math.random() * 81) + 20,
      timeSlots: [
        { startTime: '09:00 AM', endTime: '12:00 PM', availableSpots: 18 },
      ],
    },
    {
      title: 'Artisan Bread Baking',
      description: 'Master the art of baking delicious artisan bread.',
      date: new Date('2024-12-20T13:00:00Z'),
      maxCapacity: 10,
      image: '/4.png',
      category: 'Art',
      price: Math.floor(Math.random() * 81) + 20,
      timeSlots: [
        { startTime: '01:00 PM', endTime: '03:00 PM', availableSpots: 10 },
      ],
    },
  ];

  for (const w of workshops) {
    const workshop = await prisma.workshop.create({
      data: {
        title: w.title,
        description: w.description,
        date: w.date,
        maxCapacity: w.maxCapacity,
        image: w.image,
        category: w.category,
        price: w.price,
        timeSlots: {
          create: w.timeSlots,
        },
      },
    });
  }

  // Create a booking for demonstration
  const firstWorkshop = await prisma.workshop.findFirst({ where: { title: 'Digital Photography Masterclass: Advanced Techniques' }, include: { timeSlots: true } });
  await prisma.booking.upsert({
    where: { bookingCode: 'WB-PXD-4567' },
    update: {},
    create: {
      bookingCode: 'WB-PXD-4567',
      status: 'CONFIRMED',
      userId: customer.id,
      workshopId: firstWorkshop.id,
      timeSlotId: firstWorkshop.timeSlots[0].id,
      attendeeName: customer.name,
      attendeeEmail: customer.email,
      numAttendees: 1,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 