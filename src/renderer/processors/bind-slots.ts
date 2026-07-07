/**
 * BIND_SLOTS 处理器
 *
 * 渲染布局插槽
 */

import type { RenderProcessor, RenderContext } from '../RenderContext';
import { RenderWeight, RenderPhase } from '../RenderContext';
import type { LayoutNode } from '@qimenjs/layout';

export const bindSlotsProcessor: RenderProcessor = {
    name: 'render-bind-slots',
    weight: RenderWeight.BIND_SLOTS,
    phases: [RenderPhase.INIT],
    description: '渲染布局插槽',

    async execute(ctx: RenderContext): Promise<void> {
        if (!ctx.component || !ctx.node.slots) return;

        const { Renderer } = require('../Renderer');
        const renderer = Renderer.getInstance();

        for (const [slotName, slotContent] of Object.entries(ctx.node.slots)) {
            // 查找插槽容器
            const slotContainer = ctx.component.el?.querySelector(`[data-slot="${slotName}"]`) as HTMLElement
                ?? ctx.component.el;

            if (!slotContainer) continue;

            const nodes: LayoutNode[] = Array.isArray(slotContent) ? slotContent : [slotContent];

            for (const node of nodes) {
                const childCtx = {
                    ...ctx,
                    node,
                    parent: ctx.component,
                    container: slotContainer,
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
        }
    },
};
