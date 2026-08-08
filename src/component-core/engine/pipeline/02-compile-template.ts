import { NodeMapManager } from '@/component-core/NodeMapManager';
import { InitContext } from '../../types';
import { CompileEngine } from '../CompileEngine';
import { object } from '@qimenjs/utils';

export function compileTemplate(ctx: InitContext): void {
    const instance = ctx.instance;
    const compileResult = CompileEngine.compile(instance.tpl);
    const rootMeta = compileResult.nodeMetas['root'];
    object.deepMerge(rootMeta.props ?? {}, instance.options.$props);
    Object.assign(rootMeta.attrs ?? {}, instance.options.$attrs);
    instance.nodeMapMgr = new NodeMapManager(compileResult.cache, compileResult.nodeMetas);
    instance.el = instance.nodeMapMgr.buildDOM();
    instance.logger.debug(`[prepare:compile template]`, `[${instance.type}]:[${instance.id}]`);
}
