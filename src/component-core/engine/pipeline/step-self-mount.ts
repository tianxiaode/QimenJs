/**
 * step-self-mount.ts — MOUNT 阶段：子组件 self-mount 到父占位符
 *
 * 如果组件有 parent + slotName，在 buildDOM 后立即挂载到父的占位节点。
 * 骨架立即可见，子组件继续自己的 init pipeline 渐进渲染。
 */

import type { InitContext } from '../../types/init-context';

export function selfMount(ctx: InitContext): void {
    const { instance, nodeMapMgr } = ctx;
    if (!nodeMapMgr || !instance.parent) return;

    const slotName = instance.slotName;
    if (!slotName) return;

    const parentNodeMapMgr = instance.parent.nodeMapMgr;
    if (!parentNodeMapMgr) return;

    const node = parentNodeMapMgr.get(slotName);
    if (!node) return;

    parentNodeMapMgr.mountChildComponent(node, instance);
}
