// src/composable/ComposableBase.ts

import { ILogger, Logger } from '@/logger';
import { debounce as debounceFn } from '@qimenjs/async';
import type { IComposableBase } from './types/composable';
import type {
    AbilityDefinition,
    ForgedConstructor,
    InferAbilities,
} from './types/ability';
import { createForgedClass } from './forge';

/**
 * Symbol 用于存储能力私有状态
 */
const ABILITY_STATES_KEY = Symbol('__abilityStates__');

/**
 * Symbol 用于存储清理回调
 */
const CLEANUPS_KEY = Symbol('__cleanups__');

// ============================================================
// ComposableBase - 核心基类
// ============================================================

/**
 * 可组合基类
 * 
 * 使用方式：
 * ```typescript
 * class MyManager extends ComposableBase.with([EventAbility, DomainAbility]) {
 *     domain = 'default';
 *     fetch() { this.emit('fetch'); }
 * }
 * ```
 * 
 * 运行时动态注入能力（如 JSON 定义场景）：
 * ```typescript
 * const host = new MyHost();
 * host.setupAbilityDefinition(someAbility);
 * ```
 */
export class ComposableBase implements IComposableBase {
    /**
     * 强类工厂方法 — 将能力合并到原型上，返回新的强类
     * 
     * @param abilities - 能力定义数组
     * @returns 合并后的强类构造函数
     * 
     * @example
     * ```typescript
     * // 直接 extends
     * class MyManager extends ComposableBase.with([EventAbility, DomainAbility]) {
     *     domain = 'default';
     *     fetch() { this.emit('fetch'); }
     * }
     * 
     * // 链式
     * class MyManager extends ComposableBase.with([EventAbility]).with([DomainAbility]) {
     *     ...
     * }
     * ```
     */
    static with<A extends readonly AbilityDefinition[]>(
        abilities: A
    ): ForgedConstructor<ComposableBase, A> {
        return createForgedClass(this, abilities) as any;
    }

    /**
     * 日志记录器实例
     */
    logger: ILogger;

    [key: string]: any;

    /**
     * 获取宿主对象自身
     */
    public get host(): this {
        return this;
    }

    /**
     * 构造函数
     */
    constructor() {
        this.logger = Logger.for(this.constructor.name);

        Object.defineProperty(this, ABILITY_STATES_KEY, {
            value: new Map<string, any>(),
            enumerable: false,
            configurable: true,
        });

        Object.defineProperty(this, CLEANUPS_KEY, {
            value: [] as (() => void)[],
            enumerable: false,
            configurable: true,
        });

        this.applyOverrides();
    }

    // ============================================
    // 能力私有状态管理
    // ============================================

    abilityState<T>(key: string, creator?: () => T): T | undefined {
        const states = (this as any)[ABILITY_STATES_KEY] as Map<string, any>;
        if (!states.has(key) && creator) {
            states.set(key, creator());
        }
        return states.get(key);
    }

    setAbilityState<T>(key: string, value: T): void {
        const states = (this as any)[ABILITY_STATES_KEY] as Map<string, any>;
        states.set(key, value);
    }

    // ============================================
    // 防抖管理
    // ============================================

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
    // 运行时能力注入
    // ============================================

    /**
     * 运行时注入能力定义
     *
     * 将能力的属性/方法通过 Object.defineProperty 复制到实例上。
     * 适用于 JSON 定义等运行时才知道能力的场景。
     *
     * @param definitions - 单个能力定义或能力定义数组
     */
    public setupAbilities(definitions: AbilityDefinition | readonly AbilityDefinition[]): void {
        const list = Array.isArray(definitions) ? definitions : [definitions];
        for (const definition of list) {
            const keys = [...Object.keys(definition), ...Object.getOwnPropertySymbols(definition)];
            for (const key of keys) {
                const value = definition[key];
                const descriptor = this.createPropertyDescriptor(value);
                Object.defineProperty(this, key, descriptor);
            }
        }
    }

    private createPropertyDescriptor(value: any): PropertyDescriptor {
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

        if (typeof value === 'function') {
            return {
                value: value.bind(this),
                writable: true,
                configurable: true,
                enumerable: true,
            };
        }

        return {
            value,
            writable: true,
            configurable: true,
            enumerable: true,
        };
    }

    protected applyOverrides() {
        this.logger.debug(`Applying overrides for ${this.constructor.name}`);
    }

    public dispose() {
        const cleanups = (this as any)[CLEANUPS_KEY] as (() => void)[];
        for (let i = cleanups.length - 1; i >= 0; i--) {
            try {
                cleanups[i]();
            } catch (e) {
                this.logger.error(`Cleanup error:`, e);
            }
        }
        cleanups.length = 0;

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

        states.clear();
    }
}

// ============================================================
// 导出类型
// ============================================================

export type { AbilityDefinition, ForgedConstructor, InferAbilities };
