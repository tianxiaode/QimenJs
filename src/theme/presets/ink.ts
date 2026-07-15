/**
 * 墨色主题 - 中国风
 * 灵感：墨色系，禅意留白，如山水画卷
 */

import type { ThemeDefinition } from '../types';
import {
  CHINESE_FONT_FAMILY,
  CHINESE_SPACING,
  CHINESE_RADIUS,
  CHINESE_FONT_SIZE,
  CHINESE_FONT_WEIGHT,
  CHINESE_LINE_HEIGHT,
  CHINESE_TRANSITION,
  CHINESE_BREAKPOINT,
} from './shared';

// ============ 墨色色板 ============
const ink = {
  'ink-50': '#f5f5f5',
  'ink-100': '#e0e0e0',
  'ink-200': '#c7c7c7',
  'ink-300': '#ababab',
  'ink-400': '#8f8f8f',
  'ink-500': '#737373',
  'ink-600': '#595959',
  'ink-700': '#404040',
  'ink-800': '#282828',
  'ink-900': '#141414',
};

export const inkTheme: ThemeDefinition = {
  name: 'ink',
  displayName: '墨色',
  description: '墨色系，禅意留白，如山水画卷',

  tokens: {
    colors: {
      primary: ink['ink-700'],
      'primary-hover': ink['ink-400'],
      'primary-active': ink['ink-900'],

      secondary: ink['ink-300'],

      success: '#5a7a5a',
      warning: '#b08a3a',
      error: '#8f3a3a',
      info: '#4a6a8f',

      'on-primary': '#ffffff',
      'on-secondary': '#1a1a1a',
      'on-success': '#ffffff',
      'on-warning': '#2a241a',
      'on-error': '#ffffff',
      'on-info': '#ffffff',

      bg: ink['ink-50'],
      'bg-secondary': '#ffffff',
      text: ink['ink-800'],
      'text-secondary': ink['ink-600'],
      border: ink['ink-300'],
      'border-light': ink['ink-200'],
      overlay: 'rgba(20, 20, 20, 0.45)',
    },

    spacing: CHINESE_SPACING,
    radius: CHINESE_RADIUS,

    font: {
      family: CHINESE_FONT_FAMILY,
      size: CHINESE_FONT_SIZE,
      weight: CHINESE_FONT_WEIGHT,
      lineHeight: CHINESE_LINE_HEIGHT,
    },

    shadow: {
      none: 'none',
      sm: '0 1px 2px rgba(64, 64, 64, 0.1)',
      md: '0 4px 12px rgba(64, 64, 64, 0.15)',
      lg: '0 8px 30px rgba(64, 64, 64, 0.2)',
    },

    transition: CHINESE_TRANSITION,
    breakpoint: CHINESE_BREAKPOINT,
  },
};
