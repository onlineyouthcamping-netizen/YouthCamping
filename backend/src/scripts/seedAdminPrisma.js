require('../lib/env');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const requireEnvironmentValue = (name) => {
  const value = String(process.env[name] || '').trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
};

async function main() {
  const email = requireEnvironmentValue('ADMIN_EMAIL');
  const password = requireEnvironmentValue('ADMIN_PASSWORD');

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
