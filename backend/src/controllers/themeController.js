const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const defaultTheme = {
  fontFamily: 'Montserrat',
  headingFont: 'Montserrat',
  bodyFont: 'Montserrat',
  fontSizeBase: '16',
  fontSizeHeading: '32',
  fontWeightNormal: '400',
  fontWeightBold: '700',
  
  primaryColor: '#FF5B00',
  secondaryColor: '#1B2A4A',
  backgroundColor: '#FFFFFF',
  textColor: '#1F2937',
  
  buttonColor: '#FF5B00',
  buttonHoverColor: '#E65200',
  buttonTextColor: '#FFFFFF',
  buttonRadius: '12',
  
  cardBgColor: '#FFFFFF',
  cardRadius: '24',
  cardShadow: '0 10px 40px rgba(0,0,0,0.03)',
  
  borderColor: '#F1F5F9',
  borderWidth: '1',
  
  spacingUnit: '4',
  containerWidth: '1280',
  
  darkMode: false
};

const getTheme = async (req, res) => {
  try {
    let theme = await prisma.theme.findUnique({
      where: { name: 'primary' }
    });

    if (!theme) {
      theme = await prisma.theme.create({
        data: {
          name: 'primary',
          config: defaultTheme
        }
      });
    }

    res.json(theme.config);
  } catch (error) {
    console.error('Error fetching theme:', error);
    res.status(500).json({ message: 'Error fetching theme' });
  }
};

const updateTheme = async (req, res) => {
  try {
    const config = req.body;
    
    const theme = await prisma.theme.upsert({
      where: { name: 'primary' },
      update: { config },
      create: {
        name: 'primary',
        config
      }
    });

    res.json(theme.config);
  } catch (error) {
    console.error('Error updating theme:', error);
    res.status(500).json({ message: 'Error updating theme' });
  }
};

const resetTheme = async (req, res) => {
  try {
    const theme = await prisma.theme.update({
      where: { name: 'primary' },
      data: { config: defaultTheme }
    });

    res.json(theme.config);
  } catch (error) {
    console.error('Error resetting theme:', error);
    res.status(500).json({ message: 'Error resetting theme' });
  }
};

module.exports = {
  getTheme,
  updateTheme,
  resetTheme
};
