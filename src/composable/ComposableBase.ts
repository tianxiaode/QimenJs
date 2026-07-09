import { ILogger, Logger } from '@/logger';
import { debounce as debounceFn } from '@qimenjs/async';
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
 * Symbol 用于标记是否跳过 setupAbilities
 * forge 生成的强类在原型上已有能力，无需在构造时动态注入
 * @internal
 */
export const SKIP_SETUP_ABILITIES = Symbol('__skipSetupAbilities__');

/**
 * 强类构造函数类型
 * 包含 abilities 静态属性和 forge 静态方法
 */
export interface ForgedConstructor<T> {
    new (...args: any[]): T;
    readonly abilities: readonly AbilityDefinition[];
    readonly [SKIP_SETUP_ABILITIES]: boolean;
    /**
     * 继续合并能力，返回新的强类
     * 可链式调用：BaseClass.forge(abilities).forge(moreAbilities)
     */
    forge(additionalAbilities: readonly AbilityDefinition[], options?: ForgeOptions): ForgedConstructor<T>;
}

/**
 * forge 配置选项
 */
export interface ForgeOptions {
    /** 类名，用于调试和日志 */
    name?: string;
}

/**
 * 将能力定义合并到类的原型上
 *
 * - getter/setter → 原型访问器（所有实例共享，this 指向调用实例）
 * - 方法 → 原型方法（不 bind，调用时 this 自然指向实例）
 * - 普通值 → 跳过（由子类定义或构造函数初始化）
 * - 以 __ 开头的协议属性 → 跳过
 */
function applyAbilitiesToPrototype(
    proto: any,
    abilities: readonly AbilityDefinition[]
): void {
    for (const ability of abilities) {
        const keys = Object.keys(ability);

        for (const key of keys) {
            if (key.startsWith('__')) continue;
            if (key in proto) continue;

            const value = ability[key];

            if (value && typeof value === 'object' && ('get' in value || 'set' in value)) {
                const descriptor: PropertyDescriptor = {
                    configurable: true,
                    enumerable: value.enumerable ?? true,
                };
                if ('get' in value) descriptor.get = value.get;
                if ('set' in value) descriptor.set = value.set;
                Object.defineProperty(proto, key, descriptor);
                continue;
            }

            if (typeof value === 'function') {
                proto[key] = value;
                continue;
            }
            // 普通值跳过
        }

        // 处理 Symbol 键
        for (const key of Object.getOwnPropertySymbols(ability)) {
            if ((key as symbol) in proto) continue;
            const value = ability[key as any];
            if (typeof value === 'function') {
                proto[key as any] = value;
            }
        }
    }
}

/**
 * 创建强类的内部实现
 */
function createForgedClass<T>(
    BaseClass: new (...args: any[]) => T,
    abilities: readonly AbilityDefinition[],
    options?: ForgeOptions,
): ForgedConstructor<T> {

    const className = options?.name ?? BaseClass.name;

    const ForgedClass = {
        [className]: class extends (BaseClass as new (...args: any[]) => any) {
            static readonly abilities: readonly AbilityDefinition[] = abilities;
            static readonly [SKIP_SETUP_ABILITIES] = true;

            constructor(...args: any[]) {
                super(...args);
            }
        },
    }[className];

    // 将能力合并到新类的原型上
    applyAbilitiesToPrototype(ForgedClass.prototype, abilities);

    // 添加 forge 静态方法，支持链式调用
    (ForgedClass as any).forge = function(
        additionalAbilities: readonly AbilityDefinition[],
        forgeOptions?: ForgeOptions,
    ): ForgedConstructor<T> {
        const merged = [...abilities, ...additionalAbilities];
        return createForgedClass(ForgedClass, merged, forgeOptions) as any;
    };

    return ForgedClass as ForgedConstructor<T>;
}

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
export class ComposableBase implements IComposableBase {
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
     * 强类工厂方法 — 将能力合并到原型上，返回新的强类
     *
     * 生成的强类：
     * - 继承 ComposableBase 的所有功能
     * - 原型上包含所有 abilities 的方法/getter/setter
     * - 构造函数中不再调用 setupAbilities()（能力已在原型上）
     * - 仍保留 setupAbilityDefinition() 供运行时动态注入能力
     * - 返回的强类自身也有 forge 方法，可继续链式合并能力
     *
     * @param abilities - 能力定义数组
     * @param options - 配置选项（类名等）
     * @returns 合并后的强类构造函数
     *
     * @example
     * ```typescript
     * // 一步合并
     * const CoreEntityManager = ComposableBase.forge([EventAbility, DomainAbility]);
     *
     * // 链式合并
     * const WithSchema = CoreEntityManager.forge([SchemaAbility]);
     *
     * // 再从强类 extends 出子类
     * class BaseEntityManager extends WithSchema {
     *     loading = false;
     *     fetch() { ... }
     * }
     * ```
     */
    static forge(abilities: readonly AbilityDefinition[], options?: ForgeOptions): ForgedConstructor<ComposableBase> {
        return createForgedClass(this, abilities, options);
    }

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
            configurable: true,
        });

        // 3. 初始化清理回调数组
        Object.defineProperty(this, CLEANUPS_KEY, {
            value: [] as (() => void)[],
            enumerable: false,
            configurable: true,
        });

        // 4. 设置能力（强类跳过，能力已在原型上）
        if (!(this.constructor as any)[SKIP_SETUP_ABILITIES]) {
            this.setupAbilities();
        }

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
        return this.abilityState(`__debounce_${key}`, () =>
            debounceFn(fn, wait, immediate)
        ) as A & { cancel(): void };
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

        const cached = this.getStatic<AbilityDefinition[]>(CACHE_KEY);
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

        this.logger.debug(`Abilities setup for ${this.constructor.name}`, {
            abilities: abilities.length,
        });
    }

    /**
     * 装配 Ability 定义
     *
     * 遍历对象的所有属性，用 Object.defineProperty 复制到宿主。
     * - getter/setter 对象 → 直接作为 descriptor 的 get/set
     * - 函数 → bind 到宿主
     * - 普通值 → 直接作为 value
     *
     * public 以便渲染器注入 LayoutNode.abilities，与注入 meta/extraFns 同级操作。
     */
    public setupAbilityDefinition(definition: AbilityDefinition): void {
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
                enumerable: value.enumerable ?? true,
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
                enumerable: true,
            };
        }

        // 普通值
        return {
            value,
            writable: true,
            configurable: true,
            enumerable: true,
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
        states.forEach(value => {
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
