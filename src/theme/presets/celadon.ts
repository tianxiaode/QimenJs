/**
 * 青瓷主题 - 中国风
 * 灵感：青瓷色系，清新温润，如雨后春山
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

// ============ 青瓷色板 ============
const celadon = {
  'celadon-50': '#f0f7f0',
  'celadon-100': '#d9e8da',
  'celadon-200': '#b8d4bb',
  'celadon-300': '#94be98',
  'celadon-400': '#70a875',
  'celadon-500': '#4e8f55',
  'celadon-600': '#3a7340',
  'celadon-700': '#2a572e',
  'celadon-800': '#1b3b1e',
  'celadon-900': '#0d1f0f',
};

export const celadonTheme: ThemeDefinition = {
  name: 'celadon',
  displayName: '青瓷',
  description: '青瓷色系，清新温润，如雨后春山',

  tokens: {
    colors: {
      primary: celadon['celadon-500'],
      'primary-hover': celadon['celadon-300'],
      'primary-active': celadon['celadon-700'],

      secondary: celadon['celadon-200'],

      success: celadon['celadon-600'],
      warning: '#d4a04a',
      error: '#c0392b',
      info: '#4a8db7',

      'on-primary': '#ffffff',
      'on-secondary': '#1a2a1a',
      'on-success': '#ffffff',
      'on-warning': '#2a241a',
      'on-error': '#ffffff',
      'on-info': '#ffffff',

      bg: celadon['celadon-50'],
      'bg-secondary': '#ffffff',
      text: '#1a2a1a',
      'text-secondary': '#4a6b4a',
      border: celadon['celadon-200'],
      'border-light': '#d9e8da',
      overlay: 'rgba(26, 42, 26, 0.45)',
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
      sm: '0 1px 2px rgba(78, 143, 85, 0.1)',
      md: '0 4px 12px rgba(78, 143, 85, 0.15)',
      lg: '0 8px 30px rgba(78, 143, 85, 0.2)',
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
