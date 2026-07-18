/**
 * 黛色主题 - 中国风
 * 灵感：黛色系，远山含翠，如江南烟雨
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

// ============ 黛色色板 ============
const dai = {
    'dai-50': '#eef2f2',
    'dai-100': '#d4ddde',
    'dai-200': '#b0c2c4',
    'dai-300': '#89a5a8',
    'dai-400': '#65898d',
    'dai-500': '#456f74',
    'dai-600': '#34565a',
    'dai-700': '#264043',
    'dai-800': '#192b2d',
    'dai-900': '#0d1819',
};

export const daiTheme: ThemeDefinition = {
    name: 'dai',
    displayName: '黛色',
    description: '黛色系，远山含翠，如江南烟雨',

    tokens: {
        colors: {
            primary: dai['dai-500'],
            'primary-hover': dai['dai-300'],
            'primary-active': dai['dai-700'],

            secondary: dai['dai-200'],

            success: '#4a8a6a',
            warning: '#b08a3a',
            error: '#8f3a3a',
            info: '#4a7a8f',

            'on-primary': '#ffffff',
            'on-secondary': '#1a2a2a',
            'on-success': '#ffffff',
            'on-warning': '#2a241a',
            'on-error': '#ffffff',
            'on-info': '#ffffff',

            bg: dai['dai-50'],
            'bg-secondary': '#ffffff',
            text: '#1a2a2a',
            'text-secondary': '#4a5a5a',
            border: dai['dai-200'],
            'border-light': '#d4ddde',
            overlay: 'rgba(26, 42, 42, 0.45)',
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
            sm: '0 1px 2px rgba(69, 111, 116, 0.1)',
            md: '0 4px 12px rgba(69, 111, 116, 0.15)',
            lg: '0 8px 30px rgba(69, 111, 116, 0.2)',
        },

        transition: CHINESE_TRANSITION,
        breakpoint: CHINESE_BREAKPOINT,
    },
};
