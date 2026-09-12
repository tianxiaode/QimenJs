/**
 * RAFAbility — 动画帧能力
 *
 * 为宿主提供 rAF 调度统一入口，自动维护 rAF id 列表，
 * dispose 时通过 onCleanup 统一 cancelAnimationFrame。
 *
 * @example
 * ```ts
 * this.nextFrame(() => this._updateLayout());
 * ```
 */

import type { AbilityDefinition } from '@/composable';

export const RAFAbility = {
    nextFrame(callback: FrameRequestCallback): void {
        const list = this.abilityState('__raf_ids', () => {
            const ids: number[] = [];
            this.onCleanup(() => {
                for (const id of ids) cancelAnimationFrame(id);
            });
            return ids;
        });
        const rafId = requestAnimationFrame(t => {
            const idx = list.indexOf(rafId);
            if (idx >= 0) list.splice(idx, 1);
            callback(t);
        });
        list.push(rafId);
    },
} satisfies AbilityDefinition;