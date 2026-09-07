// Wakker Design Tokens
// Elke fase heeft een eigen kleurpalette

export const PHASE_COLORS = {
  'fase-1': {
    primary: '#1A5F7A',
    primaryLight: '#2A7F9A',
    primaryDark: '#0E3F52',
    accent: '#4ECDC4',
    surface: '#E8F4F8',
    gradient: ['#1A5F7A', '#2A7F9A'],
  },
  'fase-2': {
    primary: '#D4943F',
    primaryLight: '#E4A44F',
    primaryDark: '#B4742F',
    accent: '#F2C94C',
    surface: '#FDF5E8',
    gradient: ['#D4943F', '#E4A44F'],
  },
  'fase-3': {
    primary: '#2D8F6F',
    primaryLight: '#3DAF8F',
    primaryDark: '#1D6F4F',
    accent: '#6FCF97',
    surface: '#E8F8F0',
    gradient: ['#2D8F6F', '#3DAF8F'],
  },
  'fase-4': {
    primary: '#8B5E3C',
    primaryLight: '#AB7E5C',
    primaryDark: '#6B3E1C',
    accent: '#D4A574',
    surface: '#F8F0E8',
    gradient: ['#8B5E3C', '#AB7E5C'],
  },
} as const;

export type PhaseId = keyof typeof PHASE_COLORS;

export const COLORS = {
  // Base
  background: '#FAFBFC',
  backgroundDark: '#121820',
  surface: '#FFFFFF',
  surfaceDark: '#1E2630',
  card: '#FFFFFF',
  cardDark: '#242E38',

  // Text
  text: '#1A2030',
  textDark: '#F0F2F5',
  textSecondary: '#6B7280',
  textSecondaryDark: '#9CA3AF',
  textMuted: '#9CA3AF',

  // UI
  border: '#E5E7EB',
  borderDark: '#374151',
  divider: '#F3F4F6',
  dividerDark: '#2A3440',

  // Status
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // App accent
  primary: '#1A5F7A',
  primaryLight: '#2A7F9A',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  semibold: 'System',
  bold: 'System',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const FONT_SIZES = {
  xs: 11,
  sm: 13,
  body: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 32,
  hero: 40,
} as const;

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
} as const;
