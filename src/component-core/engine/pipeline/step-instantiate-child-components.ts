/**
 * step-instantiate-child-components.ts — INSTANTIATE 阶段：子组件创建
 *
 * 从 nodeMetas 过滤出 componentClass 节点，直接创建子组件实例。
 * 子组件构造函数同步返回，init() 异步在后台执行（this._ready）。
 * 子组件通过 selfMount 步骤自行挂载到父占位符，骨架立即可见。
 *
 * eventKey / entityKey 向下传播规则：
 *   - 子组件声明了 key 且 fixed: true → 保留子组件的值
 *   - 子组件声明了 key 且非 fixed → 替换为父组件的 key
 *   - 子组件未声明 key → 不管
 */

import type { InitContext } from '../../types/init-context';

type KeyDecl = string | { key: string; fixed?: boolean } | undefined;

function propagateKey(parentKey: KeyDecl, childDeclaredKey: KeyDecl): KeyDecl {
    if (childDeclaredKey == null) return undefined;

    if (typeof childDeclaredKey === 'object' && childDeclaredKey.fixed) {
        return childDeclaredKey;
    }

    return parentKey;
}

export function instantiateChildComponents(ctx: InitContext) {
    const { instance, nodeMapMgr } = ctx;
    if (!nodeMapMgr) return;

    const nodeMetas = nodeMapMgr.nodeMetas;
    const componentSlots = Object.entries(nodeMetas)
        .filter(([, meta]) => meta.componentClass)
        .map(([name, meta]) => ({
            name,
            componentClass: meta.componentClass!,
            props: meta.props ?? meta.initConfig,
        }));

    if (componentSlots.length === 0) return;

    for (const { name, componentClass, props } of componentSlots) {
        console.log(
            `[instantiate] name=${name}, props keys=[${Object.keys(props || {}).join(',')}]`
        );
        const ctor = componentClass as any;
        const propagatedEventKey = propagateKey(instance.eventKey, ctor.eventKey);
        const propagatedEntityKey = propagateKey(instance.entityKey, ctor.entityKey);

        const extraProps: Record<string, any> = {};
        if (propagatedEventKey !== undefined) {
            extraProps.eventKey = propagatedEventKey;
        }
        if (propagatedEntityKey !== undefined) {
            extraProps.entityKey = propagatedEntityKey;
        }

        new componentClass({
            ...props,
            ...instance.props?.[name],
            parent: instance,
            slotName: name,
            ...extraProps,
        });
    }
}
