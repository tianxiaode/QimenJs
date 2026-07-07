/**
 * BIND_DATASOURCE 处理器
 *
 * 绑定数据源到组件
 */

import type { RenderProcessor, RenderContext } from '../RenderContext';
import { RenderWeight, RenderPhase } from '../RenderContext';

export const bindDatasourceProcessor: RenderProcessor = {
    name: 'render-bind-datasource',
    weight: RenderWeight.BIND_DATASOURCE,
    phases: [RenderPhase.INIT],
    description: '绑定数据源',

    async execute(ctx: RenderContext): Promise<void> {
        if (!ctx.component || !ctx.dataSources) return;

        // 如果 Layout 定义中声明了 dataSource，绑定到组件
        const dataSourceName = ctx.node.props?.dataSource;
        if (dataSourceName && ctx.dataSources[dataSourceName]) {
            ctx.component.dataSource = ctx.dataSources[dataSourceName];
        }
    },
};
