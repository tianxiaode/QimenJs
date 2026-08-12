import { NodeMapManager } from '@/component-core/engine/NodeManager';
import { InitContext } from '../../types';
import { object } from '@qimenjs/utils';
import { TemplateManager } from '../TemplateManager';

export function compileTemplate(ctx: InitContext): void {
    const instance = ctx.instance;
    const cache = TemplateManager.get(instance.tpl);
    //拆解父组件传递过来的配置
    const splits = TemplateManager.splitOptions(instance._options, instance.coreKeys);
    //将原始配置修改为剔除html属性后的配置
    instance._options = splits.options;
    object.deepMerge(instance._options, cache.nodeMetaMap?.root.options || {});
    // 合并父组件传递过来的html属性
    object.deepMerge(cache.atttributesMap.root ?? {}, splits.attributes);
    instance.nodeMapMgr = new NodeMapManager(cache, instance);
    instance.logger.debug(`[prepare:compile template]`, `[${instance.type}]:[${instance.id}]`);
}
