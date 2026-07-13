/**
 * ArrowAbility — 箭头指示器能力
 *
 * 通用浮层箭头能力，可组合到任何浮层组件（Tips/Dropdown/Popover 等）。
 * 通过 CSS 变量控制箭头颜色、大小等样式，组件初始化时覆盖变量即可。
 *
 * 能力状态管理：
 * - _arrowEl：箭头 DOM 引用
 * - _arrowVisible：箭头显隐状态
 *
 * CSS 变量（在 .q-arrow 上定义默认值）：
 * - --q-arrow-color：箭头颜色，默认 var(--q-color-dark, #303133)
 * - --q-arrow-size：箭头尺寸（px），默认 5
 *
 * 使用方式：
 * 1. 浮层组件声明 abilities 包含 ArrowAbility
 * 2. constructor 中调用 initArrow()
 * 3. 定位后调用 updateArrowPlacement(placement) 更新方向
 */

import type { AbilityDefinition } from '@/composable';
import type { Placement } from '@qimenjs/component-core';

/**
 * 箭头配置
 */
export interface ArrowConfig {
    /** 是否显示箭头，默认 true */
    arrow?: boolean;
    /** CSS 变量覆盖，如 { '--q-arrow-color': '#fff', '--q-arrow-size': '6px' } */
    arrowVars?: Record<string, string>;
}

export const ArrowAbility: AbilityDefinition = {
    // ─── 能力状态 ───

    _arrowEl: {
        get(): HTMLElement | null {
            return this.abilityState('ArrowAbility:el', null);
        },
        set(value: HTMLElement | null) {
            this.setAbilityState('ArrowAbility:el', value);
        },
    },

    _arrowVisible: {
        get(): boolean {
            return this.abilityState('ArrowAbility:visible', true);
        },
        set(value: boolean) {
            this.setAbilityState('ArrowAbility:visible', value);
        },
    },

    // ─── 初始化 ───

    /**
     * 初始化箭头 — 创建 DOM 节点并挂载
     *
     * 在 initOverlayHost() 之后调用。
     */
    initArrow(config?: ArrowConfig): void {
        this._arrowVisible = config?.arrow ?? true;

        // 创建箭头 DOM
        const arrow = document.createElement('span');
        arrow.className = 'q-arrow';
        this._arrowEl = arrow;
        this.el.appendChild(arrow);

        // 应用 CSS 变量覆盖
        if (config?.arrowVars) {
            for (const [key, value] of Object.entries(config.arrowVars)) {
                this.el.style.setProperty(key, value);
            }
        }

        // 初始显隐
        if (!this._arrowVisible) {
            arrow.style.display = 'none';
        }
    },

    // ─── 方向更新 ───

    /**
     * 更新箭头方向类
     *
     * 定位后调用，传入实际 placement（flip 后可能改变）。
     */
    updateArrowPlacement(placement: Placement): void {
        const arrow = this._arrowEl;
        if (!arrow) return;
        arrow.classList.remove('q-arrow--top', 'q-arrow--bottom', 'q-arrow--left', 'q-arrow--right');
        arrow.classList.add(`q-arrow--${placement}`);
    },

    // ─── 显隐控制 ───

    /**
     * 设置箭头显隐
     */
    setArrowVisible(visible: boolean): void {
        this._arrowVisible = visible;
        if (this._arrowEl) {
            this._arrowEl.style.display = visible ? '' : 'none';
        }
    },
};
