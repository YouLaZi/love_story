import { createTheme } from '@mui/material/styles';
import { zhCN } from '@mui/material/locale';

// 定义调色板
const palette = {
  primary: {
    main: '#FF6B9D',
    light: '#FFB1CC',
    dark: '#C2185B',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#8E4EC6',
    light: '#BA68C8',
    dark: '#7B1FA2',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#F44336',
    light: '#E57373',
    dark: '#D32F2F',
  },
  warning: {
    main: '#FF9800',
    light: '#FFB74D',
    dark: '#F57C00',
  },
  info: {
    main: '#2196F3',
    light: '#64B5F6',
    dark: '#1976D2',
  },
  success: {
    main: '#4CAF50',
    light: '#81C784',
    dark: '#388E3C',
  },
  grey: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
};

// 创建主题
export const theme = createTheme(
  {
    palette: {
      mode: 'light',
      ...palette,
      background: {
        default: '#F8F9FA',
        paper: '#FFFFFF',
      },
      text: {
        primary: '#212121',
        secondary: '#757575',
      },
    },
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      h1: {
        fontSize: '2.5rem',
        fontWeight: 700,
        lineHeight: 1.2,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      subtitle1: {
        fontSize: '1rem',
        fontWeight: 500,
        lineHeight: 1.5,
      },
      subtitle2: {
        fontSize: '0.875rem',
        fontWeight: 500,
        lineHeight: 1.5,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.6,
      },
      caption: {
        fontSize: '0.75rem',
        lineHeight: 1.5,
      },
      overline: {
        fontSize: '0.75rem',
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        lineHeight: 1.5,
      },
    },
    shape: {
      borderRadius: 8,
    },
    spacing: 8,
    components: {
      // AppBar 组件自定义
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: '#FFFFFF',
            color: '#212121',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            borderBottom: '1px solid #E0E0E0',
          },
        },
      },
      // Paper 组件自定义
      MuiPaper: {
        styleOverrides: {
          root: {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          },
          elevation1: {
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          },
          elevation2: {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          },
          elevation3: {
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      // Button 组件自定义
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
            fontWeight: 500,
            padding: '8px 16px',
          },
          contained: {
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
            },
          },
        },
      },
      // TextField 组件自定义
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            },
          },
        },
      },
      // Card 组件自定义
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            transition: 'box-shadow 0.3s ease',
            '&:hover': {
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
            },
          },
        },
      },
      // Chip 组件自定义
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            fontWeight: 500,
          },
        },
      },
      // DataGrid 组件自定义
      MuiDataGrid: {
        styleOverrides: {
          root: {
            border: 'none',
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #F0F0F0',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#FAFAFA',
              borderBottom: '2px solid #E0E0E0',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 600,
            },
          },
        },
      },
      // Drawer 组件自定义
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: '1px solid #E0E0E0',
            backgroundColor: '#FAFAFA',
          },
        },
      },
      // Dialog 组件自定义
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 12,
          },
        },
      },
      // Tooltip 组件自定义
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            fontSize: '0.75rem',
            borderRadius: 6,
          },
        },
      },
      // Tab 组件自定义
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
          },
        },
      },
      // LinearProgress 组件自定义
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            height: 6,
          },
        },
      },
    },
  },
  zhCN, // 中文本地化
);

// 深色主题
export const darkTheme = createTheme(
  {
    palette: {
      mode: 'dark',
      ...palette,
      background: {
        default: '#121212',
        paper: '#1E1E1E',
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#B0B0B0',
      },
    },
    typography: theme.typography,
    shape: theme.shape,
    spacing: theme.spacing,
    components: {
      ...theme.components,
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: '#1E1E1E',
            color: '#FFFFFF',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
            borderBottom: '1px solid #333333',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: '1px solid #333333',
            backgroundColor: '#1E1E1E',
          },
        },
      },
    },
  },
  zhCN,
);

// 情感颜色主题
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

// 状态颜色
export const statusColors = {
  active: '#4CAF50',
  inactive: '#F44336',
  pending: '#FF9800',
  completed: '#2196F3',
  cancelled: '#9E9E9E',
  processing: '#9C27B0',
};

// 优先级颜色
export const priorityColors = {
  high: '#F44336',
  medium: '#FF9800',
  low: '#4CAF50',
  critical: '#D32F2F',
};

// 图表颜色
export const chartColors = [
  '#FF6B9D',
  '#8E4EC6',
  '#40E0D0',
  '#FFD700',
  '#FF6347',
  '#32CD32',
  '#4169E1',
  '#FF4500',
  '#9370DB',
  '#20B2AA',
];

// 导出主题工具函数
export const getTheme = (mode: 'light' | 'dark' = 'light') => {
  return mode === 'dark' ? darkTheme : theme;
};

export default theme;
