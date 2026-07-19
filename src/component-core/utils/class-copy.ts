/**
 * class-copy.ts — 类原型和静态方法复制工具
 *
 * 只复制方法（函数 + getter/setter），不复制数据属性。
 * 用于 withTemplate / replace 的扁平类创建，避免继承链污染。
 */

/**
 * 复制原型方法（函数 + getter/setter），跳过 constructor 和数据属性
 */
export function copyPrototypeMethods(source: any, target: any): void {
    for (const key of Object.getOwnPropertyNames(source.prototype)) {
        if (key === 'constructor') continue;
        const desc = Object.getOwnPropertyDescriptor(source.prototype, key);
        if (!desc) continue;
        if (desc.get || desc.set || typeof desc.value === 'function') {
            Object.defineProperty(target.prototype, key, desc);
        }
    }
}

/**
 * 复制静态方法（函数 + getter/setter），跳过内置属性和数据属性
 */
export function copyStaticMethods(source: any, target: any): void {
    for (const key of Object.getOwnPropertyNames(source)) {
        if (key === 'prototype' || key === 'length' || key === 'name') continue;
        const desc = Object.getOwnPropertyDescriptor(source, key);
        if (!desc) continue;
        if (desc.get || desc.set || typeof desc.value === 'function') {
            Object.defineProperty(target, key, desc);
        }
    }
}
