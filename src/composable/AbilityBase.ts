/**
 * 能力基类 - 新版本
 * 
 * 结合了熟悉的 expose() API 和预编译性能优势
 */

import type { 
    IPrecompiledAbility, 
    IPrecompilableAbility, 
    DescriptorFactoryFn,
    IExposeResult 
} from './types/composable';

// Re-export IExposeResult for convenience
export type { IExposeResult };

/**
 * 属性定义类型
 */
type PropertyDefinition = 
    | { get: () => any; enumerable?: boolean }  // getter
    | { set: (value: any) => void; enumerable?: boolean }  // setter
    | { get: () => any; set: (value: any) => void; enumerable?: boolean }  // getter/setter
    | Function  // 方法
    | any;  // 值

/**
 * 能力基类
 * 
 * 提供熟悉的 expose() API，内部自动转换为预编译能力
 * 
 * @example
 * ```typescript
 * class EventAbility extends AbilityBase {
 *     protected expose(): IExposeResult {
 *         const scope = globalEventBus.createEventScope();
 *         
 *         return {
 *             eventScope: { get: () => scope },
 *             on: (event, handler) => scope.on(event, handler),
 *             emit: (event, data) => scope.emit(event, data),
 *         };
 *     }
 *     
 *     protected onDispose(): void {
 *         this.eventScope?.dispose();
 *     }
 * }
 * ```
 */
export abstract class AbilityBase implements IPrecompilableAbility {
    /**
     * 宿主引用（在运行时通过闭包捕获）
     * @protected
     */
    protected host: any;
    
    /**
     * 暴露属性和方法
     * 
     * 子类实现此方法，返回要暴露给宿主的属性和方法
     * 
     * **重要：** 在 expose() 中不能使用 this.host，因为此时 host 还未设置！
     * 如果需要访问 host，请在返回的 getter/setter/方法中访问。
     * 
     * @returns 属性和方法定义
     * @protected
     * 
     * @example
     * ```typescript
     * // ❌ 错误：在 expose() 中使用 this.host
     * protected expose() {
     *     const domain = this.host.domain;  // this.host 是 undefined！
     *     return { domain: { get: () => domain } };
     * }
     * 
     * // ✅ 正确：在 getter 中使用 this.host
     * protected expose() {
     *     return {
     *         domain: { 
     *             get: () => this.host.domain  // 在 getter 中访问
     *         }
     *     };
     * }
     * ```
     */
    protected abstract expose(): IExposeResult;
    
    /**
     * 销毁方法
     * 
     * 子类可重写此方法执行清理逻辑
     * 
     * @protected
     */
    protected onDispose(): void {
        // 默认空实现，子类可重写
    }
    
    /**
     * 预编译方法
     * 
     * 将 expose() 返回的定义转换为预编译能力
     * 
     * @returns 预编译能力
     */
    precompile(): IPrecompiledAbility {
        const descriptorFactories = new Map<string | symbol, DescriptorFactoryFn>();
        
        // 创建临时实例来调用 expose()
        const tempInstance = Object.create(this.constructor.prototype);
        tempInstance.host = null;  // 设置临时 host
        const props = tempInstance.expose();
        
        // 转换每个属性定义
        const keys = [...Object.keys(props), ...Object.getOwnPropertySymbols(props)];
        
        for (const key of keys) {
            const value = props[key];
            const descriptor = this.createDescriptorFactory(value);
            descriptorFactories.set(key, descriptor);
        }
        
        // 创建销毁函数工厂
        const createDisposer = (host: any) => {
            // 设置 host 引用
            this.host = host;
            
            // 返回销毁函数
            return () => {
                this.onDispose();
                this.host = null as any;
            };
        };
        
        return {
            descriptorFactories,
            createDisposer
        };
    }
    
    /**
     * 创建属性描述符工厂
     * 
     * @param value - 属性定义
     * @returns 描述符工厂
     * @private
     */
    private createDescriptorFactory(value: PropertyDefinition): DescriptorFactoryFn {
        // getter/setter 对象
        if (value && typeof value === 'object' && ('get' in value || 'set' in value)) {
            return (host) => {
                // 设置 host 引用，以便 getter/setter 中可以访问 this.host
                this.host = host;
                
                return {
                    ...value,
                    configurable: true,
                    enumerable: value.enumerable ?? true
                };
            };
        }
        
        // 方法
        if (typeof value === 'function') {
            return (host) => ({
                value: value.bind(host),
                writable: true,
                configurable: true,
                enumerable: true
            });
        }
        
        // 普通值
        return () => ({
            value,
            writable: true,
            configurable: true,
            enumerable: true
        });
    }
}
