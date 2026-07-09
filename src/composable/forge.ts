// src/composable/forge.ts

import type {
    AbilityDefinition,
    ForgedConstructor,
    InferAbilities,
} from './types/ability';

/**
 * 将能力定义合并到类的原型上
 *
 * - getter/setter → 原型访问器（所有实例共享，this 指向调用实例）
 * - 方法 → 原型方法（不 bind，调用时 this 自然指向实例）
 * - 普通值 → 跳过（由子类定义或构造函数初始化）
 * - 以 __ 开头的协议属性 → 跳过
 */
function applyAbilitiesToPrototype(
    proto: any,
    abilities: readonly AbilityDefinition[]
): void {
    for (const ability of abilities) {
        const keys = Object.keys(ability);

        for (const key of keys) {
            if (key.startsWith('__')) continue;
            if (key in proto) continue;

            const value = ability[key];

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
                continue;
            }
        }

        // 处理 Symbol 键
        for (const key of Object.getOwnPropertySymbols(ability)) {
            if ((key as symbol) in proto) continue;
            const value = ability[key as any];
            if (typeof value === 'function') {
                proto[key as any] = value;
            }
        }
    }
}

/**
 * 创建强类的内部实现
 *
 * 生成一个继承 BaseClass 的匿名类，将能力合并到其原型上，
 * 并挂载 with 静态方法支持链式调用。
 */
export function createForgedClass<T, A extends readonly AbilityDefinition[]>(
    BaseClass: new (...args: any[]) => T,
    abilities: A,
): ForgedConstructor<T, A> {

    const ForgedClass = class extends (BaseClass as new (...args: any[]) => any) {
        constructor(...args: any[]) {
            super(...args);
        }
    };

    // 将能力合并到新类的原型上
    applyAbilitiesToPrototype(ForgedClass.prototype, abilities);

    // 添加 with 静态方法，支持链式调用
    (ForgedClass as any).with = function<Additional extends readonly AbilityDefinition[]>(
        additionalAbilities: Additional,
    ): ForgedConstructor<T & InferAbilities<Additional>, [...A, ...Additional]> {
        const merged = [...abilities, ...additionalAbilities] as [...A, ...Additional];
        return createForgedClass(ForgedClass, merged) as any;
    };

    return ForgedClass as ForgedConstructor<T, A>;
}
