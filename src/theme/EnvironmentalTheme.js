// Environmental Theme Configuration for CivicStack
// Inspired by nature and sustainability

export const EnvironmentalTheme = {
  // Primary Colors - Earth Tones
  primary: {
    main: '#2E7D32', // Forest Green
    light: '#60AD5E', // Light Green
    dark: '#1B5E20', // Dark Forest
    surface: '#E8F5E9', // Very Light Green
  },

  // Secondary Colors - Sky & Water
  secondary: {
    main: '#0277BD', // Ocean Blue
    light: '#58A5F0', // Sky Blue
    dark: '#01579B', // Deep Ocean
    surface: '#E3F2FD', // Light Sky
  },

  // Accent Colors - Earth Elements
  accent: {
    amber: '#FF8F00', // Sunset Orange
    brown: '#5D4037', // Earth Brown
    teal: '#00695C', // River Teal
    lime: '#689F38', // Fresh Lime
  },

  // Neutral Colors - Natural Stones
  neutral: {
    white: '#FFFFFF',
    light: '#F8FAF8', // Off-white with green tint
    gray100: '#F1F8E9', // Very light green-gray
    gray200: '#DCEDC8', // Light green-gray
    gray300: '#C5E1A5', // Medium green-gray
    gray500: '#8BC34A', // Medium green
    gray700: '#558B2F', // Dark green
    gray900: '#33691E', // Very dark green
    black: '#1B5E20',
  },

  // Status Colors - Natural Elements
  status: {
    success: '#4CAF50', // Leaf Green
    warning: '#FF9800', // Autumn Orange
    error: '#D32F2F', // Berry Red
    info: '#0288D1', // Water Blue
  },

  // Gradients - Natural Transitions
  gradients: {
    primary: ['#2E7D32', '#60AD5E'],
    secondary: ['#0277BD', '#58A5F0'],
    sunset: ['#FF8F00', '#FF5722'],
    forest: ['#1B5E20', '#2E7D32', '#60AD5E'],
    ocean: ['#01579B', '#0277BD', '#58A5F0'],
  },

  // Spacing System
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Border Radius
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    round: 50,
  },

  // Typography
  typography: {
    h1: { fontSize: 32, fontWeight: 'bold' },
    h2: { fontSize: 28, fontWeight: 'bold' },
    h3: { fontSize: 24, fontWeight: '600' },
    h4: { fontSize: 20, fontWeight: '600' },
    body1: { fontSize: 16, fontWeight: '400' },
    body2: { fontSize: 14, fontWeight: '400' },
    caption: { fontSize: 12, fontWeight: '400' },
  },

  // Shadows
  shadows: {
    small: {
      shadowColor: '#1B5E20',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    medium: {
      shadowColor: '#1B5E20',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    },
    large: {
      shadowColor: '#1B5E20',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 10,
    },
  },
};

export default EnvironmentalTheme;
