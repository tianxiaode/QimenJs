/**
 * ComponentEventBusAbility 组件事件总线系统能力
 *
 * 将 ComponentEventBus 单例的方法暴露为组件实例方法，
 * 组件可直接通过 this.componentEmit() / this.componentOn() 调用，
 * 无需手动获取 ComponentEventBus.getInstance()。
 *
 * componentEmit 只接收 EventContext，由发送方构建。
 * ComponentEventBus 内部从 ctx.source 提取 sourceId（即 eventKey），
 * 从 ctx.type 提取 eventName。
 *
 * this 指向宿主（ComposableBase）。
 */

import type { AbilityDefinition } from '@/composable';
import { ComponentEventBus } from '@/events';
import type { EventContext } from '@/context';

export const ComponentEventBusAbility = {
    componentEmit(ctx: EventContext): void {
        ComponentEventBus.getInstance().componentEmit(ctx);
    },

    componentOn(sourceId: string, eventName: string, handler: (data: any) => void): () => void {
        const off = ComponentEventBus.getInstance().componentOn(sourceId, eventName, handler);
        this.onCleanup(off);
        return off;
    },

    componentOnce(sourceId: string, eventName: string, handler: (data: any) => void): void {
        ComponentEventBus.getInstance().componentOnce(sourceId, eventName, handler);
    },
} satisfies AbilityDefinition;
