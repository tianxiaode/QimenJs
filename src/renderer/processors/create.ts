/**
 * CREATE 处理器
 *
 * 创建组件实例，设置 cid/id/type，在 el 上挂载 __qComponent 引用
 */

import type { RenderProcessor, RenderContext } from '../RenderContext';
import { RenderWeight, RenderPhase } from '../RenderContext';
import { ComponentRegistrar } from '@qimenjs/component-core';

export const createProcessor: RenderProcessor = {
    name: 'render-create',
    weight: RenderWeight.CREATE,
    phases: [RenderPhase.INIT],
    description: '创建组件实例',

    async execute(ctx: RenderContext): Promise<void> {
        const registrar = ComponentRegistrar.getInstance();
        const ComponentClass = registrar.get(ctx.node.type);

        if (!ComponentClass) {
            throw new Error(`Component "${ctx.node.type}" not registered`);
        }

        // 创建组件实例
        const component = new ComponentClass(ctx.node.props);

        // 设置 type（来自注册表）
        component.type = ctx.node.type;

        // 设置 id（来自 Layout 定义）
        if (ctx.node.id) {
            component.id = ctx.node.id;
        }

        // 在 el 上挂载组件引用
        if (component.el) {
            (component.el as any).__qComponent = component;
        }

        ctx.component = component;
    },
};
