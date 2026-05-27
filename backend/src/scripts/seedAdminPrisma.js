const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
require('dotenv').config();

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@youthcamping.online';
  const password = process.env.ADMIN_PASSWORD || 'admin@123456';

  console.log(`Checking admin for: ${email}`);

  const existingAdmin = await prisma.admin.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    await prisma.admin.update({
      where: { email },
      data: { password },
    });
    console.log('✅ Admin password updated successfully!');
  } else {
    await prisma.admin.create({
      data: {
        email,
        password,
        name: 'Super Admin',
        role: 'superadmin',
      },
    });
    console.log('✅ Admin account created successfully!');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
