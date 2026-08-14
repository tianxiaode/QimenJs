/**
 * OverlayEventBusAbility 浮层事件总线系统能力
 *
 * 将 OverlayEventBus 单例的方法暴露为组件实例方法，
 * 组件可直接通过 this.overlayEmit() / this.overlayOn() 调用。
 *
 * overlayEmit 只接收 EventContext，由发送方构建。
 * OverlayEventBus 内部从 ctx.source 提取 overlayKey，从 ctx.type 提取 action。
 */

import type { AbilityDefinition } from '@/composable';
import { OverlayEventBus } from '@/events';
import type { EventContext } from '@/context';

export const OverlayEventBusAbility = {
    overlayEmit(ctx: EventContext): void {
        OverlayEventBus.getInstance().overlayEmit(ctx);
    },

    overlayOn(overlayKey: string, action: string, handler: (data: any) => void): () => void {
        const off = OverlayEventBus.getInstance().overlayOn(overlayKey, action, handler);
        this.onCleanup(off);
        return off;
    },

    overlayOnce(overlayKey: string, action: string, handler: (data: any) => void): void {
        OverlayEventBus.getInstance().overlayOnce(overlayKey, action, handler);
    },
} satisfies AbilityDefinition;
