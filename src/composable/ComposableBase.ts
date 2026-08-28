/**
 * ComposableBase — 可组合能力基类
 *
 * 正常类定义，构造器自动初始化 logger / abilityStates / cleanups。
 * 子类 extends 后 super() 即可，不需要 initForgedState。
 * 通过静态方法 use() 注入能力、define() 注入定义，均原地修改 this 原型，
 * 保留完整原型链和 instanceof。
 *
 * @example
 * ```ts
 * class MyManager extends ComposableBase {
 *     domain = 'default';
 *     fetch() { this.emit('fetch'); }
 * }
 * MyManager.use([EventAbility, DomainAbility]);
 * ```
 */

import { ILogger, Logger } from '@/logger';
import { withAbilities, withDefinitions } from './forge';
import type { AbilityDefinition, Definitions, IComposableBase, IOptionHandler } from './types';
import { OptionHandlerRegistrar } from './OptionHandlerRegistrar';

export class ComposableBase implements IComposableBase {
    logger: ILogger;
    private abilityStatesMap: Map<string, any> = new Map();
    private cleanups: (() => void)[] = [];

    constructor() {
        this.logger = Logger.for(this.constructor.name);
    }

    /**
     * 向自身注入能力（原地修改 this 原型，保留 instanceof）
     *
     * 定义类之后，为类自身添加能力，不创建派生类，不引入中间层。
     * 支持单个能力或数组，返回 this 支持链式调用。
     *
     * @param abilities - 单个能力定义或能力定义数组
     * @returns this（支持链式调用）
     *
     * @example
     * ```ts
     * class MyManager extends ComposableBase {}
     * MyManager.use([EventAbility, DomainAbility]);
     * MyManager.use(EventAbility);            // 单个能力
     * MyManager.use([EventAbility]).use([DomainAbility]); // 链式
     *
     * new MyManager() instanceof ComposableBase // true
     * ```
     */
    static use(...abilities: AbilityDefinition[]): typeof ComposableBase {
        const arr = abilities.flat();
        withAbilities(this, arr);
        return this;
    }

    /**
     * 向自身注入非能力定义（原地修改 this 原型）
     *
     * 用于注入定义（方法、getter/setter、普通值属性），
     * 与 use 的区别：
     *   - 不跳过 __ 前缀 key
     *   - 不过滤非函数/非 accessor 值（普通值也复制到原型）
     *   - 不维护 abilities 数组
     *
     * @param definitions - 定义对象，属性将复制到 this.prototype
     * @returns this（支持链式调用）
     *
     * @example
     * ```ts
     * class MyComponent extends ComposableBase {}
     * MyComponent.use([EventAbility]);
     * MyComponent.define({
     *     type: 'MyComponent',
     *     onAfterInit(props) { / * ... * / },
     * });
     * ```
     */
    static define(definitions: Definitions) {
        withDefinitions(this, definitions);
        return this;
    }

    getPropertyMap(): Map<string, any> {
        return (this.constructor as any)._propertyMap || new Map();
    }

    getOptionsMap(): Map<string, any> {
        return (this.constructor as any)._optionMap || new Map();
    }

    /**
     * 选项变化处理 — 子类覆盖 _resolveOptionHandler 对接具体注册表
     */
    _onOptionChange(key: string, value: any, old: any, definition: any): void {
        if (old === value) return;
        if (
            (this as any)._beforeOptionChange &&
            (this as any)._beforeOptionChange(key, value, old, definition) === false
        ) {
            return;
        }

        const name = definition ? 'target-to' : key;
        const registry = OptionHandlerRegistrar.getInstance();
        const handler: IOptionHandler | undefined =
            name === 'target-to' ? registry.getTargetHandler(definition.to) : registry.get(key);
        if (!handler) {
            this.logger.warn('handler not found:', name, key, value, old, definition);
            return;
        }
        const result = handler.handler(value, this as any, definition);
        if ((this as any)._afterOptionChange) {
            (this as any)._afterOptionChange(name, result, key, value, old, definition);
        }
    }

    /**
     * 获取能力状态，不存在时可用 creator 惰性创建
     *
     * @param key - 状态键，建议使用 `AbilityName:stateName` 格式避免冲突
     * @param creator - 惰性创建函数，仅在状态不存在时调用
     * @returns 状态值，或 undefined（未创建时）
     */
    abilityState(key: string, creator?: () => any): any | undefined {
        const states = this.abilityStatesMap;
        if (!states.has(key) && creator) {
            states.set(key, creator());
        }
        return states.get(key);
    }

    /**
     * 设置能力状态
     *
     * @param key - 状态键
     * @param value - 状态值
     */
    setAbilityState(key: string, value: any): void {
        const states = this.abilityStatesMap;
        states.set(key, value);
    }

    /**
     * 注册清理回调，dispose 时逆序执行
     *
     * @param callback - 清理回调函数
     */
    onCleanup(callback: () => void): void {
        const cleanups = this.cleanups;
        cleanups.push(callback);
    }

    /** 释放前置钩子（可覆写，dispose 最先调用） */
    onBeforeDispose(): void {}

    /** 释放后置钩子（可覆写，dispose 最后调用） */
    onDisposed(): void {}

    /**
     * 释放资源
     *
     * 执行顺序：onBeforeDispose → onCleanup(LIFO) → 清理 abilityState → onDisposed
     */
    dispose(): void {
        this.onBeforeDispose();

        const cleanups = this.cleanups;
        for (let i = cleanups.length - 1; i >= 0; i--) {
            try {
                cleanups[i]();
            } catch (e) {
                this.logger?.error?.(`Cleanup error:`, e);
            }
        }
        cleanups.length = 0;

        this.ClearProperties();
        this.clearStates();
        this.onDisposed();
    }

    private ClearProperties(): void {
        const self = this as any;
        const ctor = self.constructor as any;
        const set = ctor._clearPropertyKeys;
        for (const key of set.values()) {
            if (key in self) {
                delete self[key];
            }
        }
    }

    private clearStates(): void {
        const states = this.abilityStatesMap;
        states.forEach(value => {
            if (typeof value === 'object' && typeof value.cancel === 'function') {
                try {
                    value.cancel();
                } catch (e) {
                    this.logger?.error?.(`Debounce cancel error:`, e);
                }
            }
        });
        states.clear();
    }
}
