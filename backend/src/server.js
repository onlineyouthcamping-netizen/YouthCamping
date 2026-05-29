/**
 * YouthCamping Backend Server
 * Launches the Express application and manages core startup connections.
 */

const app = require('./app');
const { prisma } = require('./lib/prisma');

console.log('--- 🚀 YOUTHCAMPING BACKEND (PRISMA STABLE) STARTING UP ---');

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
