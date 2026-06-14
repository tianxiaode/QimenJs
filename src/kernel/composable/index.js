"use strict";
/**
 * 可组合能力系统 - 统一导出
 *
 * 这是新框架的核心模块，提供完整的能力管理系统
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebounceAbilityBase = exports.AbilityBase = exports.Ability = exports.ComposableBase = exports.DescriptorFactory = void 0;
// ============================================
// 核心类导出
// ============================================
var DescriptorFactory_1 = require("./DescriptorFactory");
Object.defineProperty(exports, "DescriptorFactory", { enumerable: true, get: function () { return DescriptorFactory_1.DescriptorFactory; } });
var ComposableBase_1 = require("./ComposableBase");
Object.defineProperty(exports, "ComposableBase", { enumerable: true, get: function () { return ComposableBase_1.ComposableBase; } });
Object.defineProperty(exports, "Ability", { enumerable: true, get: function () { return ComposableBase_1.Ability; } });
var AbilityBase_1 = require("./AbilityBase");
Object.defineProperty(exports, "AbilityBase", { enumerable: true, get: function () { return AbilityBase_1.AbilityBase; } });
var DebounceAbilityBase_1 = require("./DebounceAbilityBase");
Object.defineProperty(exports, "DebounceAbilityBase", { enumerable: true, get: function () { return DebounceAbilityBase_1.DebounceAbilityBase; } });
// ============================================
// 使用示例
// ============================================
/**
 * @example 定义能力
 * ```typescript
 * import { DescriptorFactory, IPrecompiledAbility } from '@/kernel/composable';
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
 * import { Ability, ComposableBase } from '@/kernel/composable';
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
//# sourceMappingURL=index.js.map