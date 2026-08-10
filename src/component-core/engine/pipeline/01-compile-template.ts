import { NodeMapManager } from '@/component-core/engine/NodeMapManager';
import { InitContext } from '../../types';
import { CompileEngine } from '../CompileEngine';
import { object } from '@qimenjs/utils';
import { DecomposeEngine } from '../DecomposeEngine';

export function compileTemplate(ctx: InitContext): void {
    const instance = ctx.instance;
    const compileResult = CompileEngine.compile(instance.tpl);
    const decomposeOptions = DecomposeEngine.decomposeComponentOptions(instance.options);
    object.deepMerge(compileResult.metaDeclMap['root'].nodeOptions ?? {}, decomposeOptions.options);
    object.deepMerge(compileResult.attrDeclMap['root'] ?? {}, decomposeOptions.attrDecl);
    instance.nodeMapMgr = new NodeMapManager(compileResult.cache, compileResult.nodeMetas);
    instance.logger.debug(`[prepare:compile template]`, `[${instance.type}]:[${instance.id}]`);
}
