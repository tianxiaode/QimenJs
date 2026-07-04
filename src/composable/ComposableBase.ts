import { ILogger, Logger } from '@/logger';
import { debounce as debounceFn } from '@orbit-js/async';
import type { IComposableBase } from './types/composable';

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
 * Ability 是普通对象，属性/方法直接复制到宿主。
 * - 方法：普通函数，复制后 this 指向宿主
 * - getter/setter：{ get() {...}, set(v) {...} } 对象
 * - 普通值：直接复制
 */
export type AbilityDefinition = Record<string | symbol, any>;

/**
 * 可组合基类，提供了能力注入和管理的基础功能
 * 
 * 子类通过静态属性 `abilities` 声明所需能力，
 * ComposableBase 在实例化时自动从原型链收集能力并注入。
 * 
 * 核心机制：
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
    static readonly abilities: readonly AbilityDefinition[] = [];
    
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
        
        // 2. 初始化能力私有状态
        Object.defineProperty(this, ABILITY_STATES_KEY, {
            value: new Map<string, any>(),
            enumerable: false,
            configurable: true
        });
        
        // 3. 初始化清理回调数组
        Object.defineProperty(this, CLEANUPS_KEY, {
            value: [] as (() => void)[],
            enumerable: false,
            configurable: true
        });
        
        // 4. 设置能力
        this.setupAbilities();
        
        // 5. 应用重写
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
     */
    onCleanup(callback: () => void): void {
        const cleanups = (this as any)[CLEANUPS_KEY] as (() => void)[];
        cleanups.push(callback);
    }

    // ============================================
    // 类级缓存
    // ============================================

    public getStatic<T>(key: string | symbol): T | undefined {
        const ctor = this.constructor as any;
        return ctor._static_storage_?.get(key);
    }

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
     */
    protected collectAbilities(): AbilityDefinition[] {
        const CACHE_KEY = '__collected_abilities__';
        
        let cached = this.getStatic<AbilityDefinition[]>(CACHE_KEY);
        if (cached) {
            return cached;
        }
        
        const allAbilities: AbilityDefinition[] = [];
        let current = this.constructor as any;
        
        while (current && current !== ComposableBase) {
            const desc = Object.getOwnPropertyDescriptor(current, 'abilities');
            if (desc && Array.isArray(desc.value)) {
                allAbilities.unshift(...desc.value);
            }
            current = Object.getPrototypeOf(current);
        }
        
        const unique = [...new Set(allAbilities)];
        this.setStatic(CACHE_KEY, unique);
        
        return unique;
    }

    /**
     * 自动装配方法：收集能力并注入
     * 
     * 遍历所有 AbilityDefinition，将属性/方法直接复制到宿主。
     */
    protected setupAbilities() {
        const abilities = this.collectAbilities();

        abilities.forEach(ability => {
            this.setupAbilityDefinition(ability);
        });
        
        this.logger.debug(
            `Abilities setup for ${this.constructor.name}`,
            { abilities: abilities.length }
        );
    }

    /**
     * 装配 Ability 定义
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
     * 应用重写功能，允许派生类自定义一些功能
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
    }
}
