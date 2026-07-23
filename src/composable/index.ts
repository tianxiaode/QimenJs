/**
 * 可组合能力系统 - 统一导出
 */

export type { IComposable, IComposableBase, IExposeResult } from './types/composable';
export type { AbilityDefinition, InferAbility, InferAbilities } from './types/ability';

export { ComposableBase } from './ComposableBase';
export { withAbilities, withDefinitions, ABILITY_STATES_KEY, CLEANUPS_KEY } from './forge';
