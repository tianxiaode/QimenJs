/**
 * EntityEventBusAbility 实体事件总线系统能力
 *
 * 将 EntityEventBus 单例的方法暴露为组件实例方法，
 * 组件可直接通过 this.entityEmit() / this.entityOn() 调用，
 * 无需手动获取 EntityEventBus.getInstance()。
 *
 * 所有实体事件通过 EntityEventBus 单例的统一 eventScope 收发，
 * 发送和监听使用同一个 scopeId，事件路由可靠。
 */

import type { AbilityDefinition } from '@/composable';
import { EntityEventBus } from '@/events';

export const EntityEventBusAbility: AbilityDefinition = {
    entityEmit(entityKey: string, eventName: string, data?: any): void {
        EntityEventBus.getInstance().entityEmit(entityKey, eventName, data);
    },

    entityOn(entityKey: string, eventName: string, handler: (data: any) => void): () => void {
        const off = EntityEventBus.getInstance().entityOn(entityKey, eventName, handler);
        this.onCleanup(off);
        return off;
    },

    entityOnce(entityKey: string, eventName: string, handler: (data: any) => void): void {
        EntityEventBus.getInstance().entityOnce(entityKey, eventName, handler);
    },
};
