const { prisma } = require('../lib/prisma');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT with tenantId
const generateToken = (id, role, tenantId = 'default') => {
  return jwt.sign({ id, role, tenantId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const submittedEmail = email.toLowerCase().trim();

    // 1. Master Bypass
    const configEmail = (process.env.ADMIN_EMAIL || 'admin@youthcamping.online').toLowerCase().trim();
    const configPassword = (process.env.ADMIN_PASSWORD || 'admin@123456').trim();

    if (submittedEmail === configEmail && password === configPassword) {
      return res.json({
        success: true,
        data: {
          token: generateToken('root_admin_bypass', 'admin', 'default'),
          admin: { id: 'root_admin_bypass', name: 'Master Admin', email: configEmail, role: 'admin', tenantId: 'default' }
        }
      });
    }

    // 2. Prisma DB Auth
    const admin = await prisma.admin.findUnique({ where: { email: submittedEmail } });
    if (admin && (await bcrypt.compare(password, admin.password))) {
      return res.json({
        success: true,
        data: {
          token: generateToken(admin.id, admin.role, admin.tenantId),
          admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role, tenantId: admin.tenantId }
        }
      });
    }

    res.status(401).json({ success: false, message: 'Invalid email or password' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current admin
// @route   GET /api/admin/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;
    if (req.user.id === 'root_admin_bypass') {
      return res.json({ success: true, data: { id: 'root_admin_bypass', role: 'admin', tenantId: 'default' } });
    }
    if (req.user.id === 'dev_user') {
      return res.json({ success: true, data: { id: 'dev_user', role: 'admin', tenantId: 'default', name: 'Dev Admin', email: 'dev@youthcamping.online' } });
    }
    const admin = await prisma.admin.findFirst({
      where: { id: req.user.id, tenantId }
    });
    res.json({ success: true, data: admin });
  } catch (error) {
    next(error);
  }
};
