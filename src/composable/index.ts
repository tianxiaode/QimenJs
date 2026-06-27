/**
 * 可组合能力系统 - 统一导出
 */

// 核心类型导出
export type {
    IComposable,
    IComposableBase,
    AbilityHostBase,
    IExposeResult,
    DescriptorFactoryFn,
    DisposerFactoryFn,
    IPrecompiledAbility,
    IPrecompilableAbility,
    AbilityProperties,
} from './types/composable';

// 核心类导出
export { DescriptorFactory } from './DescriptorFactory';
export { ComposableBase } from './ComposableBase';
export { AbilityBase } from './AbilityBase';
export { DebounceAbilityBase } from './DebounceAbilityBase';
export { ComposableRegistrar } from './ComposableRegistrar';
