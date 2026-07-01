/**
 * 能力基类
 * 
 * 提供熟悉的 expose() API，内部自动转换为预编译能力。
 * 
 * 核心机制：
 * - expose(host) 在 factory(host) 阶段调用，host 直接可用
 * - getter/setter 中通过 host 参数访问宿主（闭包直接捕获）
 * - 方法 bind 到宿主，this 就是宿主，this.host 返回宿主自身（ComposableBase getter）
 * - 私有状态通过闭包变量自然 per-host 隔离
 */

import type { 
    IPrecompiledAbility, 
    IPrecompilableAbility,
    IExposeResult 
} from './types/composable';

export type { IExposeResult };

/**
 * AbilityProxy 类型（已废弃）
 * 
 * 新架构下 expose(host) 直接接收 host 参数，不再需要 proxy。
 * 保留此类型仅为兼容旧代码，迁移完成后移除。
 * @deprecated 使用 host 参数替代
 */
export type AbilityProxy = any;

/**
 * 属性定义类型
 */
type PropertyDefinition = 
    | { get: () => any; enumerable?: boolean }
    | { set: (value: any) => void; enumerable?: boolean }
    | { get: () => any; set: (value: any) => void; enumerable?: boolean }
    | Function
    | any;

export abstract class AbilityBase implements IPrecompilableAbility {
    /**
     * 暴露属性和方法
     * 
     * 子类实现此方法，返回要暴露给宿主的属性和方法。
     * 
     * 访问规则：
     * - host 参数直接可用，闭包中直接捕获即可
     * - getter/setter 中：host 访问宿主
     * - 方法中：this 就是宿主（bind），this.host 返回宿主自身
     * - 私有状态：在 expose() 中创建闭包变量，自然 per-host 隔离
     * 
     * @param host - 宿主对象（ComposableBase 实例）
     * @protected
     * 
     * @example
     * ```typescript
     * protected expose(host: any): IExposeResult {
     *     const state = { count: 0 };  // per-host 私有状态
     *     return {
     *         domain: { get: () => host.domain },
     *         count: { get: () => state.count },
     *         increment() { state.count++; },
     *     };
     * }
     * ```
     */
    protected abstract expose(host: any): IExposeResult;
    
    /**
     * 销毁方法，子类可重写
     * 
     * @param host - 正在销毁的宿主对象
     * @protected
     */
    protected onDispose(host: any): void {}
    
    /**
     * 预编译方法
     * 
     * 新设计：expose(host) 在 factory(host) 阶段调用，host 直接可用。
     * 闭包自然捕获 host，无需 hostRef 切换 hack。
     */
    precompile(): IPrecompiledAbility {
        const ability = this;
        
        // 创建描述符工厂：调用 expose(host) 并为每个属性创建 PropertyDescriptor
        const createDescriptors = (host: any): Map<string | symbol, PropertyDescriptor> => {
            const props = ability.expose(host);
            const keys = [...Object.keys(props), ...Object.getOwnPropertySymbols(props)];
            const descriptors = new Map<string | symbol, PropertyDescriptor>();
            
            for (const key of keys) {
                const value = props[key];
                const descriptor = this.createPropertyDescriptor(value, host);
                descriptors.set(key, descriptor);
            }
            
            return descriptors;
        };
        
        // 创建销毁函数工厂
        const createDisposer = (host: any) => {
            return () => {
                ability.onDispose(host);
            };
        };
        
        return { createDescriptors, createDisposer };
    }
    
    /**
     * 为单个属性值创建 PropertyDescriptor
     */
    private createPropertyDescriptor(
        value: PropertyDefinition,
        host: any
    ): PropertyDescriptor {
        // getter/setter 对象
        if (value && typeof value === 'object' && ('get' in value || 'set' in value)) {
            const descriptor: any = {};
            if ('get' in value) {
                descriptor.get = value.get;
            }
            if ('set' in value) {
                descriptor.set = value.set;
            }
            return {
                ...descriptor,
                configurable: true,
                enumerable: value.enumerable ?? true
            };
        }
        
        // 方法：bind 到宿主
        if (typeof value === 'function') {
            return {
                value: value.bind(host),
                writable: true,
                configurable: true,
                enumerable: true
            };
        }
        
        // 普通值
        return {
            value,
            writable: true,
            configurable: true,
            enumerable: true
        };
    }
}
