/**
 * EventBridgeAbility 事件桥系统能力
 *
 * 将 EventBridge 单例的方法暴露为组件实例方法，
 * 组件可直接通过 this.bridgeEmit() / this.bridgeOn() 调用，
 * 无需手动获取 EventBridge.getInstance()。
 *
 * 所有桥接事件通过 EventBridge 单例的统一 eventScope 收发，
 * 发送和监听使用同一个 scopeId，事件路由可靠。
 *
 * this 指向宿主（ComposableBase）。
 */

import type { AbilityDefinition } from '@/composable';
import { EventBridge } from '@/events';

export const EventBridgeAbility: AbilityDefinition = {
    /**
     * 发送桥接事件
     *
     * 源组件调用此方法发送桥接事件，事件通过 EventBridge 单例的
     * 统一 eventScope 发布，确保所有通过 bridgeOn 注册的监听器都能收到。
     *
     * @param sourceId - 事件源标识（组件 id 或 eventKey）
     * @param eventName - 事件名称（如 selectionchange、click:save）
     * @param data - 事件数据
     */
    bridgeEmit(sourceId: string, eventName: string, data?: any): void {
        EventBridge.getInstance().bridgeEmit(sourceId, eventName, data);
    },

    /**
     * 注册桥接事件监听
     *
     * 监听方调用此方法注册对指定源组件事件的监听。
     * 所有监听注册在 EventBridge 的统一 eventScope 上，
     * 确保与 bridgeEmit 使用同一个 scopeId。
     *
     * @param sourceId - 事件源标识（组件 id 或 eventKey）
     * @param eventName - 事件名称
     * @param handler - 事件处理函数
     * @returns 返回取消监听的函数
     */
    bridgeOn(sourceId: string, eventName: string, handler: (data: any) => void): () => void {
        const off = EventBridge.getInstance().bridgeOn(sourceId, eventName, handler);
        this.onCleanup(off);
        return off;
    },

    /**
     * 注册一次性桥接事件监听
     *
     * @param sourceId - 事件源标识
     * @param eventName - 事件名称
     * @param handler - 事件处理函数
     */
    bridgeOnce(sourceId: string, eventName: string, handler: (data: any) => void): void {
        EventBridge.getInstance().bridgeOnce(sourceId, eventName, handler);
    },
};
