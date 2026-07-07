/**
 * @qimenjs/component
 *
 * UI 组件层 - ComponentBase + ComponentManager + ComponentRegistrar + 能力定义 + 组件
 */

// 核心类导出
export { ComponentBase } from './ComponentBase';
export { ComponentManager, getCmp } from './ComponentManager';
export { ComponentRegistrar, type ComponentDefinition } from './ComponentRegistrar';

// 能力定义导出
export * from './abilities';
