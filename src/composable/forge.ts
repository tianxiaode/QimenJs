/**
 * forge.ts — 原型工厂函数
 *
 * 提供两个核心函数：
 *   - withAbilities    — 向已有类注入能力（原地修改原型，保留 instanceof）
 *   - withDefinitions   — 向已有类注入非能力定义（body 方法、getter/setter、普通值）
 */

import { Logger } from '@/logger';
import type { AbilityDefinition, Definitions } from './types';

export const DATA_MAP_SYMBOL = Symbol('data-map-symbol');
export const DATA_SYMBOL = Symbol('data-symbol');
const BUILTIN_KEYS = new Set([
    'logger',
    'cleanups',
    'constructor',
    'getData',
    'setData',
    'optionsKeys',
    'propertyKeys',
    'getDataMap',
    '_getData',
    'getDefaultValue',
    'abilityState',
    'setAbilityState',
    'onCleanup',
    'onBeforeDispose',
    'onDisposed',
    'dispose',
    'ClearProperties',
    'clearDataMap',
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

    const dataMap = initConstructorProperties(proto);

    // ============================================================
    // 1. 处理 options → 生成 getter/setter
    // ============================================================

    if (definitions.options) {
        for (const [key, value] of Object.entries(definitions.options)) {
            if (BUILTIN_KEYS.has(key)) continue;
            dataMap.optionsKeys.add(key);
            if (value) {
                dataMap.defaultValues[key] = value;
            }

            defineGetterSetter(proto, key);
        }
    }

    // ============================================================
    // 2. 处理 fields/privateFields → 直接复制到组件实例
    // ============================================================
    if (definitions.fields) {
        applyProperties(proto, definitions.fields, dataMap);
    }

    if (definitions.privateFields) {
        applyProperties(proto, definitions.privateFields, dataMap, true);
    }

    // ============================================================
    // 3. 处理方法 → 直接复制到原型
    // ============================================================
    for (const [key, value] of Object.entries(definitions.overrides ?? {})) {
        if (BUILTIN_KEYS.has(key)) continue;

        if (typeof value === 'function') {
            applyFunction(key, value, proto);
        }
    }
}

function applyFunction(key: string, value: any, proto: any) {
    const isInternal = typeof key === 'string' && key.startsWith('_');
    defineProperty(proto, key, value, !isInternal); // 1. 处理 options → 生成 getter/setter
}

function applyProperties(
    proto: any,
    properties: Record<string, any>,
    dataMap: Record<string, any>,
    isPrivate = false
) {
    for (const [key, value] of Object.entries(properties)) {
        if (BUILTIN_KEYS.has(key)) continue;

        const isInternal = typeof key === 'string' && key.startsWith('_');
        defineProperty(proto, key, value, !isInternal);
        dataMap.propertyClearKeys.push(key); // 2. 添加到 clearKeys
        if (!isPrivate) {
            dataMap.propertyKeys.add(key); // 3. 添加到 propertyKeys
        }
    }
}

function defineProperty(proto: any, key: string, value: any, enumerable: boolean) {
    Object.defineProperty(proto, key, {
        value: value,
        enumerable: enumerable,
        configurable: true,
        writable: true,
    });
}

function defineGetterSetter(proto: any, key: string) {
    Object.defineProperty(proto, key, {
        get() {
            return this.getData(key);
        },
        set(value) {
            this.setData(key, value);
        },
        enumerable: true,
        configurable: true,
    });
}

function initConstructorProperties(proto: any) {
    const ctor = proto.constructor;
    const parent = Object.getPrototypeOf(ctor);
    const parentData = parent[DATA_MAP_SYMBOL] ?? {
        defaultValues: {},
        optionsKeys: new Set<string>(),
        propertyKeys: new Set<string>(),
        propertyClearKeys: [],
    };
    ctor[DATA_MAP_SYMBOL] = {
        defaultValues: { ...parentData.defaultValues },
        optionsKeys: new Set<string>(parentData.optionsKeys),
        propertyKeys: new Set<string>(parentData.propertyKeys),
        propertyClearKeys: [...parentData.propertyClearKeys],
    };
    return ctor[DATA_MAP_SYMBOL]; // 4. 返回 dataMap
}
