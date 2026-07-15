/**
 * 中国传统颜色主题预设 — 聚合导出
 *
 * 每个主题独立一个文件，本文件仅做聚合导出和名称常量定义。
 */

import type { ThemeDefinition } from '../types';

export { celadonTheme } from './celadon';
export { cinnabarTheme } from './cinnabar';
export { indigoTheme } from './indigo';
export { yellowTheme } from './yellow';
export { rosewoodTheme } from './rosewood';
export { inkTheme } from './ink';
export { daiTheme } from './dai';
export { huaqingTheme } from './huaqing';

// ============ 全部主题集合 ============

import { celadonTheme } from './celadon';
import { cinnabarTheme } from './cinnabar';
import { indigoTheme } from './indigo';
import { yellowTheme } from './yellow';
import { rosewoodTheme } from './rosewood';
import { inkTheme } from './ink';
import { daiTheme } from './dai';
import { huaqingTheme } from './huaqing';

export const chineseThemes: ThemeDefinition[] = [
  celadonTheme,
  cinnabarTheme,
  indigoTheme,
  yellowTheme,
  rosewoodTheme,
  inkTheme,
  daiTheme,
  huaqingTheme,
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
  HUAQING: 'huaqing',
} as const;

export type ChineseThemeName = typeof CHINESE_THEME_NAMES[keyof typeof CHINESE_THEME_NAMES];
