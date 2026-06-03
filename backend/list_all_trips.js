const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function check() {
  const trips = await prisma.trip.findMany({ select: { title: true, slug: true, status: true } });
  console.log(trips);
}
check().finally(() => prisma.$disconnect());
