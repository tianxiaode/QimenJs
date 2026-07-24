/**
 * 主题预设导出
 */

export { lightTheme } from './light';
export { darkTheme } from './dark';
export { buildChineseTheme } from './shared';

export { celadonTheme } from './celadon';
export { cinnabarTheme } from './cinnabar';
export { indigoTheme } from './indigo';
export { yellowTheme } from './yellow';
export { rosewoodTheme } from './rosewood';
export { inkTheme } from './ink';
export { daiTheme } from './dai';
export { huaqingTheme } from './huaqing';

import { celadonTheme } from './celadon';
import { cinnabarTheme } from './cinnabar';
import { indigoTheme } from './indigo';
import { yellowTheme } from './yellow';
import { rosewoodTheme } from './rosewood';
import { inkTheme } from './ink';
import { daiTheme } from './dai';
import { huaqingTheme } from './huaqing';

export const chineseThemes = [
    celadonTheme,
    cinnabarTheme,
    indigoTheme,
    yellowTheme,
    rosewoodTheme,
    inkTheme,
    daiTheme,
    huaqingTheme,
];

export const CHINESE_THEME_NAMES = chineseThemes.map((t) => t.name);

export type ChineseThemeName = (typeof CHINESE_THEME_NAMES)[number];
