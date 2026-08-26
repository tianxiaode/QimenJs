/**
 * 朱砂主题 - 中国风
 * 灵感：朱砂色系，热烈庄重，如故宫红墙
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
  CHINESE_BORDER,
  CHINESE_Z_INDEX,
  CHINESE_OPACITY,
  CHINESE_ANIMATION,
  CHINESE_CURSOR,
  CHINESE_OVERFLOW,
} from './shared';

// ============ 朱砂色板 ============
const cinnabar = {
  'cinnabar-50': '#fdf2ee',
  'cinnabar-100': '#fadecf',
  'cinnabar-200': '#f6b9a3',
  'cinnabar-300': '#f09174',
  'cinnabar-400': '#e86b4a',
  'cinnabar-500': '#d94a2a',
  'cinnabar-600': '#b83b20',
  'cinnabar-700': '#912e18',
  'cinnabar-800': '#6a2110',
  'cinnabar-900': '#431408',
};

export const cinnabarTheme: ThemeDefinition = {
  name: 'cinnabar',
  displayName: '朱砂',
  description: '朱砂色系，热烈庄重，如故宫红墙',

  tokens: {
    colors: {
      primary: cinnabar['cinnabar-500'],
      'primary-hover': cinnabar['cinnabar-300'],
      'primary-active': cinnabar['cinnabar-700'],

      secondary: cinnabar['cinnabar-200'],

      success: '#4a8f6b',
      warning: '#d4a04a',
      error: cinnabar['cinnabar-600'],
      info: '#4a7a8f',

      'on-primary': '#ffffff',
      'on-secondary': '#2a1a1a',
      'on-success': '#ffffff',
      'on-warning': '#2a241a',
      'on-error': '#ffffff',
      'on-info': '#ffffff',

      bg: cinnabar['cinnabar-50'],
      'bg-secondary': '#ffffff',
      text: '#2a1a1a',
      'text-secondary': '#6b4a4a',
      border: cinnabar['cinnabar-200'],
      'border-light': '#fadecf',
      overlay: 'rgba(42, 26, 26, 0.45)',
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
      sm: '0 1px 2px rgba(217, 74, 42, 0.1)',
      md: '0 4px 12px rgba(217, 74, 42, 0.15)',
      lg: '0 8px 30px rgba(217, 74, 42, 0.2)',
    },

    transition: CHINESE_TRANSITION,
    breakpoint: CHINESE_BREAKPOINT,
    border: CHINESE_BORDER,
    zIndex: CHINESE_Z_INDEX,
    opacity: CHINESE_OPACITY,
    animation: CHINESE_ANIMATION,
    cursor: CHINESE_CURSOR,
    overflow: CHINESE_OVERFLOW,
  },
};
