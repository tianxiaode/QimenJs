/**
 * ComposableBase — 可组合能力基类
 *
 * 正常类定义，构造器自动初始化 logger / abilityStates / cleanups。
 * 子类 extends 后 super() 即可，不需要 initForgedState。
 * 通过 withAbilities 注入能力，保留完整原型链和 instanceof。
 *
 * @example
 * ```ts
 * class MyManager extends ComposableBase {
 *     domain = 'default';
 *     fetch() { this.emit('fetch'); }
 * }
 * withAbilities(MyManager, [EventAbility, DomainAbility]);
 * ```
 */

import { Logger } from '@/logger';
import { ABILITY_STATES_KEY, CLEANUPS_KEY, withAbilities } from './forge';
import type { AbilityDefinition } from './types/ability';

export class ComposableBase {
    logger: any;

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
    }

    /**
     * 创建组合了指定能力的派生类
     *
     * 等价于先定义子类再调用 withAbilities，但更简洁：
     * ```ts
     * const Derived = ComposableBase.with([AbilityA, AbilityB]);
     * // 等价于：
     * // class Derived extends ComposableBase {}
     * // withAbilities(Derived, [AbilityA, AbilityB]);
     * ```
     */
    static with(abilities: readonly AbilityDefinition[]): typeof ComposableBase {
        const Base = this;
        class Derived extends Base {}
        withAbilities(Derived, abilities);
        return Derived as typeof ComposableBase;
    }

    /** 获取能力状态，不存在时可用 creator 惰性创建 */
    abilityState(key: string, creator?: () => any): any | undefined {
        const states = (this as any)[ABILITY_STATES_KEY] as Map<string, any>;
        if (!states.has(key) && creator) {
            states.set(key, creator());
        }
        return states.get(key);
    }

    /** 设置能力状态 */
    setAbilityState(key: string, value: any): void {
        const states = (this as any)[ABILITY_STATES_KEY] as Map<string, any>;
        states.set(key, value);
    }

    /** 注册清理回调，dispose 时逆序执行 */
    onCleanup(callback: () => void): void {
        const cleanups = (this as any)[CLEANUPS_KEY] as (() => void)[];
        cleanups.push(callback);
    }

    onBeforeDispose(): void {}

    onDisposed(): void {}

    dispose(): void {
        this.onBeforeDispose();

        const cleanups = (this as any)[CLEANUPS_KEY] as (() => void)[];
        for (let i = cleanups.length - 1; i >= 0; i--) {
            try {
                cleanups[i]();
            } catch (e) {
                this.logger?.error?.(`Cleanup error:`, e);
            }
        }
        cleanups.length = 0;

        const states = (this as any)[ABILITY_STATES_KEY] as Map<string, any>;
        states.forEach(value => {
            if (value && typeof value === 'object' && typeof value.cancel === 'function') {
                try {
                    value.cancel();
                } catch (e) {
                    this.logger?.error?.(`Debounce cancel error:`, e);
                }
            }
        });
        states.clear();

        this.onDisposed();
    }
}
