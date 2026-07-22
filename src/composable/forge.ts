/**
 * forge.ts — 原型工厂函数
 *
 * 核心机制：创建纯函数类 → 初始化内置状态 → 注入能力到原型
 *
 * 内置功能（不可选）：
 *   - abilityState / setAbilityState — 能力私有状态
 *   - onCleanup — 释放钩子注册
 *   - dispose — 释放机制（调用 onCleanup 回调 + 清理能力状态）
 *   - logger — 日志记录器
 *   - host — 宿主自身引用
 *
 * 可选功能：通过 abilities 参数按需组合
 *
 * @example
 * ```ts
 * // 组件：直接用工厂函数
 * const InnerClass = createForgedClass([EventAbility, DomEventsAbility]);
 *
 * // 语法糖：ComposableBase.with()
 * class MyManager extends ComposableBase.with([EventAbility]) {}
 * ```
 */

import { Logger, type ILogger } from '@/logger';
import { debounce as debounceFn } from '@qimenjs/async';
import type { AbilityDefinition, ForgedConstructor, InferAbilities } from './types/ability';

// ══════════════════════════════════════════════════════════════
// 内置 Symbol Keys
// ══════════════════════════════════════════════════════════════

const ABILITY_STATES_KEY = Symbol('__abilityStates__');
const CLEANUPS_KEY = Symbol('__cleanups__');

// ══════════════════════════════════════════════════════════════
// 工具函数
// ══════════════════════════════════════════════════════════════

/**
 * 展平 with() 的参数
 *
 * 支持两种调用方式：
 * - with(AbilityA, AbilityB) → [AbilityA, AbilityB]
 * - with(abilityArray) → abilityArray
 */
function flattenWithArgs(args: readonly AbilityDefinition[]): readonly AbilityDefinition[] {
    if (args.length === 1 && Array.isArray(args[0])) {
        return args[0] as readonly AbilityDefinition[];
    }
    return args;
}

/**
 * 将多个能力定义展平合并为一个 Map（后声明的覆盖先声明的同名键）
 *
 * 跳过以 __ 开头的协议属性和普通值。
 */
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
                        `Ability "${abilityName}" overrides existing symbol key "${String(key)}"`
                    );
                }
                merged.set(key, value);
            }
        }
    }

    return merged;
}

/**
 * 将合并后的能力属性写入原型
 *
 * 只保护内置方法（abilityState / setAbilityState / onCleanup / dispose / host）
 * 不被能力覆盖，能力之间后声明的同名属性覆盖先声明的。
 */
const BUILTIN_KEYS = new Set(['abilityState', 'setAbilityState', 'onCleanup', 'dispose', 'host']);

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

// ══════════════════════════════════════════════════════════════
// 内置方法定义
// ══════════════════════════════════════════════════════════════

function abilityState(this: any, key: string, creator?: () => any): any | undefined {
    const states = this[ABILITY_STATES_KEY] as Map<string, any>;
    if (!states.has(key) && creator) {
        states.set(key, creator());
    }
    return states.get(key);
}

function setAbilityState(this: any, key: string, value: any): void {
    const states = this[ABILITY_STATES_KEY] as Map<string, any>;
    states.set(key, value);
}

function onCleanup(this: any, callback: () => void): void {
    const cleanups = this[CLEANUPS_KEY] as (() => void)[];
    cleanups.push(callback);
}

function dispose(this: any): void {
    const cleanups = this[CLEANUPS_KEY] as (() => void)[];
    for (let i = cleanups.length - 1; i >= 0; i--) {
        try {
            cleanups[i]();
        } catch (e) {
            this.logger?.error?.(`Cleanup error:`, e);
        }
    }
    cleanups.length = 0;

    const states = this[ABILITY_STATES_KEY] as Map<string, any>;
    states.forEach(value => {
        if (value && typeof value === 'object' && typeof value.cancel === 'function') {
            try {
                value.cancel();
            } catch (e) {
                this.logger?.error?.(`Debounce cancel error:`, e);
            }
        }
    });
    states.clear();
}

// ══════════════════════════════════════════════════════════════
// 原型工厂函数
// ══════════════════════════════════════════════════════════════

/**
 * 创建强类 — 原型工厂函数
 *
 * 生成一个拥有内置方法和指定能力的构造函数。
 * 内置方法（abilityState / onCleanup / dispose 等）不可被能力覆盖。
 *
 * @param abilities - 能力定义数组
 * @returns 强类构造函数
 */
export function createForgedClass<A extends readonly AbilityDefinition[]>(
    abilities: A
): ForgedConstructor<any, A> {
    const flat = flattenWithArgs(abilities);
    const merged = flattenAbilities(flat);

    const ForgedClass = function (this: any, ...args: any[]) {
        this.logger = Logger.for(this.constructor.name);

        Object.defineProperty(this, ABILITY_STATES_KEY, {
            value: new Map<string, any>(),
            enumerable: false,
            configurable: true,
        });

        Object.defineProperty(this, CLEANUPS_KEY, {
            value: [] as (() => void)[],
            enumerable: false,
            configurable: true,
        });
    };

    // 内置方法
    ForgedClass.prototype.abilityState = abilityState;
    ForgedClass.prototype.setAbilityState = setAbilityState;
    ForgedClass.prototype.onCleanup = onCleanup;
    ForgedClass.prototype.dispose = dispose;

    // host getter
    Object.defineProperty(ForgedClass.prototype, 'host', {
        get(this: any) {
            return this;
        },
        enumerable: true,
        configurable: true,
    });

    // 注入能力
    applyAbilities(ForgedClass.prototype, merged);

    // 合并能力列表（供 __init__ 机制使用）
    (ForgedClass as any).abilities = [...flat];

    // with 静态方法：链式追加能力
    (ForgedClass as any).with = function <Additional extends readonly AbilityDefinition[]>(
        ...additionalAbilities: Additional
    ): ForgedConstructor<any, [...A, ...Additional]> {
        let additionalFlat: readonly AbilityDefinition[];
        if (additionalAbilities.length === 1 && Array.isArray(additionalAbilities[0])) {
            additionalFlat = additionalAbilities[0] as readonly AbilityDefinition[];
        } else {
            additionalFlat = additionalAbilities;
        }
        const mergedAbilities = [...flat, ...additionalFlat] as unknown as [...A, ...Additional];
        return createForgedClass(mergedAbilities) as any;
    };

    return ForgedClass as unknown as ForgedConstructor<any, A>;
}
