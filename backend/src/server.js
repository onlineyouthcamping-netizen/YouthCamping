/**
 * YouthCamping Backend Server
 * Stabilized on Supabase (PostgreSQL) + Prisma ORM
 */

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const { prisma } = require('./lib/prisma');

console.log('--- 🚀 YOUTHCAMPING BACKEND (PRISMA STABLE) STARTING UP ---');

// 1. App initialization
const app = express();
app.set('trust proxy', 1);

// ISSUE 1 - CORS (MUST BE FIRST)
const cors = require('cors');
const allowedOrigins = [
  'https://youthcamping.online',
  'https://www.youthcamping.online'
];

if (process.env.FRONTEND_URL) allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ''));
if (process.env.CLIENT_URL) allowedOrigins.push(process.env.CLIENT_URL.replace(/\/$/, ''));

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const normalizedOrigin = origin.replace(/\/$/, '');
    
    // Check if origin is in allowedOrigins list
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }
    
    // Check if it is a localhost origin
    if (/^https?:\/\/localhost(:\d+)?$/i.test(normalizedOrigin) || /^https?:\/\/127\.0\.0\.1(:\d+)?$/i.test(normalizedOrigin)) {
      return callback(null, true);
    }
    
    // Check if origin is a Vercel preview domain
    if (/\.vercel\.app$/i.test(normalizedOrigin) || /patelparth3315/i.test(normalizedOrigin)) {
      return callback(null, true);
    }
    
    // Reject other origins
    callback(null, false);
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ISSUE 2 - PORT
const PORT = process.env.PORT || 3000;

// ISSUE 4 - Health Check (Before all other routes)
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// 2. Security & Middleware
app.use(helmet({ 
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false 
}));
app.use(compression());
app.use(express.json({ limit: '15mb' }));
app.use(morgan('dev'));

// 3. Import & Mount Routes
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/trips', require('./routes/tripRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/inquiries', require('./routes/inquiryRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/vendors', require('./routes/vendorRoutes'));
app.use('/api/quotations', require('./routes/quotationRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/emails', require('./routes/emailRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/attractions', require('./routes/attractionRoutes'));
app.use('/api/seo', require('./routes/seoRoutes'));
app.use('/api/booking-forms', require('./routes/bookingFormRoutes'));
app.use('/api/dynamic-forms', require('./routes/dynamicFormRoutes'));
app.use('/api/page-builder', require('./routes/pageBuilderRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/theme', require('./routes/themeRoutes'));

// Serve Static Files (MUST BE AFTER ROUTES TO NOT INTERFERE WITH API)
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// ISSUE 5 - Revalidation Proxy (Prevent Admin 404s)
app.post('/api/revalidate', (req, res) => {
  console.log(`♻️ [REVALIDATE] Requested for path: ${req.body.path || 'all'}`);
  res.json({ success: true, message: 'Revalidation request received' });
});

// 4. Global Error Handler
app.use((err, req, res, next) => {
  console.error('🔥 [GLOBAL ERROR]:', err.stack);
  res.status(err.status || 500).json({ 
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// 5. 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// 6. Startup Logic
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
