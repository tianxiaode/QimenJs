import { NodeMapManager } from '@/component-core/engine/NodeManager';
import { InitContext } from '../../types';
import { object } from '@qimenjs/utils';
import { TemplateManager } from '../TemplateManager';

export function compileTemplate(ctx: InitContext): void {
    const instance = ctx.instance;
    const cache = TemplateManager.get(instance.tpl);
    // 父组件传递的 options 和 attrs 已在模板定义中分离，直接使用
    instance._options = instance._options ?? {};
    object.deepMerge(instance._options, cache.nodes?.root?.options || {});
    instance.nodeMapMgr = new NodeMapManager(cache, instance);
    instance.logger.debug(`[prepare:compile template]`, `[${instance.type}]:[${instance.id}]`);
}
