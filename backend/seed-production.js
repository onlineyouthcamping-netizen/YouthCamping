const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || 'admin@youthcamping.online').toLowerCase().trim();
  const password = (process.env.ADMIN_PASSWORD || 'admin@123456').trim();
  
  console.log(`🚀 Seeding secure hashed admin user into database for: ${email}`);
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const existing = await prisma.admin.findUnique({
    where: { email }
  });
  
  if (existing) {
    await prisma.admin.update({
      where: { email },
      data: { password: hashedPassword, role: 'superadmin' }
    });
    console.log('✅ Admin password updated to secure hashed format successfully!');
  } else {
    await prisma.admin.create({
      data: {
        id: 'admin_master_prod',
        email,
        password: hashedPassword,
        name: 'Super Admin',
        role: 'superadmin',
        tenantId: 'default'
      }
    });
    console.log('✅ Hashed admin account seeded successfully!');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
