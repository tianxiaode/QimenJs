/**
 * BIND_ENTITY_HOOKS 处理器
 *
 * 绑定 EntityAbility 钩子函数
 */

import type { RenderProcessor, RenderContext } from '../RenderContext';
import { RenderWeight, RenderPhase } from '../RenderContext';

export const bindEntityHooksProcessor: RenderProcessor = {
    name: 'render-bind-entity-hooks',
    weight: RenderWeight.BIND_ENTITY_HOOKS,
    phases: [RenderPhase.INIT],
    description: '绑定 EntityAbility 钩子函数',

    async execute(ctx: RenderContext): Promise<void> {
        if (!ctx.component) return;

        // 从 props 中获取 entityConfig.hooks
        const entityConfig = ctx.component.entityConfig || ctx.node.props?.entityConfig;
        if (!entityConfig?.hooks) return;

        const hooks = entityConfig.hooks;
        for (const [hookName, value] of Object.entries(hooks)) {
            if (typeof value === 'function') {
                // 方式2：JS 对象 Layout 直接写函数引用，bind 到组件实例
                (ctx.component as any)[hookName] = (value as Function).bind(ctx.component);
            } else if (typeof value === 'string') {
                // 方式3：纯 JSON Layout，从 RenderContext.handlers 查找
                const fn = ctx.handlers[value];
                if (fn) {
                    (ctx.component as any)[hookName] = fn.bind(ctx.component);
                } else {
                    console.warn(`EntityAbility hook "${value}" not found in RenderContext.handlers`);
                }
            }
        }
    },
};
