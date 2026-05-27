const { prisma } = require('../lib/prisma');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// In-memory store for OTPs: phone -> { otp, expiresAt }
const otpStore = new Map();

const generateToken = (id, role, tenantId = 'default') => {
  return jwt.sign({ id, role, tenantId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    const tenantId = req.headers['x-tenant-id'] || 'default';

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        tenantId
      }
    });

    const token = generateToken(user.id, user.role, user.tenantId);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user.id, user.role, user.tenantId);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findFirst({
      where: { id: req.user.id, tenantId: req.user.tenantId }
    });
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: { tenantId: req.user.tenantId },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await prisma.user.updateMany({
      where: { id: req.params.id, tenantId: req.user.tenantId },
      data: { role }
    });

    if (user.count === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User role updated' });
  } catch (error) {
    next(error);
  }
};

exports.sendOTP = async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    const cleanPhone = phone.replace(/[^\d+]/g, '');

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    otpStore.set(cleanPhone, { otp, expiresAt });

    console.log('\n==================================================');
    console.log('📲 [WHATSAPP OTP SIMULATOR]');
    console.log(`Sending verification code to: ${cleanPhone}`);
    console.log(`Message: Your YouthCamping verification code is: ${otp}`);
    console.log(`WhatsApp Link: https://wa.me/${cleanPhone.replace('+', '')}?text=Your%20YouthCamping%20verification%2520code%2520is%2520${otp}`);
    console.log('==================================================\n');

    res.status(200).json({ 
      success: true, 
      message: 'OTP sent successfully (Simulated over WhatsApp)',
      otp: process.env.NODE_ENV === 'development' || !process.env.NODE_ENV ? otp : undefined
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyOTP = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
    }

    const cleanPhone = phone.replace(/[^\d+]/g, '');
    const record = otpStore.get(cleanPhone);

    if (!record) {
      return res.status(400).json({ success: false, message: 'No OTP requested for this phone number' });
    }

    if (new Date() > record.expiresAt) {
      otpStore.delete(cleanPhone);
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    otpStore.delete(cleanPhone);
    const tenantId = req.headers['x-tenant-id'] || 'default';

    let user = await prisma.user.findFirst({
      where: { phone: cleanPhone }
    });

    if (!user) {
      const email = `user_${cleanPhone.replace('+', '')}@youthcamping.online`;
      user = await prisma.user.findUnique({
        where: { email }
      });
    }

    if (!user) {
      const email = `user_${cleanPhone.replace('+', '')}@youthcamping.online`;
      const randomPassword = Math.random().toString(36).substring(2, 15);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      
      user = await prisma.user.create({
        data: {
          name: `Guest ${cleanPhone}`,
          email,
          password: hashedPassword,
          phone: cleanPhone,
          tenantId,
          role: 'user'
        }
      });
      console.log(`👤 [OTP AUTH] Auto-created new user for phone ${cleanPhone}: ID ${user.id}`);
    }

    const token = generateToken(user.id, user.role, user.tenantId);

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
