/**
 * 亮色主题预设
 */

import type { ThemeDefinition } from '../types';

export const lightTheme: ThemeDefinition = {
    name: 'light',
    tokens: {
        colors: {
            primary: '#1890ff',
            'primary-hover': '#40a9ff',
            'primary-active': '#096dd9',
            secondary: '#666666',
            success: '#52c41a',
            warning: '#faad14',
            error: '#ff4d4f',
            info: '#1890ff',
            bg: '#ffffff',
            'bg-secondary': '#f5f5f5',
            text: '#333333',
            'text-secondary': '#999999',
            border: '#d9d9d9',
            'border-light': '#f0f0f0',
            'overlay': 'rgba(0, 0, 0, 0.45)',
        },
        spacing: {
            xs: 4,
            sm: 8,
            md: 16,
            lg: 24,
            xl: 32,
        },
        radius: {
            none: 0,
            sm: 2,
            md: 4,
            lg: 8,
            round: '9999px',
        },
        font: {
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            size: {
                xs: 12,
                sm: 13,
                md: 14,
                lg: 16,
                xl: 18,
                '2xl': 20,
                '3xl': 24,
            },
            weight: {
                normal: 400,
                medium: 500,
                bold: 700,
            },
            lineHeight: {
                tight: 1.25,
                normal: 1.5,
                loose: 2,
            },
        },
        shadow: {
            none: 'none',
            sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
        transition: {
            fast: '150ms ease',
            normal: '250ms ease',
            slow: '350ms ease',
        },
        breakpoint: {
            sm: 576,
            md: 768,
            lg: 992,
            xl: 1200,
        },
    },
};
