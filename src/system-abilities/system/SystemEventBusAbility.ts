/**
 * SystemEventBusAbility — 系统事件总线能力
 *
 * 将 SystemEventBus 单例的方法暴露为组件实例方法，
 * 组件可直接通过 this.systemEmit() / this.systemOn() 调用。
 *
 * systemEmit 只接收 EventContext，由发送方构建。
 */

import type { AbilityDefinition } from '@/composable';
import { SystemEventBus } from '@/events';
import type { EventContext } from '@/context';

export const SystemEventBusAbility = {
    systemEmit(event: string, ctx: EventContext): void {
        SystemEventBus.getInstance().emit(event, ctx);
    },

    systemOn(event: string, handler: (data: any) => void): () => void {
        const off = SystemEventBus.getInstance().on(event, handler);
        this.onCleanup(off);
        return off;
    },

    systemOnce(event: string, handler: (data: any) => void): void {
        SystemEventBus.getInstance().once(event, handler);
    },
} satisfies AbilityDefinition;
