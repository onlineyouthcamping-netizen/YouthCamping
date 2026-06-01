const { prisma } = require('../lib/prisma');

const SETTINGS_KEY = 'global_settings';

exports.getSettings = async (req, res) => {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: SETTINGS_KEY }
    });

    if (!setting) {
      // Return default settings if none exist
      return res.json({ 
        success: true, 
        data: {
          bookingForm: {
            roomSharingOptions: [
              { label: 'Triple Sharing', priceAdjustment: 0 },
              { label: 'Twin Sharing', priceAdjustment: 1500 },
              { label: 'Quad Sharing', priceAdjustment: -1000 }
            ],
            trainOptions: [
              { label: 'Non AC', priceAdjustment: 0 },
              { label: '3AC', priceAdjustment: 2500 },
              { label: 'No', priceAdjustment: -1500 }
            ],
            submitButtonText: 'Confirm Booking'
          }
        } 
      });
    }

    res.json({ success: true, data: setting.value });
  } catch (error) {
    console.error("Settings Fetch Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const settingsData = req.body;
    
    const setting = await prisma.setting.upsert({
      where: { key: SETTINGS_KEY },
      update: { value: settingsData },
      create: { 
        key: SETTINGS_KEY, 
        value: settingsData 
      }
    });

    res.json({ success: true, data: setting.value });
  } catch (error) {
    console.error("Settings Update Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDraftSettings = async (req, res) => {
  // For now, settings don't have a draft state in this implementation
  // but we can add it later if needed.
  return exports.getSettings(req, res);
};

const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

exports.uploadHeroVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No video file provided' });
    }

    const isCloudinaryConfigured = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
    let uploadResult;

    if (isCloudinaryConfigured) {
      uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'video',
            folder: 'youthcamping/hero',
            transformation: [{ quality: 'auto', fetch_format: 'auto' }]
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });
    } else {
      // Fallback local storage
      const uploadDir = path.join(__dirname, '../../public/uploads/hero');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filename = Date.now() + '-' + req.file.originalname.replace(/\s+/g, '-');
      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, req.file.buffer);
      uploadResult = {
        secure_url: `/uploads/hero/${filename}`,
        public_id: `local_${filename}`
      };
    }

    const videoUrl = uploadResult.secure_url;
    const publicId = uploadResult.public_id;
    const posterUrl = videoUrl.startsWith('http') 
      ? videoUrl.replace(/\.[^/.]+$/, '.jpg') 
      : '';

    // Fetch existing settings
    const existingSetting = await prisma.setting.findUnique({
      where: { key: SETTINGS_KEY }
    });

    const settingsData = existingSetting && existingSetting.value ? { ...existingSetting.value } : {};
    
    // Set video fields
    settingsData.heroVideoUrl = videoUrl;
    settingsData.heroVideoPublicId = publicId;
    settingsData.heroVideoPosterUrl = posterUrl;
    settingsData.heroVideoEnabled = true; // Auto-enable on successful upload

    const updatedSetting = await prisma.setting.upsert({
      where: { key: SETTINGS_KEY },
      update: { value: settingsData },
      create: {
        key: SETTINGS_KEY,
        value: settingsData
      }
    });

    res.json({ success: true, data: updatedSetting.value });
  } catch (error) {
    console.error("Hero Video Upload Error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to upload video" });
  }
};

exports.deleteHeroVideo = async (req, res) => {
  try {
    const existingSetting = await prisma.setting.findUnique({
      where: { key: SETTINGS_KEY }
    });

    if (!existingSetting || !existingSetting.value) {
      return res.status(404).json({ success: false, message: 'Settings not found' });
    }

    const settingsData = { ...existingSetting.value };
    const publicId = settingsData.heroVideoPublicId;

    if (publicId) {
      if (publicId.startsWith('local_')) {
        const filename = publicId.replace(/^local_/, '');
        const filePath = path.join(__dirname, '../../public/uploads/hero', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } else {
        const isCloudinaryConfigured = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
        if (isCloudinaryConfigured) {
          await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
        }
      }
    }

    // Clear video fields
    settingsData.heroVideoUrl = null;
    settingsData.heroVideoPublicId = null;
    settingsData.heroVideoPosterUrl = null;
    settingsData.heroVideoEnabled = false;

    const updatedSetting = await prisma.setting.update({
      where: { key: SETTINGS_KEY },
      data: { value: settingsData }
    });

    res.json({ success: true, data: updatedSetting.value });
  } catch (error) {
    console.error("Hero Video Delete Error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to delete video" });
  }
};

exports.toggleHeroVideo = async (req, res) => {
  try {
    const existingSetting = await prisma.setting.findUnique({
      where: { key: SETTINGS_KEY }
    });

    if (!existingSetting || !existingSetting.value) {
      return res.status(404).json({ success: false, message: 'Settings not found' });
    }

    const settingsData = { ...existingSetting.value };
    settingsData.heroVideoEnabled = !settingsData.heroVideoEnabled;

    const updatedSetting = await prisma.setting.update({
      where: { key: SETTINGS_KEY },
      data: { value: settingsData }
    });

    res.json({ success: true, data: updatedSetting.value });
  } catch (error) {
    console.error("Hero Video Toggle Error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to toggle video status" });
  }
};
