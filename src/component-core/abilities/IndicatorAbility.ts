/**
 * IndicatorAbility — 指示器浮层能力
 *
 * 提供 indicator 浮层的快捷操作方法，底层通过 FloatAbility 的 show/hide/updateFloat 发送事件。
 * 通过 `_getIndicatorFloatDecl` 为 FloatAbility 的 _commitFloats 提供浮层声明，
 * 从而在初始化阶段自动注册（因为 indicator 需要在组件初始化时显示）。
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
import type { FloatDecl } from '../types';

/** 指示器浮层能力，提供 show/hide/update 快捷方法 */
export const IndicatorAbility: AbilityDefinition = {
    /**
     * 获取 indicator 浮层声明
     *
     * 支持组件类或配置对象两种形式。
     *
     * @returns FloatDecl 或 undefined（无配置时）
     */
    _getIndicatorFloatDecl(): FloatDecl | undefined {
        const indicator = this.indicator;
        if (!indicator) return;

        if (typeof indicator === 'function') {
            return {
                type: (indicator as any).type || indicator.name,
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

    /**
     * 显示指示器
     *
     * @example
     * this.showIndicator();
     */
    showIndicator(): void {
        this.showFloat('indicator');
    },

    /**
     * 隐藏指示器
     *
     * @example
     * this.hideIndicator();
     */
    hideIndicator(): void {
        this.hideFloat('indicator');
    },

    /**
     * 更新指示器数据
     *
     * @param data - 更新数据（如 { activeIndex: 2 }）
     *
     * @example
     * this.updateIndicator({ activeIndex: 2 });
     */
    updateIndicator(data: Record<string, any>): void {
        this.updateFloat('indicator', data);
    },
};
