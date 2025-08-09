import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';

// 定义主题类型
export type ThemeMode = 'light' | 'dark' | 'auto';

// 自定义颜色
const customLightColors = {
  ...MD3LightTheme.colors,
  primary: '#FF6B9D',
  primaryContainer: '#FFE1EC',
  secondary: '#8E4EC6',
  secondaryContainer: '#F3E8FF',
  tertiary: '#40E0D0',
  tertiaryContainer: '#E0FFFE',
  background: '#FEFBFF',
  surface: '#FEFBFF',
  surfaceVariant: '#F5F0F4',
  onSurface: '#1D1B20',
  onSurfaceVariant: '#4A4458',
  outline: '#7B7485',
  shadow: '#000000',
  inverseSurface: '#322F35',
  inverseOnSurface: '#F5EFF7',
  inversePrimary: '#FFB1CC',
  elevation: {
    level0: 'transparent',
    level1: '#F7F2F9',
    level2: '#F1EDF4',
    level3: '#ECE6F0',
    level4: '#EAE1E6',
    level5: '#E6DFEA',
  },
};

const customDarkColors = {
  ...MD3DarkTheme.colors,
  primary: '#FFB1CC',
  primaryContainer: '#8E2852',
  secondary: '#D1B3E6',
  secondaryContainer: '#6D4A7C',
  tertiary: '#A0F0E8',
  tertiaryContainer: '#00736B',
  background: '#121212',
  surface: '#121212',
  surfaceVariant: '#4A4458',
  onSurface: '#E6E0E9',
  onSurfaceVariant: '#CBC4CF',
  outline: '#958E99',
  shadow: '#000000',
  inverseSurface: '#E6E0E9',
  inverseOnSurface: '#322F35',
  inversePrimary: '#FF6B9D',
  elevation: {
    level0: 'transparent',
    level1: '#1D1A20',
    level2: '#24202A',
    level3: '#2C2633',
    level4: '#2E2936',
    level5: '#33303E',
  },
};

// 自定义字体配置
const fontConfig = {
  web: {
    regular: {
      fontFamily: 'Roboto, sans-serif',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'Roboto, sans-serif',
      fontWeight: '500',
    },
    light: {
      fontFamily: 'Roboto, sans-serif',
      fontWeight: '300',
    },
    thin: {
      fontFamily: 'Roboto, sans-serif',
      fontWeight: '100',
    },
  },
  default: {
    regular: {
      fontFamily: 'sans-serif',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'sans-serif-medium',
      fontWeight: '500',
    },
    light: {
      fontFamily: 'sans-serif-light',
      fontWeight: '300',
    },
    thin: {
      fontFamily: 'sans-serif-thin',
      fontWeight: '100',
    },
  },
};

// 主题配置
export const lightTheme = {
  ...MD3LightTheme,
  colors: customLightColors,
  fonts: configureFonts({ config: fontConfig }),
  roundness: 12,
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: customDarkColors,
  fonts: configureFonts({ config: fontConfig }),
  roundness: 12,
};

// 情感主题颜色
export const emotionColors = {
  happy: '#FFD700',
  excited: '#FF6347',
  loved: '#FF69B4',
  grateful: '#32CD32',
  peaceful: '#87CEEB',
  sad: '#4169E1',
  angry: '#DC143C',
  frustrated: '#FF4500',
  anxious: '#9370DB',
  confused: '#808080',
  neutral: '#A9A9A9',
  mixed: '#DDA0DD',
};

interface ThemeContextType {
  theme: typeof lightTheme;
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  emotionColors: typeof emotionColors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('auto');
  
  // 计算当前应该使用的主题
  const isDark = themeMode === 'dark' || (themeMode === 'auto' && systemColorScheme === 'dark');
  const theme = isDark ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setThemeMode(current => {
      switch (current) {
        case 'light': return 'dark';
        case 'dark': return 'auto';
        case 'auto': return 'light';
        default: return 'light';
      }
    });
  };

  const value: ThemeContextType = {
    theme,
    themeMode,
    isDark,
    setThemeMode,
    emotionColors,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
