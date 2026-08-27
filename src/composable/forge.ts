/**
 * forge.ts — 原型工厂函数
 *
 * 提供两个核心函数：
 *   - withAbilities    — 向已有类注入能力（原地修改原型，保留 instanceof）
 *   - withDefinitions   — 向已有类注入非能力定义（body 方法、getter/setter、普通值）
 */

import { Logger } from '@/logger';
import type { AbilityDefinition, Definitions, OptionDefinition } from './types';
import { string } from '@/utils';

const BUILTIN_KEYS = new Set([
    'logger',
    'abilityStatesMap',
    'cleanups',
    '_optionMap',
    '_clearPropertyKeys',
    '_propertyMap',
    '_onOptionChange',
    'abilityState',
    'setAbilityState',
    'onCleanup',
    'onBeforeDispose',
    'onDisposed',
    'dispose',
    'getOptionsMap',
    'getPropertyMap',
]);

function applyAbilitie(proto: any, ability: AbilityDefinition): void {
    for (const key of Object.getOwnPropertyNames(ability)) {
        if (BUILTIN_KEYS.has(key)) continue;

        const descriptor = Object.getOwnPropertyDescriptor(ability, key)!;

        if (descriptor.get || descriptor.set) {
            Object.defineProperty(proto, key, {
                configurable: true,
                enumerable: descriptor.enumerable ?? true,
                get: descriptor.get,
                set: descriptor.set,
            });
            continue;
        }

        const value = descriptor.value;

        if (value && typeof value === 'object' && ('get' in value || 'set' in value)) {
            const accessor: PropertyDescriptor = {
                configurable: true,
                enumerable: value.enumerable ?? true,
            };
            if ('get' in value) accessor.get = value.get;
            if ('set' in value) accessor.set = value.set;
            Object.defineProperty(proto, key, accessor);
            continue;
        }

        if (proto[key]) {
            Logger.for('forge').warn(`Ability ${key} already exists on ${proto.name}`);
        }

        if (typeof value === 'function') {
            applyFunction(key, value, proto);
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
    initConstructorProperties(proto);
    for (const ability of abilities) {
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
// ============================================================
// forge.ts - withDefinitions 增强
// ============================================================

export function withDefinitions(target: any, definitions: Definitions): void {
    const proto = target.prototype;

    const { clearKeys, optionsMap, propertyMap } = initConstructorProperties(proto);

    // ============================================================
    // 1. 处理 options → 生成 getter/setter
    // ============================================================
    if (definitions.options) {
        injectOptions(proto, clearKeys, optionsMap, definitions.options); // 1. 处理 options → 生成 getter/setter
    }

    // ============================================================
    // 2. 处理 property → 直接复制到组件实例
    // ============================================================
    if (definitions.property) {
        const props = definitions.property;
        for (const [key, value] of Object.entries(props)) {
            // 在原型上定义默认值
            Object.defineProperty(proto, key, {
                value: value,
                enumerable: true,
                configurable: true,
                writable: true,
            });
            clearKeys.add(key); // 2. 添加到 clearKeys
            propertyMap.set(key, value);
        }
    }

    // ============================================================
    // 3. 处理方法 → 直接复制到原型
    // ============================================================
    for (const [key, value] of Object.entries(definitions)) {
        if (key === 'options' || key === 'property') continue;
        if (key === 'constructor') continue;
        if (BUILTIN_KEYS.has(key)) continue;

        if (typeof value === 'function') {
            applyFunction(key, value, proto); // 5. 处理方法 → 直接复制到原型
        }
    }
}

function applyFunction(key: string, value: any, proto: any) {
    const isInternal = typeof key === 'string' && key.startsWith('_');
    Object.defineProperty(proto, key, {
        value,
        enumerable: !isInternal,
        configurable: true,
        writable: true,
    });
}

function initConstructorProperties(proto: any) {
    const ctor = proto.constructor;
    const parent = Object.getPrototypeOf(ctor);
    if (!ctor._clearPropertyKeys) {
        ctor._clearPropertyKeys = new Set<string>();
        if (parent.constructor._clearPropertyKeys) {
            ctor._clearPropertyKeys = new Set(parent.constructor._clearPropertyKeys);
        }
    }

    if (!ctor._optionMap) {
        ctor._optionMap = new Map<string, any>();
        if (parent && parent._optionMap) {
            for (const [key, def] of parent._optionMap) {
                ctor._optionMap.set(key, def);
            }
        }
    }

    if (!ctor._propertyMap) {
        ctor._propertyMap = new Map<string, any>();
        if (parent && parent._propertyMap) {
            for (const [key, def] of parent._propertyMap) {
                ctor._propertyMap.set(key, def);
            }
        }
    }

    return {
        clearKeys: ctor._clearPropertyKeys,
        optionsMap: ctor._optionMap,
        propertyMap: ctor._propertyMap,
    };
}

export function injectOptions(
    proto: any,
    clearKeys: Set<string>,
    optionMap: Map<string, any>,
    optionDefs: OptionDefinition
): void {
    for (const [key, def] of Object.entries(optionDefs)) {
        if (key === '__name__' || key === 'isProperty') continue;
        optionMap.set(key, def);
        const storeKey = `_${key}`;
        clearKeys.add(storeKey);
        let defaultValue = def;
        if (typeof def === 'object') {
            defaultValue = def?.default;
        }

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
                const changeKey = `_on${string.capitalize(key)}Change`;
                this[storeKey] = value;

                if (typeof this[changeKey] === 'function') {
                    // ✅ 触发变化通知
                    this[changeKey](value, oldValue, def);
                }

                if (typeof this._markOptionChange === 'function') {
                    // ✅ 触发变化通知
                    this._onOptionChange(key, value, oldValue, def);
                }
            },
            enumerable: true,
            configurable: true,
        });
    }
}
