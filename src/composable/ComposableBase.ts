import { ILogger, Logger } from '@/logger';
import { debounce as debounceFn } from '@orbitjs/async';
import type { IComposableBase, AbilityConstructor } from './types/composable';

/**
 * Symbol 用于存储销毁函数数组
 * @internal
 */
const DISPOSERS_KEY = Symbol('__disposers__');

/**
 * Symbol 用于存储能力私有状态
 * @internal
 */
const ABILITY_STATES_KEY = Symbol('__abilityStates__');

/**
 * Symbol 用于存储清理回调
 * @internal
 */
const CLEANUPS_KEY = Symbol('__cleanups__');

/**
 * 能力定义类型
 * 
 * 新架构：Ability 是普通对象，属性/方法直接复制到宿主。
 * - 方法：普通函数，复制后 this 指向宿主
 * - getter/setter：{ get() {...}, set(v) {...} } 对象
 * - 普通值：直接复制
 */
export type AbilityDefinition = Record<string | symbol, any>;

/**
 * 能力类型：旧版 AbilityBase 类 或 新版普通对象
 */
export type AbilityType = AbilityConstructor | AbilityDefinition;

/**
 * 可组合基类，提供了能力注入和管理的基础功能
 * 
 * 子类通过静态属性 `abilities` 声明所需能力，
 * ComposableBase 在实例化时自动从原型链收集能力并注入。
 * 
 * 新架构：
 * - Ability 是普通对象，属性/方法直接复制到宿主
 * - 私有状态通过 abilityState() 管理，宿主统一管理
 * - 防抖通过 debounce() 管理，宿主统一管理
 * - 清理通过 onCleanup() 注册，宿主 dispose 时统一执行
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
    static readonly abilities: readonly AbilityType[] = [];
    
    /**
     * 日志记录器实例
     */
    logger: ILogger;

    [key: string]: any;

    /**
     * 获取宿主对象自身
     * 
     * 在 Ability 方法中，this 被 bind 到宿主，this.host 返回宿主自身。
     * 语义上等价于 return this，但更清晰地表达意图。
     * 
     * 使用 getter 而非方法，使得 getter/setter 和方法中都可以统一使用 this.host。
     */
    public get host(): this {
        return this;
    }

    /**
     * 构造函数，初始化日志记录器和设置能力
     */
    constructor() {
        // 1. 内置日志，初始化即可用
        this.logger = Logger.for(this.constructor.name);
        
        // 2. 初始化销毁函数数组（旧机制兼容）
        Object.defineProperty(this, DISPOSERS_KEY, {
            value: [] as (() => void)[],
            enumerable: false,
            configurable: true
        });
        
        // 3. 初始化能力私有状态
        Object.defineProperty(this, ABILITY_STATES_KEY, {
            value: new Map<string, any>(),
            enumerable: false,
            configurable: true
        });
        
        // 4. 初始化清理回调数组
        Object.defineProperty(this, CLEANUPS_KEY, {
            value: [] as (() => void)[],
            enumerable: false,
            configurable: true
        });
        
        // 5. 设置能力
        this.setupAbilities();
        
        // 6. 应用重写
        this.applyOverrides();
    }

    // ============================================
    // 能力私有状态管理
    // ============================================

    /**
     * 获取或创建能力私有状态
     * 
     * 每个宿主实例有独立的 abilityStates Map，key 由 Ability 自行定义。
     * 宿主 dispose 时自动清空所有 abilityStates。
     * 
     * @param key - 状态键，建议使用 'AbilityName:stateName' 格式避免冲突
     * @param creator - 首次访问时的创建函数
     * @returns 状态值
     * 
     * @example
     * ```typescript
     * // 在 Ability 方法中
     * const snapshots = this.abilityState('StateDirty:snapshots', () => new Map());
     * ```
     */
    abilityState<T>(key: string, creator?: () => T): T | undefined {
        const states = (this as any)[ABILITY_STATES_KEY] as Map<string, any>;
        if (!states.has(key) && creator) {
            states.set(key, creator());
        }
        return states.get(key);
    }

    /**
     * 设置能力私有状态
     * 
     * @param key - 状态键
     * @param value - 状态值
     */
    setAbilityState<T>(key: string, value: T): void {
        const states = (this as any)[ABILITY_STATES_KEY] as Map<string, any>;
        states.set(key, value);
    }

    // ============================================
    // 防抖管理
    // ============================================

    /**
     * 获取或创建防抖函数
     * 
     * 基于 abilityState 实现，每个宿主有独立的防抖函数。
     * 宿主 dispose 时自动 cancel 所有防抖函数。
     * 
     * @param key - 防抖标识键
     * @param fn - 原始函数
     * @param wait - 等待时间（毫秒），默认 0
     * @param immediate - 是否立即执行，默认 false
     * @returns 防抖后的函数
     * 
     * @example
     * ```typescript
     * // 在 Ability 方法中
     * this.debounce('save', () => this._doSave(), 500)();
     * ```
     */
    debounce<A extends (...args: any[]) => any>(
        key: string,
        fn: A,
        wait: number = 0,
        immediate: boolean = false
    ): A & { cancel(): void } {
        return this.abilityState(`__debounce_${key}`, () => debounceFn(fn, wait, immediate)) as A & { cancel(): void };
    }

    // ============================================
    // 清理回调管理
    // ============================================

    /**
     * 注册清理回调
     * 
     * 宿主 dispose 时按注册逆序执行所有清理回调。
     * 用于需要副作用的清理场景（如释放外部资源、解绑事件等）。
     * 
     * @param callback - 清理回调函数
     * 
     * @example
     * ```typescript
     * // 在 Ability 方法中
     * const provider = this.abilityState('cache:provider', () => CacheFactory.create(...));
     * this.onCleanup(() => CacheFactory.release(provider.id, true));
     * ```
     */
    onCleanup(callback: () => void): void {
        const cleanups = (this as any)[CLEANUPS_KEY] as (() => void)[];
        cleanups.push(callback);
    }

    // ============================================
    // 类级缓存
    // ============================================

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

    // ============================================
    // 能力收集与装配
    // ============================================

    /**
     * 从原型链收集能力
     * 
     * 使用 Object.getOwnPropertyDescriptor 只取自身定义的 abilities，
     * 不取继承的，避免子类覆盖父类。
     * 
     * @returns 合并后的能力列表（去重）
     */
    protected collectAbilities(): AbilityType[] {
        const CACHE_KEY = '__collected_abilities__';
        
        // 检查类级缓存
        let cached = this.getStatic<AbilityType[]>(CACHE_KEY);
        if (cached) {
            return cached;
        }
        
        // 遍历原型链收集
        const allAbilities: AbilityType[] = [];
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
     * 支持两种能力格式：
     * - 新版：普通对象（AbilityDefinition），属性/方法直接复制到宿主
     * - 旧版：AbilityBase 类，通过 ComposableRegistrar 预编译后注入
     * 
     * @protected
     */
    protected setupAbilities() {
        const abilities = this.collectAbilities();
        const disposers = (this as any)[DISPOSERS_KEY] as (() => void)[];

        abilities.forEach(ability => {
            if (this.isAbilityDefinition(ability)) {
                // 新版：普通对象，直接复制属性/方法到宿主
                this.setupAbilityDefinition(ability);
            } else {
                // 旧版：AbilityBase 类，通过 ComposableRegistrar 预编译
                this.setupLegacyAbility(ability as AbilityConstructor, disposers);
            }
        });
        
        this.logger.debug(
            `Abilities setup for ${this.constructor.name}`,
            { abilities: abilities.map(a => typeof a === 'function' ? a.name : 'object') }
        );
    }

    /**
     * 判断是否为新版 Ability 定义（普通对象）
     */
    private isAbilityDefinition(ability: AbilityType): ability is AbilityDefinition {
        return typeof ability !== 'function';
    }

    /**
     * 装配新版 Ability 定义
     * 
     * 遍历对象的所有属性，用 Object.defineProperty 复制到宿主。
     * - getter/setter 对象 → 直接作为 descriptor 的 get/set
     * - 函数 → bind 到宿主
     * - 普通值 → 直接作为 value
     */
    private setupAbilityDefinition(definition: AbilityDefinition): void {
        const keys = [...Object.keys(definition), ...Object.getOwnPropertySymbols(definition)];
        
        for (const key of keys) {
            const value = definition[key];
            const descriptor = this.createPropertyDescriptor(value);
            Object.defineProperty(this, key, descriptor);
        }
    }

    /**
     * 为单个属性值创建 PropertyDescriptor
     */
    private createPropertyDescriptor(value: any): PropertyDescriptor {
        // getter/setter 对象
        if (value && typeof value === 'object' && ('get' in value || 'set' in value)) {
            const descriptor: PropertyDescriptor = {
                configurable: true,
                enumerable: value.enumerable ?? true
            };
            if ('get' in value) {
                descriptor.get = value.get;
            }
            if ('set' in value) {
                descriptor.set = value.set;
            }
            return descriptor;
        }
        
        // 方法：bind 到宿主
        if (typeof value === 'function') {
            return {
                value: value.bind(this),
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

    /**
     * 装配旧版 Ability（AbilityBase 类）
     * 
     * @deprecated 迁移完成后移除
     */
    private setupLegacyAbility(AbilityClass: AbilityConstructor, disposers: (() => void)[]): void {
        const { ComposableRegistrar } = require('./ComposableRegistrar');
        const registrar = ComposableRegistrar.getInstance();
        
        const precompiled = registrar.get(AbilityClass);
        
        if (!precompiled) {
            this.logger.error(`Ability ${AbilityClass.name} is not precompilable`);
            return;
        }
        
        // 调用 createDescriptors(host)，执行 expose(host) 并获取所有属性描述符
        const descriptors = precompiled.createDescriptors(this);
        
        // 挂载能力属性
        descriptors.forEach((descriptor: PropertyDescriptor, key: string | symbol) => {
            Object.defineProperty(this, key, descriptor);
        });
        
        // 创建并存储销毁函数
        if (precompiled.createDisposer) {
            disposers.push(precompiled.createDisposer(this));
        }
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
     * 统一销毁
     * 
     * 执行顺序：
     * 1. 执行清理回调（onCleanup 注册的，按逆序）
     * 2. 自动 cancel 所有防抖函数
     * 3. 清空能力私有状态
     * 4. 执行旧版销毁函数（按逆序）
     */
    public dispose() {
        // 1. 执行清理回调（逆序）
        const cleanups = (this as any)[CLEANUPS_KEY] as (() => void)[];
        for (let i = cleanups.length - 1; i >= 0; i--) {
            try {
                cleanups[i]();
            } catch (e) {
                this.logger.error(`Cleanup error:`, e);
            }
        }
        cleanups.length = 0;

        // 2. 自动 cancel 所有防抖函数
        const states = (this as any)[ABILITY_STATES_KEY] as Map<string, any>;
        states.forEach((value) => {
            if (value && typeof value === 'object' && typeof value.cancel === 'function') {
                try {
                    value.cancel();
                } catch (e) {
                    this.logger.error(`Debounce cancel error:`, e);
                }
            }
        });

        // 3. 清空能力私有状态
        states.clear();

        // 4. 执行旧版销毁函数（逆序）
        const disposers = (this as any)[DISPOSERS_KEY] as (() => void)[];
        for (let i = disposers.length - 1; i >= 0; i--) {
            try {
                disposers[i]();
            } catch (e) {
                this.logger.error(`Dispose error:`, e);
            }
        }
        disposers.length = 0;
    }
}
