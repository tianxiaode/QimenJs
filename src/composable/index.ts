/**
 * 可组合能力系统 - 统一导出
 */

// 核心类型导出
export type { IComposable, IComposableBase, IExposeResult } from './types/composable';

// 核心类导出
export { ComposableBase } from './ComposableBase';
export type { AbilityDefinition, ForgedConstructor, InferAbilities } from './ComposableBase';
