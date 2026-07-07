/**
 * BIND_SCHEMA 处理器
 *
 * 绑定 Schema 字段到组件
 */

import type { RenderProcessor, RenderContext } from '../RenderContext';
import { RenderWeight, RenderPhase } from '../RenderContext';

export const bindSchemaProcessor: RenderProcessor = {
    name: 'render-bind-schema',
    weight: RenderWeight.BIND_SCHEMA,
    phases: [RenderPhase.INIT],
    description: '绑定 Schema 字段',

    async execute(ctx: RenderContext): Promise<void> {
        if (!ctx.component || !ctx.node.field) return;
        if (!ctx.schema) return;

        // Schema 字段绑定逻辑
        // 将 Schema 中的字段定义和验证规则绑定到组件
        try {
            const fieldDef = ctx.schema.getField?.(ctx.node.field);
            if (fieldDef) {
                // 设置组件的 field 属性
                ctx.component.field = ctx.node.field;

                // 如果组件有 ValidateAbility，绑定验证规则
                if (ctx.component.errors !== undefined && fieldDef.rules) {
                    ctx.component.validationRules = fieldDef.rules;
                }
            }
        } catch (e) {
            // Schema 字段未找到，跳过
        }
    },
};
