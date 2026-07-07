/**
 * TEMPLATE 处理器
 *
 * 从 TemplateRegistry 获取模板，cloneNode(true) 克隆，
 * 通过 data-ref 查找子元素
 */

import type { RenderProcessor, RenderContext } from '../RenderContext';
import { RenderWeight, RenderPhase } from '../RenderContext';

export const templateProcessor: RenderProcessor = {
    name: 'render-template',
    weight: RenderWeight.TEMPLATE,
    phases: [RenderPhase.INIT],
    description: '克隆 HTML 模板',

    async execute(ctx: RenderContext): Promise<void> {
        if (!ctx.component) return;

        // 如果组件已有 el，跳过模板处理
        if (ctx.component.el && ctx.component.el.parentNode) return;

        // 尝试从 TemplateRegistry 获取模板
        try {
            const { RegistryHub } = require('@qimenjs/registry');
            const htmlRegistrar = RegistryHub.get('html');
            if (htmlRegistrar && typeof htmlRegistrar.get === 'function') {
                const templateHtml = htmlRegistrar.get(ctx.node.type);
                if (templateHtml && typeof document !== 'undefined') {
                    const template = document.createElement('template');
                    template.innerHTML = templateHtml;
                    const fragment = template.content.cloneNode(true) as DocumentFragment;
                    ctx.fragment = fragment;

                    // 如果组件还没有 el，取 fragment 的第一个元素
                    if (!ctx.component.el && fragment.firstElementChild) {
                        ctx.component.el = fragment.firstElementChild as HTMLElement;
                    }
                }
            }
        } catch (e) {
            // TemplateRegistry 不可用，跳过
        }
    },
};
