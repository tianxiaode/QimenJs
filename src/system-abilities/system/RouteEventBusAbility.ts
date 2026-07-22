/**
 * RouteEventBusAbility 路由事件总线系统能力
 *
 * 将 RouteEventBus 单例的方法暴露为组件实例方法，
 * 组件可直接通过 this.routeEmit() / this.routeOn() 调用，
 * 无需手动获取 RouteEventBus.getInstance()。
 *
 * routeEmit 只接收 EventContext，由发送方构建。
 * RouteEventBus 内部从 ctx.source 提取 routeKey，从 ctx.type 提取 eventName。
 */

import type { AbilityDefinition } from '@/composable';
import { RouteEventBus } from '@/events';
import type { EventContext } from '@/context';

export const RouteEventBusAbility: AbilityDefinition = {
    routeEmit(ctx: EventContext): void {
        RouteEventBus.getInstance().routeEmit(ctx);
    },

    routeOn(routeKey: string, eventName: string, handler: (data: any) => void): () => void {
        const off = RouteEventBus.getInstance().routeOn(routeKey, eventName, handler);
        this.onCleanup(off);
        return off;
    },

    routeOnce(routeKey: string, eventName: string, handler: (data: any) => void): void {
        RouteEventBus.getInstance().routeOnce(routeKey, eventName, handler);
    },
};
