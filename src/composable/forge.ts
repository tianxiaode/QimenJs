/**
 * forge.ts — 原型工厂函数
 *
 * 提供两个核心函数：
 *   - withAbilities    — 向已有类注入能力（原地修改原型，保留 instanceof）
 *   - withDefinitions   — 向已有类注入非能力定义（body 方法、getter/setter、普通值）
 */

import { Logger } from '@/logger';
import type { AbilityDefinition, PropertyDefinition } from './types';

export const ABILITY_STATES_KEY = Symbol('__abilityStates__');
export const CLEANUPS_KEY = Symbol('__cleanups__');

const BUILTIN_KEYS = new Set([
    'abilityState',
    'setAbilityState',
    'onCleanup',
    'onBeforeDispose',
    'onDisposed',
    'dispose',
]);

function applyAbilitie(proto: any, ability: AbilityDefinition): void {
    for (const [key, value] of Object.entries(ability)) {
        if (typeof key === 'string' && BUILTIN_KEYS.has(key)) continue;

        if (proto[key]) {
            Logger.for('forge').warn(`Ability ${key} already exists on ${proto.name}`);
        }

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
            const isInternal = typeof key === 'string' && key.startsWith('_');
            Object.defineProperty(proto, key, {
                value,
                enumerable: !isInternal,
                configurable: true,
                writable: true,
            });
            continue;
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
    const proto = target.prototype;
    for (const ability of abilities) {
        if (ability.isProperty) {
            injectProperties(proto, ability as PropertyDefinition);
            continue;
        }
        applyAbilitie(proto, ability);
    }
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

export function injectProperties(proto: any, propertyDefs: PropertyDefinition): void {
    const map = {} as any;
    const keys = [] as string[];
    let length = 0;
    for (const [key, def] of Object.entries(propertyDefs)) {
        if (key === '__name__' || key === 'isProperty') continue;
        const storeKey = `_${key}`;
        const defaultValue = (def as any)?.default;
        map[key] = def;
        keys.push(key);
        length++;

        // ✅ 直接定义初始值（不经过 setter）
        Object.defineProperty(proto, storeKey, {
            value: defaultValue,
            enumerable: false,
            configurable: true,
            writable: true,
        });

        // getter/setter
        Object.defineProperty(proto, key, {
            get: function () {
                return this[storeKey];
            },
            set: function (value: any) {
                const oldValue = this[storeKey];
                this[storeKey] = value;

                // ✅ 触发变化通知
                if (typeof this._onPropertyChange === 'function') {
                    this._onPropertyChange(key, value, oldValue, def);
                }
            },
            enumerable: true,
            configurable: true,
        });
    }

    if (length === 0) return;
    const ctor = proto.constructor;
    ctor._propertyMap = map;
    ctor._propertyKeys = keys;

    // ============================================================
    // ✅ 1. 工具方法
    // ============================================================
    Object.defineProperty(proto, 'getPropertyMap', {
        value: function () {
            return (this.constructor as any)._propertyMap || {};
        },
        enumerable: false,
        configurable: true,
    });

    Object.defineProperty(proto, 'getPropertyKeys', {
        value: function () {
            return (this.constructor as any)._propertyKeys || [];
        },
        enumerable: false,
        configurable: true,
    });

    Object.defineProperty(proto, 'getPropertyDef', {
        value: function (key: string) {
            const _map = (this.constructor as any)._propertyMap;
            return _map[key];
        },
        enumerable: false,
        configurable: true,
    });
}
