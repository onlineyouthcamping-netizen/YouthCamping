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
