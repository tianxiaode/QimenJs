/**
 * BIND_HANDLER 处理器
 *
 * 绑定事件处理器：字符串映射和 HandlerAction 两种形式
 */

import type { RenderProcessor, RenderContext } from '../RenderContext';
import { RenderWeight, RenderPhase } from '../RenderContext';
import type { HandlerAction } from '@qimenjs/layout';

/**
 * 执行 HandlerAction
 */
function executeHandlerAction(action: HandlerAction, ctx: RenderContext): void {
    const { ComponentManager } = require('@qimenjs/component-core');

    switch (action.action) {
        case 'close': {
            const target = action.target ? ComponentManager.getInstance().get(action.target) : ctx.component;
            if (target && typeof target.close === 'function') target.close();
            break;
        }
        case 'open': {
            const target = action.target ? ComponentManager.getInstance().get(action.target) : ctx.component;
            if (target && typeof target.open === 'function') target.open();
            break;
        }
        case 'submit': {
            const target = action.target ? ComponentManager.getInstance().get(action.target) : ctx.component;
            if (target && typeof target.submit === 'function') target.submit();
            break;
        }
        case 'reset': {
            const target = action.target ? ComponentManager.getInstance().get(action.target) : ctx.component;
            if (target && typeof target.reset === 'function') target.reset();
            break;
        }
        case 'toggle': {
            const target = action.target ? ComponentManager.getInstance().get(action.target) : ctx.component;
            if (target && typeof target.toggle === 'function') target.toggle();
            break;
        }
        case 'show': {
            const target = action.target ? ComponentManager.getInstance().get(action.target) : ctx.component;
            if (target && typeof target.show === 'function') target.show();
            break;
        }
        case 'hide': {
            const target = action.target ? ComponentManager.getInstance().get(action.target) : ctx.component;
            if (target && typeof target.hide === 'function') target.hide();
            break;
        }
        case 'navigate': {
            // navigate 的具体行为由应用框架层的路由框架实现
            // 在路由框架未实现前，通过 window.location.hash 简单处理
            if (action.params?.path) {
                if (typeof window !== 'undefined') {
                    window.location.hash = action.params.path;
                }
            }
            break;
        }
        case 'emit': {
            const { globalEventBus } = require('@qimenjs/events');
            const eventName = action.target ? `${action.target}:${action.params?.type || 'custom'}` : 'custom';
            globalEventBus.emit(eventName, action.params);
            break;
        }
        case 'custom': {
            // 自定义动作，从 handlers 中查找
            if (action.params?.handler && ctx.handlers[action.params.handler]) {
                ctx.handlers[action.params.handler](ctx.component, action);
            }
            break;
        }
    }
}

export const bindHandlerProcessor: RenderProcessor = {
    name: 'render-bind-handler',
    weight: RenderWeight.BIND_HANDLER,
    phases: [RenderPhase.INIT],
    description: '绑定事件处理器',

    async execute(ctx: RenderContext): Promise<void> {
        if (!ctx.component || !ctx.node.handlers) return;

        for (const [event, handler] of Object.entries(ctx.node.handlers)) {
            const handlers = Array.isArray(handler) ? handler : [handler];

            for (const h of handlers) {
                if (typeof h === 'string') {
                    // 字符串映射：从 RenderContext.handlers 查找函数
                    const fn = ctx.handlers[h];
                    if (!fn) {
                        console.warn(`Handler "${h}" not found in RenderContext.handlers`);
                        continue;
                    }

                    // 绑定 DOM 事件
                    if (ctx.component.el && typeof ctx.component.onDom === 'function') {
                        ctx.component.onDom(event, (domEvent: Event) => {
                            fn(ctx.component, domEvent);
                        });
                    }
                } else if (typeof h === 'function') {
                    // 函数引用：JS 对象字面量 Layout 直接写函数
                    if (ctx.component.el && typeof ctx.component.onDom === 'function') {
                        const boundFn = h.bind(ctx.component);
                        ctx.component.onDom(event, (domEvent: Event) => {
                            boundFn(ctx.component, domEvent);
                        });
                    }
                } else if (typeof h === 'object' && 'action' in h) {
                    // HandlerAction：结构化动作
                    if (ctx.component.el && typeof ctx.component.onDom === 'function') {
                        ctx.component.onDom(event, () => {
                            executeHandlerAction(h as HandlerAction, ctx);
                        });
                    }
                }
            }
        }
    },
};
