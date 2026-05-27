const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const trip = await prisma.trip.findFirst({
      where: { id: 'MKA2' }
    });
    console.log('Trip MKA2 availableDates:', JSON.stringify(trip.availableDates, null, 2));
  } catch (err) {
    console.error('Error checking database:', err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
