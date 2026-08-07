/**
 * step-ensure-node-map.ts — 获取 NodeMapManager
 *
 * 管线第一步：从组件实例的 tpl getter 获取模板，调用 CompileEngine 编译并构建 NodeMapManager。
 * 无模板时 ctx.nodeMapMgr 保持 null，管线后续步骤据此跳过。
 */

import type { InitContext } from '../../types/init-context';
import { CompileEngine } from '../CompileEngine';

/** 管线步骤：从 tpl getter 获取模板，调用 CompileEngine 编译并构建 NodeMapManager */
export function ensureNodeMap(ctx: InitContext): void {
    const { instance } = ctx;
    const tpl = instance.tpl;

    if (!tpl) return;

    const mgr = CompileEngine.createNodeMapManagerByTpl(instance, tpl);

    ctx.ctor._compiled = true;
    ctx.nodeMapMgr = mgr;
    instance.nodeMapMgr = mgr;
    instance.el = mgr.buildDOM();
}
