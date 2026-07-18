/**
 * OverlayEventBusAbility 浮层事件总线系统能力
 *
 * 将 OverlayEventBus 单例的方法暴露为组件实例方法，
 * 组件可直接通过 this.overlayEmit() / this.overlayOn() 调用。
 *
 * 事件数据自动携带组件实例和锚定元素，确保浮层能锚定到正确的组件。
 */

import type { AbilityDefinition } from '@/composable';
import { OverlayEventBus } from '@/events';

export const OverlayEventBusAbility: AbilityDefinition = {
    overlayEmit(overlayKey: string, action: string, data?: any): void {
        OverlayEventBus.getInstance().overlayEmit(overlayKey, action, {
            ...data,
            component: this,
            anchor: data?.anchor ?? this.el,
        });
    },

    overlayOn(overlayKey: string, action: string, handler: (data: any) => void): () => void {
        const off = OverlayEventBus.getInstance().overlayOn(overlayKey, action, handler);
        this.onCleanup(off);
        return off;
    },

    overlayOnce(overlayKey: string, action: string, handler: (data: any) => void): void {
        OverlayEventBus.getInstance().overlayOnce(overlayKey, action, handler);
    },
};
