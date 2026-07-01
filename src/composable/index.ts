/**
 * 可组合能力系统 - 统一导出
 */

// 核心类型导出
export type {
    IComposable,
    IComposableBase,
    AbilityHostBase,
    IExposeResult,
    CreateDescriptorsFn,
    DisposerFactoryFn,
    IPrecompiledAbility,
    IPrecompilableAbility,
    AbilityProperties,
    AbilityConstructor,
} from './types/composable';

// 核心类导出
export { ComposableBase, type AbilityDefinition, type AbilityType } from './ComposableBase';
export { AbilityBase, type AbilityProxy } from './AbilityBase';
export { DebounceAbilityBase } from './DebounceAbilityBase';
export { ComposableRegistrar } from './ComposableRegistrar';
