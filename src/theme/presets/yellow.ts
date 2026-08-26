/**
 * 鹅黄主题 - 中国风
 * 灵感：鹅黄色系，明快温暖，如春日暖阳
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

// ============ 鹅黄色板 ============
const yellow = {
    'yellow-50': '#fefaf0',
    'yellow-100': '#fdf2d4',
    'yellow-200': '#fbe3ac',
    'yellow-300': '#f8d281',
    'yellow-400': '#f4c057',
    'yellow-500': '#e8ad2e',
    'yellow-600': '#c18f20',
    'yellow-700': '#967016',
    'yellow-800': '#6b500e',
    'yellow-900': '#413007',
};

export const yellowTheme: ThemeDefinition = {
    name: 'yellow',
    displayName: '鹅黄',
    description: '鹅黄色系，明快温暖，如春日暖阳',

    tokens: {
        colors: {
            primary: yellow['yellow-500'],
            'primary-hover': yellow['yellow-300'],
            'primary-active': yellow['yellow-700'],

            secondary: yellow['yellow-200'],

            success: '#4a8f6b',
            warning: yellow['yellow-600'],
            error: '#b03a3a',
            info: '#4a7a8f',

            'on-primary': '#2a241a',
            'on-secondary': '#2a241a',
            'on-success': '#ffffff',
            'on-warning': '#2a241a',
            'on-error': '#ffffff',
            'on-info': '#ffffff',

            bg: yellow['yellow-50'],
            'bg-secondary': '#ffffff',
            text: '#2a241a',
            'text-secondary': '#6b5a4a',
            border: yellow['yellow-200'],
            'border-light': '#fdf2d4',
            overlay: 'rgba(42, 36, 26, 0.45)',
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
            sm: '0 1px 2px rgba(232, 173, 46, 0.1)',
            md: '0 4px 12px rgba(232, 173, 46, 0.15)',
            lg: '0 8px 30px rgba(232, 173, 46, 0.2)',
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
