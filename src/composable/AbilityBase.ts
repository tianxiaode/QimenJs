/**
 * 能力基类
 * 
 * 提供熟悉的 expose() API，内部自动转换为预编译能力。
 * 
 * 核心机制：
 * - expose(proxy) 接收 proxy 对象，proxy.self = Ability 实例
 * - getter/setter 中通过 proxy.host 访问宿主（通过 hostRef 闭包隔离多实例）
 * - 方法 bind 到宿主，this 就是宿主，this.host 返回宿主自身（ComposableBase getter）
 * - Ability 私有属性通过 proxy.self._xxx 访问
 */

import type { 
    IPrecompiledAbility, 
    IPrecompilableAbility, 
    DescriptorFactoryFn,
    IExposeResult 
} from './types/composable';

export type { IExposeResult };

/**
 * Ability 代理对象，在 expose() 中使用
 * 
 * - host: 宿主对象（ComposableBase 实例），通过 hostRef 闭包隔离多实例
 * - self: Ability 实例自身，用于访问私有属性
 */
export interface AbilityProxy<THost = any, TSelf = any> {
    host: THost;
    self: TSelf;
}

/**
 * 属性定义类型
 */
type PropertyDefinition = 
    | { get: () => any; enumerable?: boolean }
    | { set: (value: any) => void; enumerable?: boolean }
    | { get: () => any; set: (value: any) => void; enumerable?: boolean }
    | Function
    | any;

/**
 * 宿主引用容器
 * 
 * 每个宿主实例有自己的 hostRef，确保多实例隔离。
 * getter/setter 闭包通过 hostRef.value 访问当前宿主。
 */
interface HostRef {
    value: any;
}

export abstract class AbilityBase implements IPrecompilableAbility {
    /**
     * 宿主引用
     * 
     * 仅供 Ability 自身的私有方法使用。
     * 注意：多宿主实例共享同一个 Ability 实例时，此值可能不稳定，
     * 私有方法应通过参数接收 host。
     * 
     * @internal
     */
    protected host: any;
    
    /**
     * 暴露属性和方法
     * 
     * 子类实现此方法，返回要暴露给宿主的属性和方法。
     * 
     * 访问规则：
     * - getter/setter 中：proxy.host 访问宿主，proxy.self 访问 Ability 实例
     * - 方法中：this.host 访问宿主（bind 到宿主，ComposableBase.host getter 返回 this），
     *          proxy.self._xxx 访问 Ability 私有属性
     * 
     * **重要：** 只能在返回的 getter/setter/方法（闭包）中使用 proxy，
     * 不能在 expose() 函数体中直接使用（此时 proxy.host 尚未设置）。
     * 
     * @param proxy - 代理对象，proxy.host 为宿主，proxy.self 为 Ability 实例
     * @protected
     * 
     * @example
     * ```typescript
     * protected expose(proxy: AbilityProxy): IExposeResult {
     *     return {
     *         domain: { get: () => proxy.host.domain },
     *         count: { get: () => proxy.self._count },
     *         doWork: function() { const host = this.host; ... },
     *         increment: function() { proxy.self._count++; },
     *     };
     * }
     * ```
     */
    protected abstract expose(proxy: AbilityProxy): IExposeResult;
    
    /**
     * 销毁方法，子类可重写
     * @protected
     */
    protected onDispose(): void {}
    
    /**
     * 预编译方法
     * 
     * 关键设计：proxy.host 是一个 getter，从 hostRef 读取值。
     * 每个宿主实例有独立的 hostRef，通过闭包绑定确保多实例隔离。
     */
    precompile(): IPrecompiledAbility {
        const descriptorFactories = new Map<string | symbol, DescriptorFactoryFn>();
        const ability = this;

        // 共享的 hostRef，初始为 null
        // 每次 factory(host) 调用时，为当前宿主创建独立的 hostRef
        const sharedHostRef: HostRef = { value: null };

        // proxy.host 是一个 getter，从 hostRef 读取值
        // 闭包中的 proxy.host 会读取当前活跃的 hostRef
        const proxy: AbilityProxy = {
            get host() { return sharedHostRef.value; },
            self: ability,
        };

        // 在 Ability 实例上调用 expose()，传入 proxy
        const props = ability.expose(proxy);
        
        const keys = [...Object.keys(props), ...Object.getOwnPropertySymbols(props)];
        
        for (const key of keys) {
            const value = props[key];
            const factory = this.createDescriptorFactory(value, ability, sharedHostRef);
            descriptorFactories.set(key, factory);
        }
        
        // 创建销毁函数工厂
        const createDisposer = (host: any) => {
            ability.host = host;

            return () => {
                ability.onDispose();
                ability.host = null as any;
            };
        };
        
        return { descriptorFactories, createDisposer };
    }
    
    /**
     * 创建属性描述符工厂
     * 
     * 关键：每个宿主实例有独立的 hostRef，getter/setter 通过 hostRef 访问宿主。
     * 方法 bind 到宿主，this 就是宿主。
     */
    private createDescriptorFactory(
        value: PropertyDefinition,
        ability: AbilityBase,
        sharedHostRef: HostRef
    ): DescriptorFactoryFn {
        // getter/setter 对象：为每个宿主创建独立的 hostRef
        if (value && typeof value === 'object' && ('get' in value || 'set' in value)) {
            return (host) => {
                ability.host = host;
                // 为当前宿主创建独立的 hostRef
                const hostRef: HostRef = { value: host };
                
                const rebound: any = {};
                if ('get' in value) {
                    const originalGet = value.get;
                    rebound.get = () => {
                        // 临时切换 sharedHostRef 指向当前宿主的 hostRef
                        const prev = sharedHostRef.value;
                        sharedHostRef.value = hostRef.value;
                        try {
                            return originalGet.call(ability);
                        } finally {
                            sharedHostRef.value = prev;
                        }
                    };
                }
                if ('set' in value) {
                    const originalSet = value.set;
                    rebound.set = (v: any) => {
                        const prev = sharedHostRef.value;
                        sharedHostRef.value = hostRef.value;
                        try {
                            originalSet.call(ability, v);
                        } finally {
                            sharedHostRef.value = prev;
                        }
                    };
                }

                return {
                    ...rebound,
                    configurable: true,
                    enumerable: value.enumerable ?? true
                };
            };
        }
        
        // 方法：bind 到宿主
        if (typeof value === 'function') {
            return (host) => {
                ability.host = host;
                sharedHostRef.value = host;
                return {
                    value: value.bind(host),
                    writable: true,
                    configurable: true,
                    enumerable: true
                };
            };
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
