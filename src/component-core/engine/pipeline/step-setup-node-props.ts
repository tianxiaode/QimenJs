/**
 * step-setup-node-props.ts — 子节点内容属性描述符安装 + DOM 节点初始属性应用
 *
 * 1. 编译时根据 nodeMetas 中每个命名子节点的 contentMode，
 *    在 ctor.prototype 上挂 getter/setter，使实例可直接 this.title = 'Hello'。
 * 2. 运行时应用 DOM 节点的 htmlProps 和 attrs（编译引擎分类的初始属性）。
 *
 * 属于类装饰步骤：对 ctor 做一次性设置，仅首次编译时执行。
 * DOM 属性应用是实例级操作，每次实例化都执行。
 */

import type { InitContext } from '../../types/init-context';
import { ChildNodePropsEngine } from '../ChildNodePropsEngine';
import { DEFAULT_NODE_PROP_MAP } from '../../types/common-props';

/** 管线步骤：安装子节点内容属性描述符 + 应用 DOM 节点初始属性 */
export function setupNodeProps(ctx: InitContext): void {
    const { instance, ctor, nodeMapMgr } = ctx;
    if (!nodeMapMgr) return;

    if (!ctor._nodePropsSetup) {
        ctor._nodePropsSetup = true;
        ChildNodePropsEngine.apply(ctor, nodeMapMgr.nodeMetas, nodeMapMgr.i18nNodes);
    }

    applyNodeInitialProps(instance, nodeMapMgr.nodeMetas);
}

/**
 * 应用 DOM 节点的初始属性（htmlProps + attrs）
 *
 * 遍历 nodeMetas，对 tag 节点自动应用编译引擎分类的 htmlProps 和 attrs。
 * htmlProps 通过 _updateNode 应用（走 DEFAULT_NODE_PROP_MAP 映射），
 * attrs 通过 setAttribute 应用。
 */
function applyNodeInitialProps(instance: any, nodeMetas: Record<string, any>): void {
    for (const [name, meta] of Object.entries(nodeMetas)) {
        if (meta.componentClass) continue;

        if (meta.htmlProps) {
            instance._updateNode(name, meta.htmlProps);
        }

        if (meta.attrs) {
            const node = instance.nodeMap?.[name];
            const el = node?.el;
            if (el) {
                for (const [k, v] of Object.entries(meta.attrs)) {
                    if (v !== undefined && v !== null) {
                        el.setAttribute(k, String(v));
                    }
                }
            }
        }
    }
}
