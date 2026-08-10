/**
 * ChildEventsEngine — 子组件事件订阅引擎（已委托给 ListensEngine）
 *
 * @deprecated 已迁移至 ListensEngine.bindNodeEvents()，保留仅为向后兼容。
 * 新代码请使用 listens: [{ node: 'toolbar', events: {...} }] 格式。
 */

import type { EventMapping, ListenItem } from '../types/tpl';
import { ListensEngine } from './ListensEngine';

/** 子组件事件订阅引擎（已委托给 ListensEngine） */
export class ChildEventsEngine {
    /**
     * @deprecated 使用 ListensEngine.bindNodeEvents() 代替
     */
    static bindChildEvents(
        instance: any,
        childEvents: Record<string, string[] | Record<string, any>>
    ): void {
        // 转换旧格式到新格式
        const items: ListenItem[] = [];
        for (const [nodeName, eventDecl] of Object.entries(childEvents)) {
            const events: Record<string, EventMapping> = {};
            if (Array.isArray(eventDecl)) {
                for (const evt of eventDecl) {
                    events[evt] = true; // 简写：方法名自动推导
                }
            } else {
                for (const [evt, config] of Object.entries(eventDecl)) {
                    if (config === true || config === undefined) {
                        events[evt] = true;
                    } else {
                        events[evt] = config as EventMapping;
                    }
                }
            }
            items.push({ node: nodeName, events });
        }
        ListensEngine.bindNodeEvents(instance, items);
    }

    /**
     * 从 listens 数组中提取 node 配置
     */
    static extractChildEvents(
        listens: ListenItem[]
    ): Record<string, string[] | Record<string, any>> | null {
        const nodes = ListensEngine.extractNodeEvents(listens);
        if (!nodes.length) return null;

        const result: Record<string, any> = {};
        for (const { node, events } of nodes) {
            const simplified: Record<string, any> = {};
            for (const [evt, mapping] of Object.entries(events)) {
                if (mapping === true) {
                    simplified[evt] = true;
                } else {
                    simplified[evt] = mapping;
                }
            }
            result[node] = simplified;
        }
        return result;
    }
}
