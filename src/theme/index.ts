/**
 * @qimenjs/theme
 *
 * 主题系统 - Design Tokens 类型定义 + ThemeRegistrar + CSS 变量生成 + 原子化 CSS
 */

// 类型导出
export * from './types';

// 核心实现导出
export { ThemeRegistrar, ThemeRegistrarName, flattenTokens } from './ThemeRegistrar';
export { AtomicCSS } from './AtomicCSS';

// 预设主题导出
export { lightTheme, darkTheme } from './presets';

// 中国传统色主题导出
export {
  celadonTheme,
  cinnabarTheme,
  indigoTheme,
  yellowTheme,
  rosewoodTheme,
  inkTheme,
  daiTheme,
  chineseThemes,
  CHINESE_THEME_NAMES,
} from './presets';

export type { ChineseThemeName } from './presets';

// 自动注册（必须在最后，触发 registerPresetThemes）
export { registerPresetThemes, registerChineseThemes } from './register';
