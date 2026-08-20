/**
 * TooltipAbility — 提示浮层能力
 *
 * 提供 tooltip 浮层的快捷操作方法，底层通过 FloatAbility 的 updateFloat 发送事件。
 * 通过 `_getTooltipFloatDecl` 为 FloatAbility 的 _commitFloats 提供浮层声明，
 * 从而在初始化阶段自动注册（因为 tooltip 需要 hover 触发器提前绑定）。
 *
 * @example
 * // 组件 options 中声明
 * tooltip: { content: '保存', placement: 'top' }
 *
 * // 运行时更新
 * this.updateTooltip({ content: '新提示' });
 */

import type { AbilityDefinition } from '@/composable';
import type { Tooltiptoptions } from '../types/options';
import type { FloatDecl } from '../types';

/** 提示浮层能力，提供 updateTooltip 快捷方法 */
export const TooltipAbility: AbilityDefinition = {
    /**
     * 获取 tooltip 浮层声明
     *
     * 供 FloatAbility._commitFloats 在初始化时自动注册。
     *
     * @returns FloatDecl 或 undefined（无配置时）
     */
    _getTooltipFloatDecl(): FloatDecl | undefined {
        const cfg: Tooltiptoptions | undefined = this.tooltip;
        if (!cfg) return;

        return {
            type: 'Tooltip',
            trigger: 'hover',
            placement: cfg.placement ?? 'top',
            showDelay: cfg.delay,
            data: { tooltip: cfg.content },
        };
    },

    /**
     * 更新 tooltip 浮层数据
     *
     * @param data - 更新数据
     *
     * @example
     * this.updateTooltip({ content: '新提示' });
     */
    updateTooltip(data: Record<string, any>): void {
        this.updateFloat('tooltip', data);
    },
};
