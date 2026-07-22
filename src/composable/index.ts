/**
 * 可组合能力系统 - 统一导出
 */

// 核心类型导出
export type { IComposable, IComposableBase, IExposeResult } from './types/composable';
export type { AbilityDefinition, ForgedConstructor, InferAbilities } from './types/ability';

// 核心机制导出
export { createForgedClass, initForgedState } from './forge';

// 语法糖导出
export { ComposableBase } from './ComposableBase';
