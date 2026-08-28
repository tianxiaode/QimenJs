/**
 * @qimenjs/theme
 *
 * 主题系统 - Design Tokens 类型定义 + CSS 变量生成
 */

// 类型导出
export * from './types';

// 工具函数导出
export { flattenTokens, tokensToCSSVariables } from './utils';

// 框架运行时必须的全局样式 — 通过 theme.css 统一 @import 管理
// 预设主题导出
export { lightTheme, lightThemeCSS } from './presets/light';
export { darkTheme, darkThemeCSS } from './presets/dark';

// 中国传统色主题导出
export {
    celadonTheme,
    cinnabarTheme,
    indigoTheme,
    yellowTheme,
    rosewoodTheme,
    inkTheme,
    daiTheme,
    huaqingTheme,
    CHINESE_THEME_NAMES,
} from './presets';

export type { ChineseThemeName } from './presets';
