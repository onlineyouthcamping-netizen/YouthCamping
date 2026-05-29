/**
 * YouthCamping Backend Server
 * Launches the Express application and manages core startup connections.
 */

const app = require('./app');
const { prisma } = require('./lib/prisma');

console.log('--- 🚀 YOUTHCAMPING BACKEND (PRISMA STABLE) STARTING UP ---');

// Validate production environment variables
const REQUIRED_ENV_VARS = [
  'PORT',
  'NODE_ENV',
  'DATABASE_URL',
  'DIRECT_URL',
  'JWT_SECRET',
  'FRONTEND_URL',
  'ADMIN_URL',
  'BREVO_API_KEY',
  'EMAIL_FROM',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

const missingVars = REQUIRED_ENV_VARS.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('\x1b[31m%s\x1b[0m', '🛑 FATAL STARTUP FAILURE: Missing required environment variables:');
  missingVars.forEach(v => console.error('\x1b[31m%s\x1b[0m', `   - ${v}`));
  console.error('\x1b[33m%s\x1b[0m', '💡 Please configure these in backend/.env or your production environment settings.');
  process.exit(1);
}

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    console.log('⏳ Connecting to Database...');
    await Promise.race([
      prisma.$connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('DB connection timeout (5s)')), 5000))
    ]);
    console.log('✅ Database connected');
  } catch (error) {
    console.error('⚠️ Database connection failed:', error.message);
  }

  try {
    const { startScheduler } = require('./utils/scheduler');
    startScheduler();
  } catch (e) {
    console.warn('⚠️ Scheduler init skipped');
  }

  app.listen(PORT, () => {
    console.log(`🚀 SERVER RUNNING ON PORT ${PORT}`);
  });
}

startServer();
