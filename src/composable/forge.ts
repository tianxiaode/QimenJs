/**
 * forge.ts — 原型工厂函数
 *
 * 核心机制：创建纯函数类 → 初始化内置状态 → 注入能力到原型
 *
 * 内置功能（不可选）：
 *   - abilityState / setAbilityState — 能力私有状态
 *   - onCleanup — 释放回调注册（dispose 时 LIFO 调用）
 *   - onBeforeDispose — 释放前置钩子（可覆写，dispose 最先调用）
 *   - onDisposed — 释放后置钩子（可覆写，dispose 最后调用）
 *   - dispose — 释放机制（onBeforeDispose → onCleanup → 清理状态 → onDisposed）
 *   - logger — 日志记录器

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

import { Logger } from '@/logger';
import type { AbilityDefinition, ForgedConstructor } from './types/ability';

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
                        `Ability "${abilityName}" overrides symbol key "${String(key)}"`
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
 * 只保护内置方法不被能力覆盖，能力之间后声明的同名属性覆盖先声明的。
 */
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

function onBeforeDispose(this: any): void {}

function onDisposed(this: any): void {}

function dispose(this: any): void {
    this.onBeforeDispose();

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

    this.onDisposed();
}

// ══════════════════════════════════════════════════════════════
// 实例状态初始化（供原型复制场景调用）
// ══════════════════════════════════════════════════════════════

/**
 * 初始化 ForgedClass 实例的内置状态
 *
 * 原型复制（copyPrototypeMethods）不触发构造函数，
 * 需要手动调用此函数初始化 logger / abilityStates / cleanups。
 *
 * @param instance - 待初始化的实例
 */
export function initForgedState(instance: any): void {
    instance.logger = Logger.for(instance.constructor.name);

    Object.defineProperty(instance, ABILITY_STATES_KEY, {
        value: new Map<string, any>(),
        enumerable: false,
        configurable: true,
    });

    Object.defineProperty(instance, CLEANUPS_KEY, {
        value: [] as (() => void)[],
        enumerable: false,
        configurable: true,
    });
}

// ══════════════════════════════════════════════════════════════
// 原型工厂函数
// ══════════════════════════════════════════════════════════════

/**
 * 创建强类 — 原型工厂函数
 *
 * 生成一个拥有内置方法和指定能力的构造函数。
 * 内置方法不可被能力覆盖。
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
        initForgedState(this);
    };

    ForgedClass.prototype.abilityState = abilityState;
    ForgedClass.prototype.setAbilityState = setAbilityState;
    ForgedClass.prototype.onCleanup = onCleanup;
    ForgedClass.prototype.onBeforeDispose = onBeforeDispose;
    ForgedClass.prototype.onDisposed = onDisposed;
    ForgedClass.prototype.dispose = dispose;

    applyAbilities(ForgedClass.prototype, merged);

    (ForgedClass as any).abilities = [...flat];

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
