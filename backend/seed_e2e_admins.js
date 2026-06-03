const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding E2E Admins...');
  
  const admins = [
    {
      email: 'admin@youthcamping.in',
      password: 'admin@123456',
      name: 'YouthCamping Admin',
      role: 'superadmin'
    },
    {
      email: 'admin@test.com',
      password: 'testpass123',
      name: 'Test Admin',
      role: 'superadmin'
    }
  ];

  for (const a of admins) {
    const hashedPassword = await bcrypt.hash(a.password, 10);
    await prisma.admin.upsert({
      where: { email: a.email },
      update: { password: hashedPassword, role: a.role },
      create: {
        email: a.email,
        password: hashedPassword,
        name: a.name,
        role: a.role,
        tenantId: 'default'
      }
    });
    console.log(`✅ Seeded admin: ${a.email}`);
  }
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
