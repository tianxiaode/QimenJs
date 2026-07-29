/**
 * step-instantiate-child-components.ts — INSTANTIATE 阶段：队列化子组件创建
 *
 * 从 nodeMetas 过滤出 componentClass 节点，
 * 通过 GlobalTaskQueue 逐个入队创建子组件实例。
 * 子组件通过 selfMount 步骤自行挂载到父占位符，骨架立即可见。
 *
 * bridgeKey / entityKey 向下传播规则：
 *   - 子组件声明了 key 且 fixed: true → 保留子组件的值
 *   - 子组件声明了 key 且非 fixed → 替换为父组件的 key
 *   - 子组件未声明 key → 不管
 */

import type { InitContext } from '../../types/init-context';
import { globalTaskQueue } from '@qimenjs/task';

type KeyDecl = string | { key: string; fixed?: boolean } | undefined;

function propagateKey(parentKey: KeyDecl, childDeclaredKey: KeyDecl): KeyDecl {
    if (childDeclaredKey == null) return undefined;

    if (typeof childDeclaredKey === 'object' && childDeclaredKey.fixed) {
        return childDeclaredKey;
    }

    return parentKey;
}

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
                    const ctor = componentClass as any;
                    const propagatedBridgeKey = propagateKey(instance.bridgeKey, ctor.bridgeKey);
                    const propagatedEntityKey = propagateKey(instance.entityKey, ctor.entityKey);

                    const extraProps: Record<string, any> = {};
                    if (propagatedBridgeKey !== undefined) {
                        extraProps.bridgeKey = propagatedBridgeKey;
                    }
                    if (propagatedEntityKey !== undefined) {
                        extraProps.entityKey = propagatedEntityKey;
                    }

                    new componentClass({
                        ...instance.props?.[name],
                        parent: instance,
                        slotName: name,
                        ...extraProps,
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
