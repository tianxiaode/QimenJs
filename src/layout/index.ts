/**
 * @qimenjs/layout
 *
 * Layout 定义系统 - LayoutNode + 验证 + key 常量
 */

// 类型导出
export * from './LayoutNode';

// key 常量导出
export { POSITION_KEYS, ACCESSIBILITY_KEYS, TOOLTIP_KEYS, ANIMATION_KEYS, STYLE_KEYS, RESERVED_KEYS, KNOWN_PROP_KEYS } from './layout-keys';

// 验证器导出
export { validateLayout, type ValidationResult } from './validator';
