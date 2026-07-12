/**
 * 暗色主题预设
 */

import type { ThemeDefinition } from '../types';

export const darkTheme: ThemeDefinition = {
    name: 'dark',
    tokens: {
        colors: {
            primary: '#177ddc',
            'primary-hover': '#3c9ae8',
            'primary-active': '#095cb5',
            secondary: '#999999',
            success: '#49aa19',
            warning: '#d89614',
            error: '#d32029',
            info: '#177ddc',
            // 前景色（on-xxx）：搭配对应背景色使用，确保可读性
            'on-primary': '#ffffff',
            'on-secondary': '#ffffff',
            'on-success': '#ffffff',
            'on-warning': '#141414',
            'on-error': '#ffffff',
            'on-info': '#ffffff',
            bg: '#141414',
            'bg-secondary': '#1f1f1f',
            text: '#ffffffd9',
            'text-secondary': '#ffffff73',
            border: '#434343',
            'border-light': '#303030',
            'overlay': 'rgba(0, 0, 0, 0.65)',
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
            sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
            md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
            lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.4)',
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
