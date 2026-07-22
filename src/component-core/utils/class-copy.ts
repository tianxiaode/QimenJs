/**
 * class-copy.ts — 类原型和静态方法复制工具
 *
 * 只复制方法（函数 + getter/setter），不复制数据属性。
 * 用于 withTemplate / replace 的扁平类创建，避免继承链污染。
 *
 * copyPrototypeMethods 遍历整条原型链（到 Object.prototype 为止），
 * 确保父类（如 ForgedClass）的方法也被复制到目标原型。
 * 子类覆盖的方法优先（先复制到的不会被后复制到的覆盖）。
 */

/**
 * 复制原型方法（函数 + getter/setter），跳过 constructor 和数据属性
 *
 * 遍历 source.prototype 到 Object.prototype 之间的整条原型链，
 * 从子类到父类逐层复制，子类方法优先（已存在的键不会被覆盖）。
 */
export function copyPrototypeMethods(source: any, target: any): void {
    let current = source.prototype;
    while (current && current !== Object.prototype) {
        for (const key of Object.getOwnPropertyNames(current)) {
            if (key === 'constructor') continue;
            if (Object.prototype.hasOwnProperty.call(target.prototype, key)) continue;
            const desc = Object.getOwnPropertyDescriptor(current, key);
            if (!desc) continue;
            if (desc.get || desc.set || typeof desc.value === 'function') {
                Object.defineProperty(target.prototype, key, desc);
            }
        }
        current = Object.getPrototypeOf(current);
    }
}

/**
 * 复制静态方法（函数 + getter/setter），跳过内置属性和数据属性
 *
 * 遍历 source 到 Function.prototype 之间的整条原型链，
 * 确保父类静态方法（如 ForgedClass.with）也被复制。
 */
export function copyStaticMethods(source: any, target: any): void {
    let current = source;
    while (current && current !== Function.prototype) {
        for (const key of Object.getOwnPropertyNames(current)) {
            if (key === 'prototype' || key === 'length' || key === 'name') continue;
            if (Object.prototype.hasOwnProperty.call(target, key)) continue;
            const desc = Object.getOwnPropertyDescriptor(current, key);
            if (!desc) continue;
            if (desc.get || desc.set || typeof desc.value === 'function') {
                Object.defineProperty(target, key, desc);
            }
        }
        current = Object.getPrototypeOf(current);
    }
}
