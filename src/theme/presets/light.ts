/**
 * 宣纸主题 - 中国风亮色
 * 灵感：宣纸、天青、宋徽宗"雨过天青云破处"
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
import { tokensToCSSVariables } from '../utils';

// ============ 天青色板（加深版） ============
const tianqing = {
    'tianqing-50': '#e8eef0',
    'tianqing-100': '#c5d5db',
    'tianqing-200': '#9bb8c4',
    'tianqing-300': '#6e97a8',
    'tianqing-400': '#4a7d8f',
    'tianqing-500': '#2a5f73', // ← 主色
    'tianqing-600': '#1e4a5a',
    'tianqing-700': '#143642',
    'tianqing-800': '#0b232b',
    'tianqing-900': '#041217',
};

// ============ 宣纸色板 ============
const xuanPaper = {
    'paper-50': '#fcf8f0',
    'paper-100': '#f5efe0',
    'paper-200': '#ebe0cc',
    'paper-300': '#d9ccb8',
    'paper-400': '#bfb09a',
    'paper-500': '#a6957d',
    'paper-600': '#8a7a66',
    'paper-700': '#6b5e4f',
    'paper-800': '#4d4338',
    'paper-900': '#302a23',
};

export const lightTheme: ThemeDefinition = {
    name: 'light',
    displayName: '宣纸',
    description: '宣纸色系，温润典雅，天青点缀如宋瓷',

    tokens: {
        colors: {
            primary: tianqing['tianqing-500'],
            'primary-hover': tianqing['tianqing-300'],
            'primary-active': tianqing['tianqing-700'],

            secondary: xuanPaper['paper-400'],

            success: '#3a7340',
            warning: '#d4a04a',
            error: '#d94a2a',
            info: tianqing['tianqing-400'],

            'on-primary': '#ffffff',
            'on-secondary': xuanPaper['paper-900'],
            'on-success': '#ffffff',
            'on-warning': xuanPaper['paper-900'],
            'on-error': '#ffffff',
            'on-info': '#ffffff',

            bg: xuanPaper['paper-50'],
            'bg-secondary': xuanPaper['paper-100'],
            text: xuanPaper['paper-900'],
            'text-secondary': xuanPaper['paper-600'],
            border: xuanPaper['paper-300'],
            'border-light': xuanPaper['paper-100'],
            overlay: 'rgba(48, 42, 35, 0.45)',
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
            sm: '0 1px 2px rgba(42, 95, 115, 0.08)',
            md: '0 4px 12px rgba(42, 95, 115, 0.12)',
            lg: '0 8px 30px rgba(42, 95, 115, 0.16)',
        },

        transition: CHINESE_TRANSITION,
        breakpoint: CHINESE_BREAKPOINT,
    },
};

/** 亮色主题 CSS 变量 */
export const lightThemeCSS = tokensToCSSVariables(lightTheme.tokens);
