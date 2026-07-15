/**
 * 花青主题 - 中国风
 * 灵感：国画花青颜料，沉稳书卷气
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

// ============ 花青色板 ============
const huaqing = {
  'huaqing-50': '#eef2f7',
  'huaqing-100': '#d4deed',
  'huaqing-200': '#b0c2dd',
  'huaqing-300': '#89a3cc',
  'huaqing-400': '#6585bb',
  'huaqing-500': '#3b6b8f', // ← 主色
  'huaqing-600': '#2e5573',
  'huaqing-700': '#223f59',
  'huaqing-800': '#172a3d',
  'huaqing-900': '#0c1622',
};

export const huaqingTheme: ThemeDefinition = {
  name: 'huaqing',
  displayName: '花青',
  description: '花青色系，沉稳书卷气，如宋画雅韵',

  tokens: {
    colors: {
      primary: huaqing['huaqing-500'],
      'primary-hover': huaqing['huaqing-300'],
      'primary-active': huaqing['huaqing-700'],

      secondary: huaqing['huaqing-200'],

      success: '#4a8f6b',
      warning: '#d4a04a',
      error: '#b83b20',
      info: huaqing['huaqing-400'],

      'on-primary': '#ffffff',
      'on-secondary': '#172a3d',
      'on-success': '#ffffff',
      'on-warning': '#302a23',
      'on-error': '#ffffff',
      'on-info': '#ffffff',

      bg: huaqing['huaqing-50'],
      'bg-secondary': '#ffffff',
      text: huaqing['huaqing-900'],
      'text-secondary': huaqing['huaqing-600'],
      border: huaqing['huaqing-200'],
      'border-light': huaqing['huaqing-100'],
      overlay: 'rgba(12, 22, 34, 0.45)',
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
      sm: '0 1px 2px rgba(59, 107, 143, 0.1)',
      md: '0 4px 12px rgba(59, 107, 143, 0.15)',
      lg: '0 8px 30px rgba(59, 107, 143, 0.2)',
    },

    transition: CHINESE_TRANSITION,
    breakpoint: CHINESE_BREAKPOINT,
  },
};