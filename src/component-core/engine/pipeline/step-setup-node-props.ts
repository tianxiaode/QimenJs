/**
 * step-setup-node-props.ts — 子节点内容属性描述符安装
 *
 * 编译时根据 nodeMetas 中每个命名子节点的 contentMode，
 * 在 ctor.prototype 上挂 getter/setter，使实例可直接 this.title = 'Hello'。
 *
 * 属于类装饰步骤：对 ctor 做一次性设置，仅首次编译时执行。
 */

import type { InitContext } from '../../types/init-context';
import { ChildNodePropsEngine } from '../ChildNodePropsEngine';

/** 管线步骤：安装子节点内容属性描述符到构造函数原型 */
export function setupNodeProps(ctx: InitContext): void {
    const { ctor, nodeMapMgr } = ctx;
    if (!nodeMapMgr) return;

    if (ctor._nodePropsSetup) return;
    ctor._nodePropsSetup = true;

    ChildNodePropsEngine.apply(ctor, nodeMapMgr.nodeMetas, nodeMapMgr.i18nNodes);
}
