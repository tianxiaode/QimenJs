/**
 * 可组合能力系统 - 统一导出
 * 
 * 这是新框架的核心模块，提供完整的能力管理系统
 */

// ============================================
// 核心类型导出（从types目录重新导出）
// ============================================

export type {
    IComposable,
    IComposableBase,
    AbilityHostBase,
    IExposeResult,
    DescriptorFactoryFn,
    DisposerFactoryFn,
    IPrecompiledAbility,
    IPrecompilableAbility,
    IAbilityRegistrationEntry,
    IAbilityRegistrationOptions,
    AbilityDecorator,
    ExtractHostType,
    AbilityProperties,
} from './types/composable';

// ============================================
// 核心类导出
// ============================================

export { DescriptorFactory } from './DescriptorFactory';
export { ComposableBase, Ability } from './ComposableBase';
export { AbilityBase } from './AbilityBase';
export { DebounceAbilityBase } from './DebounceAbilityBase';
export { ComposableRegistrar } from './ComposableRegistrar';

// ============================================
// 使用示例
// ============================================

/**
 * @example 定义能力
 * ```typescript
 * import { DescriptorFactory, IPrecompiledAbility } from '@/composable';
 * 
 * class EventAbility {
 *     static readonly name = 'Event';
 *     
 *     static precompile(): IPrecompiledAbility {
 *         const descriptorFactories = new Map();
 *         
 *         // getter 属性
 *         descriptorFactories.set('loading', 
 *             DescriptorFactory.getter(host => host.state.loading)
 *         );
 *         
 *         // 方法
 *         descriptorFactories.set('on', 
 *             DescriptorFactory.method((host, event, handler) => {
 *                 // 实现
 *             })
 *         );
 *         
 *         // 销毁函数
 *         const createDisposer = (host) => () => {
 *             // 清理逻辑
 *         };
 *         
 *         return { 
 *             name: 'Event',
 *             descriptorFactories, 
 *             createDisposer 
 *         };
 *     }
 * }
 * ```
 * 
 * @example 注册能力
 * ```typescript
 * import { ComposableRegistrar } from '@/kernel/registrars';
 * 
 * const registrar = ComposableRegistrar.getInstance();
 * 
 * // 核心能力：立即预编译
 * registrar.register(
 *     { name: 'Event', ctor: EventAbility },
 *     EventAbility,
 *     { immediate: true }
 * );
 * 
 * // 普通能力：懒加载
 * registrar.register(
 *     { name: 'Schema', ctor: SchemaAbility },
 *     SchemaAbility
 * );
 * ```
 * 
 * @example 使用能力
 * ```typescript
 * import { Ability, ComposableBase } from '@/composable';
 * 
 * @Ability('Event', 'Schema')
 * class User extends ComposableBase {
 *     constructor() {
 *         super();
 *     }
 * }
 * 
 * const user = new User();
 * user.on('click', () => {});  // 直接使用
 * console.log(user.loading);   // getter 属性
 * ```
 */
