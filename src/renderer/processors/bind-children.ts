/**
 * BIND_CHILDREN 处理器
 *
 * 渲染子节点，设置 parent 引用
 */

import type { RenderProcessor, RenderContext } from '../RenderContext';
import { RenderWeight, RenderPhase } from '../RenderContext';

export const bindChildrenProcessor: RenderProcessor = {
    name: 'render-bind-children',
    weight: RenderWeight.BIND_CHILDREN,
    phases: [RenderPhase.INIT, RenderPhase.UPDATE],
    description: '渲染子节点',

    async execute(ctx: RenderContext): Promise<void> {
        if (!ctx.component || !ctx.node.children) return;

        // 延迟导入避免循环依赖
        const { Renderer } = require('../Renderer');
        const renderer = Renderer.getInstance();

        const childComponents: typeof ctx.component[] = [];

        for (const childNode of ctx.node.children) {
            const childCtx = {
                ...ctx,
                node: childNode,
                parent: ctx.component,
                container: ctx.component.el,
                component: undefined,
                childComponents: [],
            };

            const result = await renderer.renderNode(childCtx);
            if (result?.component) {
                // 设置父引用
                result.component.parent = ctx.component;

                // 添加到父组件的 children 列表
                if (typeof ctx.component.addChild === 'function') {
                    ctx.component.addChild(result.component);
                }

                childComponents.push(result.component);
            }
        }

        ctx.childComponents = childComponents;
    },
};
