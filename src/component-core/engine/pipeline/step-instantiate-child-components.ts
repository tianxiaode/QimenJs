/**
 * step-instantiate-child-components.ts — INSTANTIATE 阶段：队列化子组件创建
 *
 * 从 nodeMetas 过滤出 componentClass 节点，
 * 通过 GlobalTaskQueue 逐个入队创建子组件实例。
 * 子组件通过 selfMount 步骤自行挂载到父占位符，骨架立即可见。
 */

import type { InitContext } from '../../types/init-context';
import { globalTaskQueue } from '@qimenjs/task';

export async function instantiateChildComponents(ctx: InitContext): Promise<void> {
    const { instance, nodeMapMgr } = ctx;
    if (!nodeMapMgr) return;

    const nodeMetas = nodeMapMgr.nodeMetas;
    const componentSlots = Object.entries(nodeMetas)
        .filter(([, meta]) => meta.componentClass)
        .map(([name, meta]) => ({ name, componentClass: meta.componentClass! }));

    if (componentSlots.length === 0) return;

    const tasks: Promise<void>[] = [];

    for (const { name, componentClass } of componentSlots) {
        const taskPromise = new Promise<void>((resolve, reject) => {
            globalTaskQueue.addTask(async () => {
                try {
                    new componentClass({
                        ...instance.props?.[name],
                        parent: instance,
                        slotName: name,
                    });
                    resolve();
                } catch (err) {
                    reject(err);
                }
            }, 'NORMAL');
        });
        tasks.push(taskPromise);
    }

    await Promise.all(tasks);
}
