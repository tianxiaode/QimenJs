/**
 * forge.ts — 原型工厂函数
 *
 * 提供两个核心函数：
 *   - withAbilities    — 向已有类注入能力（原地修改原型，保留 instanceof）
 *   - withDefinitions   — 向已有类注入非能力定义（body 方法、getter/setter、普通值）
 */

import { Logger } from '@/logger';
import type { AbilityDefinition } from './types/ability';

export const ABILITY_STATES_KEY = Symbol('__abilityStates__');
export const CLEANUPS_KEY = Symbol('__cleanups__');

function flattenWithArgs(args: readonly AbilityDefinition[]): readonly AbilityDefinition[] {
    if (args.length === 1 && Array.isArray(args[0])) {
        return args[0] as readonly AbilityDefinition[];
    }
    return args;
}

function flattenAbilities(abilities: readonly AbilityDefinition[]): Map<string | symbol, any> {
    const merged = new Map<string | symbol, any>();

    for (const ability of abilities) {
        const abilityName = (ability as any).__name__ || '(anonymous)';

        for (const key of Object.keys(ability)) {
            if (key.startsWith('__')) continue;

            const value = ability[key];
            if (
                typeof value !== 'function' &&
                !(value && typeof value === 'object' && ('get' in value || 'set' in value))
            ) {
                continue;
            }
            if (merged.has(key)) {
                Logger.for('Forge').warn(
                    `Ability "${abilityName}" overrides existing key "${String(key)}"`
                );
            }
            merged.set(key, value);
        }

        for (const key of Object.getOwnPropertySymbols(ability)) {
            const value = ability[key as any];
            if (typeof value === 'function') {
                if (merged.has(key)) {
                    Logger.for('Forge').warn(
                        `Ability "${abilityName}" overrides symbol key "${String(key)}"`
                    );
                }
                merged.set(key, value);
            }
        }
    }

    return merged;
}

const BUILTIN_KEYS = new Set([
    'abilityState',
    'setAbilityState',
    'onCleanup',
    'onBeforeDispose',
    'onDisposed',
    'dispose',
]);

function applyAbilities(proto: any, merged: Map<string | symbol, any>): void {
    for (const [key, value] of merged) {
        if (typeof key === 'string' && BUILTIN_KEYS.has(key)) continue;

        if (value && typeof value === 'object' && ('get' in value || 'set' in value)) {
            const descriptor: PropertyDescriptor = {
                configurable: true,
                enumerable: value.enumerable ?? true,
            };
            if ('get' in value) descriptor.get = value.get;
            if ('set' in value) descriptor.set = value.set;
            Object.defineProperty(proto, key, descriptor);
            continue;
        }

        if (typeof value === 'function') {
            proto[key] = value;
        }
    }
}

/**
 * 向已有类注入能力（原地修改原型）
 *
 * 适用于 class extends 后再添加能力的场景，保留原型链和 instanceof。
 *
 * @example
 * ```ts
 * class MyManager extends CoreEntityManager {
 *     fetch() { ... }
 * }
 * withAbilities(MyManager, [LocalListAbility, LocalGetAbility]);
 *
 * new MyManager() instanceof CoreEntityManager // true
 * ```
 */
export function withAbilities(target: any, abilities: readonly AbilityDefinition[]): void {
    const flat = flattenWithArgs(abilities);
    const merged = flattenAbilities(flat);
    applyAbilities(target.prototype, merged);
    target.abilities = [...(target.abilities || []), ...flat];
}

/**
 * 向已有类注入非能力定义（原地修改原型）
 *
 * 用于注入 body 定义（方法、getter/setter、普通值属性），
 * 与 withAbilities 的区别：
 *   - 不跳过 __ 前缀 key
 *   - 不过滤非函数/非 accessor 值（普通值也复制到原型）
 *   - 不维护 abilities 数组
 *
 * @example
 * ```ts
 * class MyComponent extends TemplateComponent {}
 * withAbilities(MyComponent, [EventAbility]);
 * withDefinitions(MyComponent, bodyDef);
 * ```
 */
export function withDefinitions(target: any, definitions: Record<string, any>): void {
    const proto = target.prototype;
    const descs = Object.getOwnPropertyDescriptors(definitions);
    for (const [key, desc] of Object.entries(descs)) {
        if (key === 'constructor') continue;

        if (typeof key === 'string' && BUILTIN_KEYS.has(key)) continue;

        if (desc.get || desc.set) {
            Object.defineProperty(proto, key, {
                configurable: true,
                enumerable: desc.enumerable ?? true,
                get: desc.get,
                set: desc.set,
            });
        } else {
            proto[key] = desc.value;
        }
    }
}
