/**
 * EventBridgeAbility 事件桥系统能力
 *
 * 将 EventBridge 单例的方法暴露为组件实例方法，
 * 组件可直接通过 this.bridgeEmit() / this.bridgeOn() 调用，
 * 无需手动获取 EventBridge.getInstance()。
 *
 * bridgeEmit 只接收 EventContext，由发送方构建。
 * EventBridge 内部从 ctx.source 提取 sourceId，从 ctx.type 提取 eventName。
 *
 * this 指向宿主（ComposableBase）。
 */

import type { AbilityDefinition } from '@/composable';
import { EventBridge } from '@/events';
import type { EventContext } from '@/context';

export const EventBridgeAbility= {
    bridgeEmit(ctx: EventContext): void {
        EventBridge.getInstance().bridgeEmit(ctx);
    },

    bridgeOn(sourceId: string, eventName: string, handler: (data: any) => void): () => void {
        const off = EventBridge.getInstance().bridgeOn(sourceId, eventName, handler);
        this.onCleanup(off);
        return off;
    },

    bridgeOnce(sourceId: string, eventName: string, handler: (data: any) => void): void {
        EventBridge.getInstance().bridgeOnce(sourceId, eventName, handler);
    },
} satisfies AbilityDefinition;
