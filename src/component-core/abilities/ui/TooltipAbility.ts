/**
 * TooltipAbility — 提示浮层能力
 *
 * 提供 tooltip 浮层的快捷操作方法，底层通过 FloatAbility 的 updateFloat 发送事件。
 * 通过 `_initTooltip` 在初始化阶段根据配置自动注册浮层。
 *
 * @example
 * // 组件 options 中声明
 * tooltip: { content: '保存', placement: 'top' }
 *
 * // 运行时更新
 * this.updateTooltip({ content: '新提示' });
 */

import type { AbilityDefinition } from '@/composable';
import type { FloatDecl, Tooltiptoptions } from '../../types';

/** 提示浮层能力，提供 updateTooltip 快捷方法 */
export const TooltipAbility: AbilityDefinition = {
    _initTooltip(): void {
        const cfg: Tooltiptoptions = this.tooltip;
        if (!cfg) return;
        this.attachFloat('tooltip', {
            type: 'tooltip',
            trigger: 'hover',
            placement: cfg.placement ?? 'top',
            showDelay: cfg.delay,
            data: { tooltip: cfg.content },
        } as FloatDecl);
    },

    updateTooltip(data: Record<string, any>): void {
        this.updateFloat('tooltip', data);
    },
};
