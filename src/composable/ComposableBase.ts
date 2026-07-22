/**
 * ComposableBase — 语法糖
 *
 * 纯语法糖，内部委托 createForgedClass 原型工厂函数。
 * 用于 class extends 写法：
 *
 * @example
 * ```ts
 * class MyManager extends ComposableBase.with([EventAbility, DomainAbility]) {
 *     domain = 'default';
 *     fetch() { this.emit('fetch'); }
 * }
 * ```
 *
 * 组件不需要 extends，直接用 createForgedClass 即可。
 */

import { createForgedClass } from './forge';
import type { AbilityDefinition, ForgedConstructor, InferAbilities } from './types/ability';

/**
 * 展平 with() 的参数
 */
function flattenWithArgs(args: readonly AbilityDefinition[]): readonly AbilityDefinition[] {
    if (args.length === 1 && Array.isArray(args[0])) {
        return args[0] as readonly AbilityDefinition[];
    }
    return args;
}

export const ComposableBase = {
    /**
     * 创建强类 — 语法糖
     *
     * 等价于 createForgedClass(abilities)，
     * 返回的强类可直接用于 extends。
     *
     * @param abilities - 能力定义数组
     * @returns 强类构造函数
     */
    with<A extends readonly AbilityDefinition[]>(...abilities: A): ForgedConstructor<any, A> {
        const flat = flattenWithArgs(abilities);
        return createForgedClass(flat) as any;
    },
};
