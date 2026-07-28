/**
 * step-ensure-node-map.ts — 获取 NodeMapManager
 *
 * 管线第一步：从 TemplateRegistrar 获取编译产物，构建 NodeMapManager。
 * 无模板名或未注册时 ctx.nodeMapMgr 保持 null，管线后续步骤据此跳过。
 */

import type { InitContext } from '../../types/init-context';
import { TemplateRegistrar } from '../ComponentRegistrar';

export function ensureNodeMap(ctx: InitContext): void {
    const ctor = ctx.ctor;
    const templateName = ctor.type;
    if (!templateName) return;

    const mgr = TemplateRegistrar.getInstance().createNodeMapManager(templateName, ctx.instance);
    if (!mgr) return;

    ctor._compiled = true;

    const { instance } = ctx;
    ctx.nodeMapMgr = mgr;
    instance.nodeMapMgr = mgr;
    instance.el = mgr.buildDOM();
}
