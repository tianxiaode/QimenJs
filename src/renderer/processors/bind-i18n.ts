/**
 * BIND_I18N 处理器
 *
 * 处理 TranslationExpr { "$t": "key" }，维护翻译绑定表
 */

import type { RenderProcessor, RenderContext, TranslationBinding } from '../RenderContext';
import { RenderWeight, RenderPhase } from '../RenderContext';
import type { TranslationExpr } from '@qimenjs/layout';

/**
 * 判断值是否为翻译表达式
 */
function isTranslationExpr(value: any): value is TranslationExpr {
    return value !== null
        && typeof value === 'object'
        && '$t' in value
        && typeof value.$t === 'string';
}

/**
 * 翻译表达式
 */
function translate(expr: TranslationExpr): string {
    try {
        const { i18n } = require('@qimenjs/i18n');
        if (i18n && typeof i18n.t === 'function') {
            return i18n.t(expr.$t, expr.params);
        }
    } catch (e) {
        // i18n 不可用
    }
    // 回退：返回 key 本身
    return expr.$t;
}

export const bindI18nProcessor: RenderProcessor = {
    name: 'render-bind-i18n',
    weight: RenderWeight.BIND_I18N,
    phases: [RenderPhase.INIT],
    description: '绑定翻译表达式',

    async execute(ctx: RenderContext): Promise<void> {
        if (!ctx.component || !ctx.node.props) return;

        // 遍历 props，查找翻译表达式
        for (const [prop, value] of Object.entries(ctx.node.props)) {
            if (isTranslationExpr(value)) {
                // 翻译并设置到组件
                const translated = translate(value);
                (ctx.component as any)[prop] = translated;

                // 添加到翻译绑定表
                if (ctx.translationBindings) {
                    ctx.translationBindings.push({
                        component: new WeakRef(ctx.component),
                        prop,
                        key: value.$t,
                        params: value.params,
                    });
                }
            }
        }
    },
};
