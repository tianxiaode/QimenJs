/**
 * 玄色主题 - 中国风暗色
 * 灵感：墨色、玄铁、暖金点缀如墨夜烛光
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

// ============ 玄色色板 ============
const xuanDark = {
  'xuan-50': '#2a2a2a',
  'xuan-100': '#1f1f1f',
  'xuan-200': '#181818',
  'xuan-300': '#141414',
  'xuan-400': '#0f0f0f',
  'xuan-500': '#0a0a0a',
  'xuan-600': '#050505',
};

// ============ 暖金色板 ============
const warmGold = {
  'gold-300': '#d4b87a',
  'gold-400': '#c4a360',
  'gold-500': '#b08e4a',
  'gold-600': '#967a3a',
  'gold-700': '#7a622e',
};

export const darkTheme: ThemeDefinition = {
  name: 'dark',
  displayName: '玄色',
  description: '玄色系，深邃庄重，暖金点缀如墨夜烛光',

  tokens: {
    colors: {
      primary: warmGold['gold-400'],
      'primary-hover': warmGold['gold-300'],
      'primary-active': warmGold['gold-500'],

      secondary: xuanDark['xuan-50'],

      success: '#4e8f55',
      warning: warmGold['gold-400'],
      error: '#d94a2a',
      info: '#6585bb',

      'on-primary': xuanDark['xuan-500'],
      'on-secondary': '#e8e0d0',
      'on-success': '#e8e0d0',
      'on-warning': xuanDark['xuan-500'],
      'on-error': '#e8e0d0',
      'on-info': xuanDark['xuan-500'],

      bg: xuanDark['xuan-300'],
      'bg-secondary': xuanDark['xuan-200'],
      text: '#e8e0d0',
      'text-secondary': '#a09888',
      border: xuanDark['xuan-50'],
      'border-light': xuanDark['xuan-100'],
      overlay: 'rgba(5, 5, 5, 0.7)',
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
      sm: '0 1px 2px rgba(0, 0, 0, 0.5)',
      md: '0 4px 12px rgba(0, 0, 0, 0.6)',
      lg: '0 8px 30px rgba(0, 0, 0, 0.7)',
    },

    transition: CHINESE_TRANSITION,
    breakpoint: CHINESE_BREAKPOINT,
  },
};