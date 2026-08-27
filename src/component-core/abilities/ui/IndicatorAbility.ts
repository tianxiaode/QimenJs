/**
 * IndicatorAbility — 指示器浮层能力
 *
 * 提供 indicator 浮层的快捷操作方法，底层通过 FloatAbility 的 show/hide/updateFloat 发送事件。
 * 通过 `_initIndicator` 在初始化阶段根据配置自动注册浮层。
 *
 * this.indicator 支持两种形式：
 * - 组件类：class MyIndicator extends Component { ... }
 * - 配置对象：{ type: 'MyIndicator', placement: 'bottom' }
 *
 * @example
 * // 组件类
 * indicator: MyIndicatorComponent
 *
 * // 配置对象
 * indicator: { type: 'MyIndicator', placement: 'bottom' }
 *
 * // 运行时操作
 * this.showIndicator();
 * this.hideIndicator();
 * this.updateIndicator({ activeIndex: 2 });
 */

import type { AbilityDefinition } from '@/composable';
import type { FloatDecl } from '../../types';

/** 指示器浮层能力，提供 show/hide/update 快捷方法 */
export const IndicatorAbility: AbilityDefinition = {
    _initIndicator(): void {
        const decl = this._getIndicatorFloatDecl();
        if (!decl) return;
        this.attachFloat('indicator', decl);
    },

    _getIndicatorFloatDecl(): FloatDecl | undefined {
        const indicator = this.indicator;
        if (!indicator) return;

        if (typeof indicator === 'function') {
            return {
                type: indicator,
                trigger: 'always',
                placement: 'bottom',
            };
        }

        const { type, trigger, placement, emits, ...data } = indicator as Record<string, any>;
        return {
            type,
            trigger: trigger ?? 'always',
            placement: placement ?? 'bottom',
            emits: { changed: 'indicatorChange', ...emits },
            data: Object.keys(data).length > 0 ? data : undefined,
        };
    },

    showIndicator(): void {
        this.showFloat('indicator');
    },

    hideIndicator(): void {
        this.hideFloat('indicator');
    },

    updateIndicator(data: Record<string, any>): void {
        this.updateFloat('indicator', data);
    },
};
