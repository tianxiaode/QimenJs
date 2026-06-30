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
     * 获取或创建当前 Ability 在当前宿主上的 Per-Host 私有状态
     * 
     * 每个 Ability 实例在每个宿主上有独立的状态，通过 key 区分。
     * 状态存储在宿主（ComposableBase）上，dispose 时自动清理。
     * 
     * **注意**：只能在方法闭包或 getter/setter 闭包中调用，
     * 此时 this.host 已正确指向当前宿主。
     * 
     * @param key - 状态键名，默认为 'default'
     * @param factory - 首次访问时创建默认状态的工厂函数
     * @returns 该 Ability 在当前宿主上的状态对象
     * 
     * @example
     * ```typescript
     * class CounterAbility extends AbilityBase {
     *     private getCountState() {
     *         return this.getOrCreateState(() => ({ count: 0 }));
     *     }
     *     protected expose(proxy: AbilityProxy): IExposeResult {
     *         return {
     *             count: { get: () => proxy.self.getCountState().count },
     *             increment: function() { proxy.self.getCountState().count++; },
     *         };
     *     }
     * }
     * ```
     */
    protected getOrCreateState<T>(factory: () => T, key: string | symbol = 'default'): T {
        return (this.host as any).getOrCreateAbilityState(this, key, factory) as T;
    }
    
    /**
     * 获取当前 Ability 在当前宿主上的 Per-Host 私有状态（不创建）
     * 
     * @param key - 状态键名，默认为 'default'
     * @returns 状态对象，如果不存在返回 undefined
     */
    protected getState<T>(key: string | symbol = 'default'): T | undefined {
        return (this.host as any).getAbilityState(this, key) as T | undefined;
    }
    
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
            return () => {
                // 确保 onDispose 中 this.host 指向当前正在 dispose 的宿主
                const prevHost = ability.host;
                ability.host = host;
                ability.onDispose();
                // 恢复之前的 host 引用（多宿主共享时不应设为 null）
                ability.host = prevHost;
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
                        // 临时切换 sharedHostRef 和 ability.host 指向当前宿主
                        const prevRef = sharedHostRef.value;
                        const prevHost = ability.host;
                        sharedHostRef.value = hostRef.value;
                        ability.host = host;
                        try {
                            return originalGet.call(ability);
                        } finally {
                            sharedHostRef.value = prevRef;
                            ability.host = prevHost;
                        }
                    };
                }
                if ('set' in value) {
                    const originalSet = value.set;
                    rebound.set = (v: any) => {
                        const prevRef = sharedHostRef.value;
                        const prevHost = ability.host;
                        sharedHostRef.value = hostRef.value;
                        ability.host = host;
                        try {
                            originalSet.call(ability, v);
                        } finally {
                            sharedHostRef.value = prevRef;
                            ability.host = prevHost;
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
        
        // 方法：bind 到宿主，调用时临时切换 sharedHostRef 确保 proxy.host 正确
        if (typeof value === 'function') {
            return (host) => {
                ability.host = host;
                // 为当前宿主创建独立的 hostRef
                const hostRef: HostRef = { value: host };
                // 同时更新 sharedHostRef，确保箭头函数闭包中的 proxy.host 也能正确工作
                sharedHostRef.value = host;
                // 包装方法：调用时临时切换 sharedHostRef 和 ability.host
                const wrappedFn = function(this: any, ...args: any[]) {
                    const prevRef = sharedHostRef.value;
                    const prevHost = ability.host;
                    sharedHostRef.value = hostRef.value;
                    ability.host = host;
                    try {
                        return (value as Function).apply(this, args);
                    } finally {
                        sharedHostRef.value = prevRef;
                        ability.host = prevHost;
                    }
                };
                return {
                    value: wrappedFn.bind(host),
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
