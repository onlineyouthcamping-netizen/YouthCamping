import api from './api';

export interface ThemeConfig {
  fontFamily: string;
  headingFont: string;
  bodyFont: string;
  fontSizeBase: string;
  fontSizeHeading: string;
  fontWeightNormal: string;
  fontWeightBold: string;
  
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  
  buttonColor: string;
  buttonHoverColor: string;
  buttonTextColor: string;
  buttonRadius: string;
  
  cardBgColor: string;
  cardRadius: string;
  cardShadow: string;
  
  borderColor: string;
  borderWidth: string;
  
  spacingUnit: string;
  containerWidth: string;
  
  darkMode: boolean;
}

export const themeService = {
  get: async (): Promise<ThemeConfig> => {
    const response = await api.get('/theme');
    return response.data;
  },
  
  update: async (config: ThemeConfig): Promise<ThemeConfig> => {
    const response = await api.post('/theme', config);
    return response.data;
  },
  
  reset: async (): Promise<ThemeConfig> => {
    const response = await api.post('/theme/reset');
    return response.data;
  }
};
