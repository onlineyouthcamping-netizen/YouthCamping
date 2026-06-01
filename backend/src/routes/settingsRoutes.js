const express = require('express');
const router = express.Router();
const { 
  getSettings, 
  updateSettings, 
  getDraftSettings,
  uploadHeroVideo,
  deleteHeroVideo,
  toggleHeroVideo
} = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');
const requireRole = require('../middleware/role');
const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();
const videoFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ['.mp4', '.webm', '.mov'];
  const allowedMime = ['video/mp4', 'video/webm', 'video/quicktime'];
  if (allowedExts.includes(ext) || allowedMime.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only MP4, WebM, and MOV are allowed.'), false);
  }
};
const uploadVideo = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: videoFilter
});

router.get('/', getSettings);
router.put('/', protect, requireRole('admin'), updateSettings);
router.get('/draft', protect, requireRole('admin'), getDraftSettings);

// Hero Video management routes
router.post('/hero-video', protect, requireRole('admin'), uploadVideo.single('video'), uploadHeroVideo);
router.delete('/hero-video', protect, requireRole('admin'), deleteHeroVideo);
router.patch('/hero-video/toggle', protect, requireRole('admin'), toggleHeroVideo);

module.exports = router;
