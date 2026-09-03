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
import { DATA_MAP_SYMBOL, DATA_SYMBOL, withAbilities, withDefinitions } from './forge';
import type {
    AbilityDefinition,
    DataMap,
    Definitions,
    IComposableBase,
    TargetToOptionDefinition,
} from './types';
import { string } from '@/utils';

export class ComposableBase implements IComposableBase {
    logger: ILogger;
    private [DATA_SYMBOL]: Record<string, any> = {
        __abilityStatesMap: new Map(), // 初始化能力状态集合
    };
    private cleanups: (() => void)[] = [];

    constructor() {
        this.logger = Logger.for(this.constructor.name);
    }

    getData(key: string): any {
        const data = this._getData();

        return key in data ? data[key] : undefined;
    }

    setData(key: string, value: any): void {
        const self = this as any;
        const data = this._getData();
        const old = this.getData(key);
        if (old === value) return;
        //如果value以@开头，表示i18n，value为i18n的key，否则value为i18n的value,@@为转义字符，不作为i18n的key
        data[key] = value;
        const changeKey = `_on${string.capitalize(key)}OptionChange`;
        if (typeof self[changeKey] === 'function') {
            self[changeKey](value, old);
        }

        self._onOptionChange(key, value, old);
    }

    getTargetToDef(key: string): TargetToOptionDefinition | undefined {
        return this.targetToMap.get(key);
    }

    get targetToMap(): Map<string, TargetToOptionDefinition> {
        return this.getDataMap().targetToMap;
    }

    get i18nOptions(): string[] {
        return [...this.getDataMap().i18nOptions];
    }

    get optionsKeys(): Set<string> {
        return this.getDataMap().optionsKeys;
    }

    get propertyKeys(): Set<string> {
        return this.getDataMap().propertyKeys;
    }

    private getDataMap(): DataMap {
        return (this.constructor as any)[DATA_MAP_SYMBOL];
    }

    private _getData(): Record<string, any> {
        if (!this[DATA_SYMBOL]) {
            this[DATA_SYMBOL] = {
                __abilityStatesMap: new Map(),
            };
        }
        return this[DATA_SYMBOL];
    }

    private get abilityStatesMap(): Map<string, any> {
        return this._getData().__abilityStatesMap;
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

    /**
     * 派生类可覆写（prototype getter，类似 tpl）：为 option 提供默认值覆盖。
     *
     * getter 定义在原型链上，实例化即可读取（不依赖字段初始化顺序），
     * 在 applyOptionDefaults 应用默认值时合并。
     *
     * @example
     * ```ts
     * class DangerButton extends ButtonComponent {
     *     get defaultOptions() {
     *         return { buttonType: 'danger' };
     *     }
     * }
     * ```
     */
    get defaultOptions(): Record<string, any> | undefined {
        return undefined;
    }

    _onOptionChange(
        _key: string,
        _value: any,
        _old: any,
        _definition: TargetToOptionDefinition | undefined
    ): void {}

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
        const self = this as any;
        self.onBeforeDispose();

        const cleanups = this.cleanups;
        for (let i = cleanups.length - 1; i >= 0; i--) {
            try {
                cleanups[i]();
            } catch (e) {
                self.logger?.error?.(`Cleanup error:`, e);
            }
        }
        cleanups.length = 0;

        this.ClearProperties();
        this.clearData();
        this.onDisposed();
    }

    private applyOptionDefaults(): void {
        const overrides = this.defaultOptions;
        for (const [key, value] of Object.entries(this.getDataMap().defaultValues)) {
            this.setData(key, overrides && key in overrides ? overrides[key] : value);
        }
    }

    private ClearProperties(): void {
        const self = this as any;
        const keys = self.getDataMap().propertyClearKeys;
        for (const key of keys) {
            delete self[key];
        }
    }

    private clearData() {
        const self = this as any;
        const data = this._getData();
        for (const key of Object.keys(data)) {
            delete data[key];
        }
        delete self[DATA_SYMBOL];
    }
}
