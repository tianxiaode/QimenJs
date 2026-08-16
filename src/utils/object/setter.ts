/**
 * 获取组件的 setter 方法
 * 支持两种风格：
 * 1. setter 语法: set text(value) {}
 * 2. 方法风格: setText(value) {}
 *
 * @param {Object} object - 目标组件对象
 * @param {string} key - 属性名
 * @returns {Function|null} - setter 方法或 null
 */
export function getSetter(object: any, key: string): any | null {
    // 1. 检查 setter 语法 (set text)
    const descriptor = Object.getOwnPropertyDescriptor(object, key);
    if (descriptor?.set && typeof descriptor.set === 'function') {
        return descriptor.set;
    }

    // 2. 检查 setText 方法
    const methodName = `set${key.charAt(0).toUpperCase() + key.slice(1)}`;
    const method = object[methodName];
    if (typeof method === 'function') {
        return method;
    }

    return null;
}

/**
 * 设置组件属性值（自动查找合适的 setter）
 * @param {Object} object - 目标组件对象
 * @param {string} key - 属性名
 * @param {*} value - 要设置的值
 * @returns {boolean} - 是否成功设置
 */
export function setProperty(object: any, key: string, value: any): boolean {
    const setter = getSetter(object, key);

    if (setter) {
        setter.call(object, value);
        return true;
    }

    // fallback: 直接赋值
    if (key in object) {
        object[key] = value;
        return true;
    }

    return false;
}
