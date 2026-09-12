/**
 * HoverAbility — hover 事件注册能力
 *
 * 按 el 维度管理 enter/leave 回调：同一 el 只绑定一次原生事件，
 * 多个回调追加到列表，事件触发时全部执行。
 *
 * @example
 * this.onEnter(this.el, () => tooltip.show());
 * this.onLeave(this.el, () => tooltip.hide());
 */

import type { AbilityDefinition } from '@/composable';

export const HoverAbility: AbilityDefinition = {
    onEnter(el: HTMLElement, callback: () => void): void {
        this._registerHover(el, 'enter', callback);
    },

    onLeave(el: HTMLElement, callback: () => void): void {
        this._registerHover(el, 'leave', callback);
    },

    _registerHover(el: HTMLElement, type: 'enter' | 'leave', callback: () => void): void {
        const stateKey = `hover-${type}`;
        let state = this.abilityState(stateKey) as Map<HTMLElement, Set<() => void>>;
        if (!state) {
            state = new Map();
            this.abilityState(stateKey, () => state);
        }

        let callbacks = state.get(el);
        if (!callbacks) {
            callbacks = new Set();
            state.set(el, callbacks);
        }

        if (callbacks.size === 0) {
            this.onCleanup(this.bind(el, type));
            this.onCleanup(
                this.on(`dom:${type}`, (ctx: any) => {
                    const event = ctx?.data?.originalEvent as MouseEvent;
                    if (event && el.contains(event.target as Node)) {
                        const cbs = (this.abilityState(stateKey) as Map<HTMLElement, Set<() => void>>)?.get(el);
                        if (cbs) for (const cb of cbs) cb();
                    }
                })
            );
        }

        callbacks.add(callback);
    },
} satisfies AbilityDefinition;
