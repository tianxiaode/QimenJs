// presets/chinese-themes.ts

import type { ThemeDefinition } from '../types';

/**
 * 中国传统颜色主题预设
 * 参考：中国传统色（故宫色系）
 */

// ============ 基础色板 ============

/** 青瓷系 - 温润雅致 */
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

/** 朱砂系 - 热烈庄重 */
const cinnabar = {
  'cinnabar-50': '#fdf2ee',
  'cinnabar-100': '#fadecf',
  'cinnabar-200': '#f6b9a3',
  'cinnabar-300': '#f09174',
  'cinnabar-400': '#e86b4a',
  'cinnabar-500': '#d94a2a',
  'cinnabar-600': '#b83b20',
  'cinnabar-700': '#912e18',
  'cinnabar-800': '#6a2110',
  'cinnabar-900': '#431408',
};

/** 靛蓝系 - 深邃沉静 */
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

/** 鹅黄系 - 明快温暖 */
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

/** 紫檀系 - 高贵典雅 */
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

/** 墨色系 - 禅意留白 */
const ink = {
  'ink-50': '#f5f5f5',
  'ink-100': '#e0e0e0',
  'ink-200': '#c7c7c7',
  'ink-300': '#ababab',
  'ink-400': '#8f8f8f',
  'ink-500': '#737373',
  'ink-600': '#595959',
  'ink-700': '#404040',
  'ink-800': '#282828',
  'ink-900': '#141414',
};

/** 黛色系 - 远山如黛 */
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

// ============ 中国风通用令牌 ============

/** 中国风字体族 */
const CHINESE_FONT_FAMILY = '"Noto Serif SC", "Source Han Serif SC", serif';

/** 中国风通用间距（与 light/dark 对齐，单位 px） */
const CHINESE_SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

/** 中国风通用圆角（与 light/dark 对齐，单位 px） */
const CHINESE_RADIUS = {
  none: 0,
  sm: 2,
  md: 4,
  lg: 8,
  round: '9999px',
} as const;

/** 中国风通用字号（与 light/dark 对齐，单位 px） */
const CHINESE_FONT_SIZE = {
  xs: 12,
  sm: 13,
  md: 14,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 24,
} as const;

/** 中国风通用字重 */
const CHINESE_FONT_WEIGHT = {
  normal: 400,
  medium: 500,
  bold: 700,
} as const;

/** 中国风通用行高 */
const CHINESE_LINE_HEIGHT = {
  tight: 1.25,
  normal: 1.5,
  loose: 2,
} as const;

/** 中国风通用过渡 */
const CHINESE_TRANSITION = {
  fast: '150ms ease',
  normal: '250ms ease',
  slow: '350ms ease',
} as const;

/** 中国风通用断点 */
const CHINESE_BREAKPOINT = {
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
} as const;

// ============ 主题定义 ============

/** 青瓷主题 - 清新温润 */
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
      // 前景色（on-xxx）：搭配对应背景色使用，确保可读性
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
  },
};

/** 朱砂主题 - 热烈庄重 */
export const cinnabarTheme: ThemeDefinition = {
  name: 'cinnabar',
  displayName: '朱砂',
  description: '朱砂色系，热烈庄重，如故宫红墙',
  tokens: {
    colors: {
      primary: cinnabar['cinnabar-500'],
      'primary-hover': cinnabar['cinnabar-300'],
      'primary-active': cinnabar['cinnabar-700'],
      secondary: cinnabar['cinnabar-200'],
      success: '#4a8f6b',
      warning: '#d4a04a',
      error: cinnabar['cinnabar-600'],
      info: '#4a7a8f',
      // 前景色（on-xxx）：搭配对应背景色使用，确保可读性
      'on-primary': '#ffffff',
      'on-secondary': '#2a1a1a',
      'on-success': '#ffffff',
      'on-warning': '#2a241a',
      'on-error': '#ffffff',
      'on-info': '#ffffff',
      bg: cinnabar['cinnabar-50'],
      'bg-secondary': '#ffffff',
      text: '#2a1a1a',
      'text-secondary': '#6b4a4a',
      border: cinnabar['cinnabar-200'],
      'border-light': '#fadecf',
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
      sm: '0 1px 2px rgba(217, 74, 42, 0.1)',
      md: '0 4px 12px rgba(217, 74, 42, 0.15)',
      lg: '0 8px 30px rgba(217, 74, 42, 0.2)',
    },
    transition: CHINESE_TRANSITION,
    breakpoint: CHINESE_BREAKPOINT,
  },
};

/** 靛蓝主题 - 深邃沉静 */
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
      // 前景色（on-xxx）：搭配对应背景色使用，确保可读性
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
  },
};

/** 鹅黄主题 - 明快温暖 */
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
      // 前景色（on-xxx）：搭配对应背景色使用，确保可读性
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
  },
};

/** 紫檀主题 - 高贵典雅 */
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
      // 前景色（on-xxx）：搭配对应背景色使用，确保可读性
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

/** 墨色主题 - 禅意留白 */
export const inkTheme: ThemeDefinition = {
  name: 'ink',
  displayName: '墨色',
  description: '墨色系，禅意留白，如山水画卷',
  tokens: {
    colors: {
      primary: ink['ink-700'],
      'primary-hover': ink['ink-400'],
      'primary-active': ink['ink-900'],
      secondary: ink['ink-300'],
      success: '#5a7a5a',
      warning: '#b08a3a',
      error: '#8f3a3a',
      info: '#4a6a8f',
      // 前景色（on-xxx）：搭配对应背景色使用，确保可读性
      'on-primary': '#ffffff',
      'on-secondary': '#1a1a1a',
      'on-success': '#ffffff',
      'on-warning': '#2a241a',
      'on-error': '#ffffff',
      'on-info': '#ffffff',
      bg: ink['ink-50'],
      'bg-secondary': '#ffffff',
      text: ink['ink-800'],
      'text-secondary': ink['ink-600'],
      border: ink['ink-300'],
      'border-light': ink['ink-200'],
      overlay: 'rgba(20, 20, 20, 0.45)',
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
      sm: '0 1px 2px rgba(64, 64, 64, 0.1)',
      md: '0 4px 12px rgba(64, 64, 64, 0.15)',
      lg: '0 8px 30px rgba(64, 64, 64, 0.2)',
    },
    transition: CHINESE_TRANSITION,
    breakpoint: CHINESE_BREAKPOINT,
  },
};

/** 黛色主题 - 远山含翠 */
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
      // 前景色（on-xxx）：搭配对应背景色使用，确保可读性
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

// ============ 全部主题集合 ============

export const chineseThemes: ThemeDefinition[] = [
  celadonTheme,
  cinnabarTheme,
  indigoTheme,
  yellowTheme,
  rosewoodTheme,
  inkTheme,
  daiTheme,
];

// ============ 主题名称常量 ============

export const CHINESE_THEME_NAMES = {
  CELADON: 'celadon',
  CINNABAR: 'cinnabar',
  INDIGO: 'indigo',
  YELLOW: 'yellow',
  ROSEWOOD: 'rosewood',
  INK: 'ink',
  DAI: 'dai',
} as const;

export type ChineseThemeName = typeof CHINESE_THEME_NAMES[keyof typeof CHINESE_THEME_NAMES];
