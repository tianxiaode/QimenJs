/**
 * 描述符工厂辅助类
 * 
 * 提供便捷的方法创建各种类型的属性描述符
 * 支持完整的类型推断和类型安全
 * 
 * 注意：在新架构下，expose(host) 直接返回属性描述符，
 * DescriptorFactory 作为辅助工具类仍然可用。
 */

/**
 * 属性描述符工厂函数类型
 * 
 * @template T - 宿主类型
 * @param host - 宿主对象
 * @returns 完整的属性描述符
 */
export type DescriptorFactoryFn<T = any> = (host: T) => PropertyDescriptor;

/**
 * 描述符工厂辅助类
 */
export class DescriptorFactory {
    /**
     * 创建 getter 描述符
     */
    static getter<T = any, R = any>(getter: (host: T) => R): DescriptorFactoryFn<T> {
        return (host) => ({
            get: () => getter(host),
            configurable: true,
            enumerable: true
        });
    }
    
    /**
     * 创建 setter 描述符
     */
    static setter<T = any, V = any>(setter: (host: T, value: V) => void): DescriptorFactoryFn<T> {
        return (host) => ({
            set: (value: V) => setter(host, value),
            configurable: true,
            enumerable: true
        });
    }
    
    /**
     * 创建 getter/setter 描述符
     */
    static accessor<T = any, V = any>(
        getter: (host: T) => V,
        setter?: (host: T, value: V) => void
    ): DescriptorFactoryFn<T> {
        return (host) => {
            const descriptor: PropertyDescriptor = {
                get: () => getter(host),
                configurable: true,
                enumerable: true
            };
            if (setter) {
                descriptor.set = (value: V) => setter(host, value);
            }
            return descriptor;
        };
    }
    
    /**
     * 创建方法描述符
     */
    static method<T = any, Args extends any[] = any[], R = any>(
        method: (host: T, ...args: Args) => R
    ): DescriptorFactoryFn<T> {
        return (host) => ({
            value: (...args: Args) => method(host, ...args),
            writable: true,
            configurable: true,
            enumerable: true
        });
    }
    
    /**
     * 创建值描述符
     */
    static value<T = any, V = any>(value: V): DescriptorFactoryFn<T> {
        return () => ({
            value,
            writable: true,
            configurable: true,
            enumerable: true
        });
    }
    
    /**
     * 创建动态值描述符
     */
    static dynamicValue<T = any, V = any>(valueFactory: (host: T) => V): DescriptorFactoryFn<T> {
        return (host) => ({
            value: valueFactory(host),
            writable: true,
            configurable: true,
            enumerable: true
        });
    }
    
    /**
     * 创建只读值描述符
     */
    static readonlyValue<T = any, V = any>(value: V): DescriptorFactoryFn<T> {
        return () => ({
            value,
            writable: false,
            configurable: true,
            enumerable: true
        });
    }
    
    /**
     * 创建计算属性描述符
     */
    static computed<T = any, R = any>(computer: (host: T) => R): DescriptorFactoryFn<T> {
        return (host) => {
            let cached = false;
            let value: R;
            
            return {
                get: () => {
                    if (!cached) {
                        value = computer(host);
                        cached = true;
                    }
                    return value;
                },
                configurable: true,
                enumerable: true
            };
        };
    }
}
