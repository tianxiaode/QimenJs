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
import { ABILITY_STATES_KEY, CLEANUPS_KEY } from './forge';

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

    abilityState(key: string, creator?: () => any): any | undefined {
        const states = (this as any)[ABILITY_STATES_KEY] as Map<string, any>;
        if (!states.has(key) && creator) {
            states.set(key, creator());
        }
        return states.get(key);
    }

    setAbilityState(key: string, value: any): void {
        const states = (this as any)[ABILITY_STATES_KEY] as Map<string, any>;
        states.set(key, value);
    }

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
