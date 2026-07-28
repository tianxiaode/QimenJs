/**
 * step-bind-node-event-meta — 绑定节点事件元数据 + 组件边界标记
 *
 * 在组件初始化的 FINALIZE 阶段执行：
 * 1. 从 nodeMetas 中提取节点级 emits/action，编译为 DelegatedEventRule[]
 *    设置到 ctor._nodeEventRules，供 bindDelegatedEvents 使用
 * 2. 遍历 nodeMap 中所有节点，将 NodeMetadata.emits/action 绑定到对应 DOM 元素
 *    通过 NODE_EVENT_META 符号挂载事件元数据
 * 3. 在组件根元素上设置 COMPONENT_ROOT 边界标记
 *
 * 运行时事件委托流程：
 *   事件触发 → 从 event.target 向上遍历 parentElement
 *   → 查找 NODE_EVENT_META（匹配事件类型）
 *   → 碰到 COMPONENT_ROOT 停止（防止跨组件传播）
 *   → 找到匹配 → 合并事件数据 → 执行 emit
 */

import type { InitContext } from '../../types/init-context';
import { NODE_EVENT_META, COMPONENT_ROOT } from '../../constants/event-constants';
import { DelegatedEventEngine } from '../../engine/DelegatedEventEngine';

export function bindNodeEventMeta(ctx: InitContext): void {
    const { instance, nodeMapMgr, ctor } = ctx;
    if (!nodeMapMgr) return;

    const nodeMetas = nodeMapMgr.getAll();

    const nodeRules = DelegatedEventEngine.compileNodeEmits(nodeMetas);
    if (nodeRules.length > 0) {
        ctor._nodeEventRules = nodeRules;
    }

    for (const [nodeName, nodeMeta] of Object.entries(nodeMetas)) {
        const emits = nodeMeta.emits;
        const action = nodeMeta.action;
        const data = nodeMeta.data;

        if (!emits && !action && !data) continue;

        const el: HTMLElement | undefined = nodeMeta.el;
        if (!el) continue;

        if (!emits) {
            el[NODE_EVENT_META] = {
                nodeName,
                eventTypes: new Set<string>(),
                action,
                data,
            };
            continue;
        }

        const eventTypes = new Set<string>(Object.keys(emits));

        el[NODE_EVENT_META] = {
            nodeName,
            eventTypes,
            action,
            data,
        };
    }

    if (instance.el) {
        instance.el[COMPONENT_ROOT] = true;
    }
}