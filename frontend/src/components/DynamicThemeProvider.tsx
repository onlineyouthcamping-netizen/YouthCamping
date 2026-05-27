"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchTheme } from '@/lib/api';

const ThemeContext = createContext<{
  theme: any | null;
}>({
  theme: null,
});

export const useTheme = () => useContext(ThemeContext);

export const DynamicThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<any | null>(null);

  const applyTheme = (config: any) => {
    if (!config) return;
    const root = document.documentElement;
    
    // Core Colors
    root.style.setProperty('--primary', config.primaryColor);
    root.style.setProperty('--secondary', config.secondaryColor);
    root.style.setProperty('--background', config.backgroundColor);
    root.style.setProperty('--foreground', config.textColor);
    
    // Buttons
    root.style.setProperty('--button-bg', config.buttonColor);
    root.style.setProperty('--button-hover', config.buttonHoverColor);
    root.style.setProperty('--button-text', config.buttonTextColor);
    root.style.setProperty('--radius-button', `${config.buttonRadius}px`);
    
    // Cards
    root.style.setProperty('--card', config.cardBgColor);
    root.style.setProperty('--radius-card', `${config.cardRadius}px`);
    root.style.setProperty('--shadow-card', config.cardShadow);
    
    // Borders
    root.style.setProperty('--border', config.borderColor);
    root.style.setProperty('--border-width', `${config.borderWidth}px`);
    
    // Typography
    root.style.setProperty('--font-primary', config.fontFamily || config.bodyFont);
    root.style.setProperty('--font-heading', config.headingFont);
    root.style.setProperty('--font-body', config.bodyFont);
    root.style.setProperty('--text-base', `${config.fontSizeBase}px`);
    root.style.setProperty('--text-heading', `${config.fontSizeHeading}px`);
    
    // Layout
    root.style.setProperty('--container-width', `${config.containerWidth}px`);
    root.style.setProperty('--spacing-unit', `${config.spacingUnit}px`);

    // Force font family on body
    root.style.fontFamily = config.bodyFont || config.fontFamily;
  };

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const config = await fetchTheme();
        if (config) {
          setTheme(config);
          applyTheme(config);
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      }
    };
    loadTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
};
