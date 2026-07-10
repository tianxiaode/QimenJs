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

// 自动注册（必须在最后，触发 registerPresetThemes）
export { registerPresetThemes } from './register';
