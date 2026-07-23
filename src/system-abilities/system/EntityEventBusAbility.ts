/**
 * EntityEventBusAbility 实体事件总线系统能力
 *
 * 将 EntityEventBus 单例的方法暴露为组件实例方法，
 * 组件可直接通过 this.entityEmit() / this.entityOn() 调用，
 * 无需手动获取 EntityEventBus.getInstance()。
 *
 * entityEmit 只接收 EventContext，由发送方构建。
 * EntityEventBus 内部从 ctx.source 提取 entityKey，从 ctx.type 提取 eventName。
 */

import type { AbilityDefinition } from '@/composable';
import { EntityEventBus } from '@/events';
import type { EventContext } from '@/context';

export const EntityEventBusAbility= {
    entityEmit(ctx: EventContext): void {
        EntityEventBus.getInstance().entityEmit(ctx);
    },

    entityOn(entityKey: string, eventName: string, handler: (data: any) => void): () => void {
        const off = EntityEventBus.getInstance().entityOn(entityKey, eventName, handler);
        this.onCleanup(off);
        return off;
    },

    entityOnce(entityKey: string, eventName: string, handler: (data: any) => void): void {
        EntityEventBus.getInstance().entityOnce(entityKey, eventName, handler);
    },
} satisfies AbilityDefinition;
