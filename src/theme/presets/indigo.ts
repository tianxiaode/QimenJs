/**
 * 靛蓝主题 - 中国风
 * 灵感：靛蓝色系，深邃沉静，如夜空星辰
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

// ============ 靛蓝色板 ============
const indigo = {
  'indigo-50': '#eef2f7',
  'indigo-100': '#d4deed',
  'indigo-200': '#b0c2dd',
  'indigo-300': '#89a3cc',
  'indigo-400': '#6585bb',
  'indigo-500': '#4569a8',
  'indigo-600': '#345282',
  'indigo-700': '#263d5f',
  'indigo-800': '#19293f',
  'indigo-900': '#0d1622',
};

export const indigoTheme: ThemeDefinition = {
  name: 'indigo',
  displayName: '靛蓝',
  description: '靛蓝色系，深邃沉静，如夜空星辰',

  tokens: {
    colors: {
      primary: indigo['indigo-500'],
      'primary-hover': indigo['indigo-300'],
      'primary-active': indigo['indigo-700'],

      secondary: indigo['indigo-200'],

      success: '#4a8f6b',
      warning: '#d4a04a',
      error: '#b03a3a',
      info: '#4a8db7',

      'on-primary': '#ffffff',
      'on-secondary': '#1a1a2a',
      'on-success': '#ffffff',
      'on-warning': '#2a241a',
      'on-error': '#ffffff',
      'on-info': '#ffffff',

      bg: indigo['indigo-50'],
      'bg-secondary': '#ffffff',
      text: '#1a1a2a',
      'text-secondary': '#4a4a6b',
      border: indigo['indigo-200'],
      'border-light': '#d4deed',
      overlay: 'rgba(26, 26, 42, 0.45)',
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
      sm: '0 1px 2px rgba(69, 105, 168, 0.1)',
      md: '0 4px 12px rgba(69, 105, 168, 0.15)',
      lg: '0 8px 30px rgba(69, 105, 168, 0.2)',
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
