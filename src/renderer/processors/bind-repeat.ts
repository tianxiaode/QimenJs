/**
 * BIND_REPEAT 处理器
 *
 * 循环渲染
 */

import type { RenderProcessor, RenderContext } from '../RenderContext';
import { RenderWeight, RenderPhase } from '../RenderContext';

export const bindRepeatProcessor: RenderProcessor = {
    name: 'render-bind-repeat',
    weight: RenderWeight.BIND_REPEAT,
    phases: [RenderPhase.INIT],
    description: '循环渲染',

    async execute(ctx: RenderContext): Promise<void> {
        if (!ctx.component || !ctx.node.repeat) return;

        const { Renderer } = require('../Renderer');
        const renderer = Renderer.getInstance();

        const { source, itemVar = 'item', indexVar = 'index' } = ctx.node.repeat;

        // 从 dataSources 或 props 中获取数据
        const data = ctx.dataSources?.[source]?.data
            ?? ctx.node.props?.[source]
            ?? [];

        if (!Array.isArray(data)) return;

        for (let i = 0; i < data.length; i++) {
            // 为每个循环项创建子节点
            const childNode = {
                ...ctx.node,
                repeat: undefined, // 避免无限递归
                props: {
                    ...ctx.node.props,
                    [itemVar]: data[i],
                    [indexVar]: i,
                },
            };

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
                result.component.parent = ctx.component;
                if (typeof ctx.component.addChild === 'function') {
                    ctx.component.addChild(result.component);
                }
            }
        }
    },
};
