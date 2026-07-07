/**
 * MOUNT 处理器
 *
 * 挂载到 DOM，注册到 ComponentManager，设置 data-q-id 属性
 */

import type { RenderProcessor, RenderContext } from '../RenderContext';
import { RenderWeight, RenderPhase } from '../RenderContext';
import { ComponentManager } from '../../component/ComponentManager';

export const mountProcessor: RenderProcessor = {
    name: 'render-mount',
    weight: RenderWeight.MOUNT,
    phases: [RenderPhase.INIT],
    description: '挂载到 DOM',

    async execute(ctx: RenderContext): Promise<void> {
        if (!ctx.component) return;

        // 确定挂载容器
        const container = ctx.container ?? ctx.parent?.el;

        // 挂载到 DOM
        if (container) {
            ctx.component.mount(container);
        }

        // 注册到 ComponentManager
        ComponentManager.getInstance().register(ctx.component);

        // 绑定 stateTriggers
        if (ctx.node.stateTriggers && ctx.component.id) {
            bindStateTriggers(ctx);
        }
    },
};

/**
 * 绑定 stateTriggers
 */
function bindStateTriggers(ctx: RenderContext): void {
    if (!ctx.component?.id || !ctx.node.stateTriggers) return;

    const { globalEventBus } = require('@qimenjs/events');

    for (const trigger of ctx.node.stateTriggers) {
        for (const [eventType, methodName] of Object.entries(trigger.events)) {
            const eventName = trigger.source ? `${trigger.source}:${String(eventType)}` : String(eventType);

            const handler = (eventContext: any) => {
                const method = (ctx.component as any)[methodName];
                if (typeof method === 'function') {
                    method.call(ctx.component, eventContext);
                }
            };

            if (trigger.once) {
                globalEventBus.once(eventName, handler);
            } else {
                const off = globalEventBus.on(eventName, handler);
                // 组件销毁时自动解绑
                if (ctx.component && typeof ctx.component.onCleanup === 'function') {
                    ctx.component.onCleanup(off);
                }
            }
        }
    }
}
