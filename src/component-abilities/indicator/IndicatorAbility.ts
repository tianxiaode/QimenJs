/**
 * IndicatorAbility — 指示器能力
 *
 * 为 ItemGroup 组件提供指示器浮层支持，配置后自动挂载 IndicatorComponent 浮层，
 * 实现 activeIndex 选中管理与双向通信。
 *
 * 通信链路：
 *   宿主 → 浮层：this.updateIndicator({ activeIndex }) → overlayEmit CHANGE → IndicatorComponent.onOverlayChange
 *   浮层 → 宿主：用户点击指示项 → changed 反馈 → emits: { changed: 'indicatorChange' } → 宿主处理
 *
 * 使用方式：
 *   1. ItemGroup 派生组件通过 with([IndicatorAbility]) 混入
 *   2. 构造函数传入 indicator 配置
 *   3. floats getter 自动生成浮层声明（参考 DropdownComponent 模式）
 *
 * @example
 * new ItemGroupPooledComponent({
 *     items: [...],
 *     indicator: { type: 'dot', placement: 'bottom', arrows: true },
 * })
 */

import type { AbilityDefinition } from '@/composable';
import { EventContextBuilder } from '@/context';
import { OVERLAY_ACTIONS } from '@/events/overlay-events';
import type { FloatDecl } from '@/component-core/types/tpl-node-types';
import type { IndicatorConfig, IndicatorType } from '@/component-core/types/init-context';

const INDICATOR_TYPE_MAP: Record<string, string> = {
    dot: 'IndicatorDot',
    number: 'IndicatorDot',
    dash: 'IndicatorDot',
    button: 'Button',
    tab: 'Tab',
};

const STATE_KEY = 'IndicatorAbility:state';

interface IndicatorState {
    config: IndicatorConfig;
    activeIndex: number;
}

const DEFAULT_INDICATOR_FLOAT = {
    trigger: 'always' as const,
    placement: 'bottom' as const,
};

export const IndicatorAbility = {
    /**
     * 初始化指示器能力
     *
     * @param config - 指示器配置
     */
    initIndicator(config: IndicatorConfig): void {
        this.setAbilityState(STATE_KEY, {
            config,
            activeIndex: config.activeIndex ?? 0,
        });
    },

    /**
     * 获取指示器配置
     */
    get indicatorConfig(): IndicatorConfig | undefined {
        const state = this.abilityState(STATE_KEY) as IndicatorState | undefined;
        return state?.config;
    },

    /**
     * 当前选中索引
     */
    get activeIndex(): number {
        const state = this.abilityState(STATE_KEY) as IndicatorState | undefined;
        return state?.activeIndex ?? 0;
    },
    set activeIndex(value: number) {
        const state = this.abilityState(STATE_KEY) as IndicatorState | undefined;
        if (!state) return;
        state.activeIndex = value;
        this.updateIndicator({ activeIndex: value });
    },

    /**
     * 获取指示器浮层声明（供 floats getter 使用）
     *
     * 参考 DropdownComponent 的 dropFloat 模式，
     * 根据 indicator 配置自动生成 floats 声明。
     */
    get indicatorFloat(): Record<string, FloatDecl> | undefined {
        const config = this.indicatorConfig;
        if (!config) return undefined;

        const defaultItemType =
            config.defaultItemType ?? INDICATOR_TYPE_MAP[config.type] ?? 'IndicatorDot';

        const dotModes: IndicatorType[] = ['dot', 'number', 'dash'];
        const mode = dotModes.includes(config.type) ? config.type : undefined;

        return {
            indicator: {
                ...DEFAULT_INDICATOR_FLOAT,
                type: 'Indicator',
                placement: config.placement ?? 'bottom',
                trigger: config.trigger ?? 'always',
                emits: { changed: 'indicatorChange', ...config.emits },
                defaultItemType,
                mode,
                arrows: config.arrows,
            } as FloatDecl,
        };
    },

    /**
     * 更新指示器浮层内容
     *
     * 通过 overlayEmit 发送 CHANGE 事件，
     * 由 IndicatorComponent.onOverlayChange 处理实际更新。
     *
     * @param data - 更新数据（如 { activeIndex: 2 }）
     */
    updateIndicator(data: Record<string, any>): void {
        const overlayKey = `${this.id}:indicator`;
        this.overlayEmit(
            EventContextBuilder.create()
                .withEvent(`overlay:${overlayKey}:${OVERLAY_ACTIONS.CHANGE}`)
                .withType(OVERLAY_ACTIONS.CHANGE)
                .withSource(overlayKey)
                .withData({ component: { id: this.id }, data })
                .build()
        );
    },

    /**
     * 切换到上一项
     */
    prevIndicator(): void {
        if (this.activeIndex > 0) {
            this.activeIndex = this.activeIndex - 1;
        }
    },

    /**
     * 切换到下一项
     */
    nextIndicator(): void {
        const maxIndex = (this.count ?? 0) - 1;
        if (this.activeIndex < maxIndex) {
            this.activeIndex = this.activeIndex + 1;
        }
    },
} satisfies AbilityDefinition;
