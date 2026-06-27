import { ILogger, Logger } from '@/logger';
import { ComposableRegistrar } from './ComposableRegistrar';
import type { IComposableBase } from './types/composable';
import type { AbilityBase } from './AbilityBase';

/**
 * Symbol 用于存储销毁函数数组
 * @internal
 */
const DISPOSERS_KEY = Symbol('__disposers__');

/**
 * 可组合基类，提供了能力注入和管理的基础功能
 * 
 * 子类通过静态属性 `abilities` 声明所需能力，
 * ComposableBase 在实例化时自动从原型链收集能力并注入。
 * 
 * @example
 * ```typescript
 * class EntityManager extends ComposableBase {
 *     static readonly abilities = [EventAbility, DomainAbility];
 * }
 * ```
 */
export abstract class ComposableBase implements IComposableBase {
    /**
     * 子类应该重写此属性声明所需能力
     * 
     * @example
     * ```typescript
     * static readonly abilities = [EventAbility, DomainAbility];
     * ```
     */
    static readonly abilities: Array<typeof AbilityBase> = [];
    
    /**
     * 日志记录器实例
     */
    logger: ILogger;

    [key: string]: any;

    /**
     * 构造函数，初始化日志记录器和设置能力
     */
    constructor() {
        // 1. 内置日志，初始化即可用
        this.logger = Logger.for(this.constructor.name);
        
        // 2. 初始化销毁函数数组
        Object.defineProperty(this, DISPOSERS_KEY, {
            value: [] as (() => void)[],
            enumerable: false,
            configurable: true
        });
        
        // 3. 设置能力
        this.setupAbilities();
        
        // 4. 应用重写
        this.applyOverrides();
    }

    /**
     * 提供给子类或 Ability 使用：获取类级缓存
     */
    public getStatic<T>(key: string | symbol): T | undefined {
        const ctor = this.constructor as any;
        return ctor._static_storage_?.get(key);
    }

    /**
     * 提供给子类或 Ability 使用：设置类级缓存
     */
    public setStatic<T>(key: string | symbol, value: T): void {
        const ctor = this.constructor as any;
        if (!ctor._static_storage_) {
            Object.defineProperty(ctor, '_static_storage_', {
                value: new Map<string | symbol, any>(),
                enumerable: false,
            });
        }
        ctor._static_storage_.set(key, value);
    }

    /**
     * 从原型链收集能力类
     * 
     * 使用 Object.getOwnPropertyDescriptor 只取自身定义的 abilities，
     * 不取继承的，避免子类覆盖父类。
     * 
     * @returns 合并后的能力类列表（去重）
     */
    protected collectAbilities(): Array<typeof AbilityBase> {
        const CACHE_KEY = '__collected_abilities__';
        
        // 检查类级缓存
        let cached = this.getStatic<Array<typeof AbilityBase>>(CACHE_KEY);
        if (cached) {
            return cached;
        }
        
        // 遍历原型链收集
        const allAbilities: Array<typeof AbilityBase> = [];
        let current = this.constructor as any;
        
        while (current && current !== ComposableBase) {
            // 只取自身定义的 abilities，不取继承的
            const desc = Object.getOwnPropertyDescriptor(current, 'abilities');
            if (desc && Array.isArray(desc.value)) {
                allAbilities.unshift(...desc.value);
            }
            current = Object.getPrototypeOf(current);
        }
        
        // 去重
        const unique = [...new Set(allAbilities)];
        
        // 缓存
        this.setStatic(CACHE_KEY, unique);
        
        return unique;
    }

    /**
     * 自动装配方法：收集能力并注入
     * 
     * @protected
     */
    protected setupAbilities() {
        const abilities = this.collectAbilities();
        const registrar = ComposableRegistrar.getInstance();
        const disposers = (this as any)[DISPOSERS_KEY] as (() => void)[];
        
        abilities.forEach(AbilityClass => {
            // 获取预编译能力（自动预编译+缓存）
            const precompiled = registrar.get(AbilityClass);
            
            if (!precompiled) {
                this.logger.error(`Ability ${AbilityClass.name} is not precompilable`);
                return;
            }
            
            // 挂载能力属性
            precompiled.descriptorFactories.forEach((factory, key) => {
                const descriptor = factory(this);
                Object.defineProperty(this, key, descriptor);
            });
            
            // 创建并存储销毁函数
            if (precompiled.createDisposer) {
                disposers.push(precompiled.createDisposer(this));
            }
        });
        
        this.logger.debug(
            `Abilities setup for ${this.constructor.name}`,
            { abilities: abilities.map(a => a.name) }
        );
    }

    /**
     * 应用重写功能，允许派生类自定义一些功能
     * 
     * @protected
     */
    protected applyOverrides() {
        this.logger.debug(`Applying overrides for ${this.constructor.name}`);
    }

    /**
     * 统一销毁：按装配顺序的逆序执行
     */
    public dispose() {
        const disposers = (this as any)[DISPOSERS_KEY] as (() => void)[];
        
        // 按逆序执行销毁函数
        for (let i = disposers.length - 1; i >= 0; i--) {
            try {
                disposers[i]();
            } catch (e) {
                this.logger.error(`Dispose error:`, e);
            }
        }
        
        // 清空销毁函数数组
        disposers.length = 0;
    }
}
