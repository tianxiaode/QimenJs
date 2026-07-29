/**
 * ChildEventsEngine — 子组件事件订阅引擎
 *
 * 事件体系 ②：nodeMap 子组件的 child.on() 订阅
 *
 * Pipeline FINALIZE 阶段在 bindListens 之后执行（bindChildEvents），
 * 因为需要子组件已实例化（INSTANTIATE 阶段完成）。
 *
 * 订阅来源：body.listens 中 childEvents 字段
 *   { childEvents: { toolbar: ['save', 'create'] } }
 *   → nodeMap.toolbar.on('save', this.onToolbarSave)
 *   → nodeMap.toolbar.on('create', this.onToolbarCreate)
 *
 * 方法名自动推导：on${PascalCase(nodeName)}${PascalCase(event)}
 *
 * 仅限直接子组件，跨层走桥接（ListensEngine）。
 */

import type { ChildEventsListen } from '../types/tpl-body';

export class ChildEventsEngine {
    /**
     * 为组件实例绑定 childEvents 声明的子组件事件订阅
     *
     * @param instance - 组件实例
     * @param childEvents - 子组件事件映射 { nodeName: eventName[] }
     */
    static bindChildEvents(instance: any, childEvents: Record<string, string[]>): void {
        if (!childEvents || !instance.nodeMap) return;

        const offFns: (() => void)[] = [];

        for (const [nodeName, eventNames] of Object.entries(childEvents)) {
            const child = instance.nodeMap[nodeName]?.component ?? instance.nodeMap[nodeName];
            if (!child || typeof child.on !== 'function') {
                console.warn(`ChildEventsEngine: nodeMap["${nodeName}"] not found or not a component`);
                continue;
            }

            for (const eventName of eventNames) {
                const methodName = ChildEventsEngine._deriveMethodName(nodeName, eventName);
                const method = instance[methodName];
                if (typeof method !== 'function') {
                    console.warn(`ChildEventsEngine: method "${methodName}" not found on component`);
                    continue;
                }

                const handler = method.bind(instance);
                child.on(eventName, handler);
                offFns.push(() => child.off(eventName, handler));
            }
        }

        instance._childEventsOffs = offFns;
    }

    /**
     * 解绑所有 childEvents 订阅（dispose 时调用）
     */
    static unbindChildEvents(instance: any): void {
        const offFns: (() => void)[] = instance._childEventsOffs;
        if (!offFns?.length) return;
        for (const off of offFns) off();
        instance._childEventsOffs = [];
    }

    /**
     * 从 listens 数组中提取 childEvents 配置
     */
    static extractChildEvents(listens: any[]): Record<string, string[]> | null {
        if (!listens?.length) return null;
        for (const item of listens) {
            if (item.childEvents) return item.childEvents;
        }
        return null;
    }

    /**
     * 推导方法名：on${PascalCase(nodeName)}${PascalCase(eventName)}
     *
     * toolbar + save → onToolbarSave
     * grid + rowClick → onGridRowClick
     */
    private static _deriveMethodName(nodeName: string, eventName: string): string {
        const pascalNode = nodeName.charAt(0).toUpperCase() + nodeName.slice(1);
        const pascalEvent = eventName.charAt(0).toUpperCase() + eventName.slice(1);
        return `on${pascalNode}${pascalEvent}`;
    }
}