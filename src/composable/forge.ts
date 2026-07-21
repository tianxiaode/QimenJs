// src/composable/forge.ts

import type { AbilityDefinition, ForgedConstructor, InferAbilities } from './types/ability';
import { Logger } from '@/logger';

const logger = Logger.for('Forge');

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
                logger.warn(`Ability "${abilityName}" overrides existing key "${String(key)}"`);
            }
            merged.set(key, value);
        }

        for (const key of Object.getOwnPropertySymbols(ability)) {
            const value = ability[key as any];
            if (typeof value === 'function') {
                if (merged.has(key)) {
                    logger.warn(
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
 * 只保护原始基类（ComposableBase.prototype）上已有的属性不被覆盖。
 * 能力之间后声明的同名属性覆盖先声明的。
 */
function applyToPrototype(proto: any, merged: Map<string | symbol, any>, rootProto: any): void {
    for (const [key, value] of merged) {
        // 只保护原始基类原型链上的属性
        if ((typeof key === 'string' || typeof key === 'symbol') && key in rootProto) continue;

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
 * 沿原型链找到根基类（ComposableBase）的 prototype
 */
function findRootProto(baseClass: new (...args: any[]) => any): any {
    let current = baseClass;
    while (Object.getPrototypeOf(current.prototype)?.constructor !== Object) {
        current = Object.getPrototypeOf(current.prototype).constructor;
    }
    return current.prototype;
}

/**
 * 创建强类的内部实现
 *
 * 生成一个继承 BaseClass 的匿名类，将能力合并到其原型上，
 * 并挂载 with 静态方法支持链式调用。
 */
export function createForgedClass<T, A extends readonly AbilityDefinition[]>(
    BaseClass: new (...args: any[]) => T,
    abilities: A
): ForgedConstructor<T, A> {
    const ForgedClass = class extends (BaseClass as new (...args: any[]) => any) {
        constructor(...args: any[]) {
            super(...args);
        }
    };

    // 展平合并所有能力，一次性写入原型
    const merged = flattenAbilities(abilities);
    const rootProto = findRootProto(BaseClass);
    applyToPrototype(ForgedClass.prototype, merged, rootProto);

    // 合并基类和新增的能力到 ForgedClass.abilities
    // 使 callInitMethods 能发现所有能力的 __init__ 方法
    const baseAbilities = (BaseClass as any).abilities || [];
    (ForgedClass as any).abilities = [...baseAbilities, ...abilities];

    // with 静态方法：可变参数，合并所有能力后重新创建强类
    // 注意：必须用 this 而不是闭包中的 ForgedClass，
    // 因为子类可能 extends ForgedClass 并添加自身方法，
    // 用 this 才能保证子类再 with() 时继承的是子类自身
    (ForgedClass as any).with = function <Additional extends readonly AbilityDefinition[]>(
        ...additionalAbilities: Additional
    ): ForgedConstructor<T & InferAbilities<Additional>, [...A, ...Additional]> {
        // 展平：支持 with(A, B) 和 with(array) 两种方式
        let flat: readonly AbilityDefinition[];
        if (additionalAbilities.length === 1 && Array.isArray(additionalAbilities[0])) {
            flat = additionalAbilities[0] as readonly AbilityDefinition[];
        } else {
            flat = additionalAbilities;
        }
        const mergedAbilities = [...abilities, ...flat] as unknown as [...A, ...Additional];
        return createForgedClass(this, mergedAbilities) as any;
    };

    return ForgedClass as ForgedConstructor<T, A>;
}
