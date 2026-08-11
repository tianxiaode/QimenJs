import { NodeMapManager } from '@/component-core/engine/NodeMapManager';
import { InitContext } from '../../types';
import { CompileEngine } from '../CompileEngine';
import { object } from '@qimenjs/utils';
import { DecomposeEngine } from '../DecomposeEngine';

export function compileTemplate(ctx: InitContext): void {
    const instance = ctx.instance;
    const compileResult = CompileEngine.compile(instance.tpl);
    //拆解父组件传递过来的配置
    const decomposeOptions = DecomposeEngine.decomposeComponentOptions(
        instance._options,
        instance.optionKeys
    );
    //将原始配置修改为剔除html属性后的配置
    instance._options = decomposeOptions.options;
    object.deepMerge(
        instance._options,
        compileResult.decomposeResultMap['root']?.nodeOptions || {}
    );
    // 合并父组件传递过来的html属性
    object.deepMerge(compileResult.attrDeclMap['root'] ?? {}, decomposeOptions.attrDecl);
    instance.nodeMapMgr = new NodeMapManager(compileResult, instance);
    instance.logger.debug(`[prepare:compile template]`, `[${instance.type}]:[${instance.id}]`);
}
