/**
 * 紫檀主题 - 中国风
 * 灵感：紫檀色系，高贵典雅，如紫禁城底蕴
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

// ============ 紫檀色板 ============
const rosewood = {
  'rosewood-50': '#f6f0f0',
  'rosewood-100': '#ebdadb',
  'rosewood-200': '#d6bcc0',
  'rosewood-300': '#bf9ca2',
  'rosewood-400': '#a87e86',
  'rosewood-500': '#8f636c',
  'rosewood-600': '#6f4b53',
  'rosewood-700': '#53373e',
  'rosewood-800': '#38252b',
  'rosewood-900': '#1e1417',
};

export const rosewoodTheme: ThemeDefinition = {
  name: 'rosewood',
  displayName: '紫檀',
  description: '紫檀色系，高贵典雅，如紫禁城底蕴',

  tokens: {
    colors: {
      primary: rosewood['rosewood-500'],
      'primary-hover': rosewood['rosewood-300'],
      'primary-active': rosewood['rosewood-700'],

      secondary: rosewood['rosewood-200'],

      success: '#4a7a5a',
      warning: '#b08a3a',
      error: '#8f3a3a',
      info: '#4a6a8f',

      'on-primary': '#ffffff',
      'on-secondary': '#2a1a1a',
      'on-success': '#ffffff',
      'on-warning': '#2a241a',
      'on-error': '#ffffff',
      'on-info': '#ffffff',

      bg: rosewood['rosewood-50'],
      'bg-secondary': '#ffffff',
      text: '#2a1a1a',
      'text-secondary': '#5a4a4a',
      border: rosewood['rosewood-200'],
      'border-light': '#ebdadb',
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
      sm: '0 1px 2px rgba(143, 99, 108, 0.1)',
      md: '0 4px 12px rgba(143, 99, 108, 0.15)',
      lg: '0 8px 30px rgba(143, 99, 108, 0.2)',
    },

    transition: CHINESE_TRANSITION,
    breakpoint: CHINESE_BREAKPOINT,
  },
};
