/**
 * ArrowAbility — 浮层箭头指示器能力
 *
 * 通用浮层箭头能力，可组合到任何浮层组件（Tips/Dropdown/Popover 等）。
 * 模板中通过 name="xxx:arrow" 声明箭头节点，
 * 从 nodeMap 定位节点，控制方向类和显隐。
 * 不创建 DOM——箭头 div 由模板定义。
 *
 * 与 ExpandArrowAbility（展开/折叠箭头，name='expand'）区分。
 *
 * 特定组件能力：由组件定义时 .with(ArrowAbility) 注入，
 * 不加入 TEMPLATE_COMPONENT_ABILITIES，与 tooltip/badge 等通用能力不同。
 *
 * 状态直接存储在实例属性上（_arrowVisible/_arrowName/_arrowEl），
 * 通过 nodeMap 操作 DOM，不使用 abilityState。
 * 默认值在能力定义中声明，initArrow() 运行时覆写为实例属性。
 *
 * CSS 变量（在 .q-arrow 上定义默认值）：
 * - --q-arrow-color：箭头颜色，默认 var(--q-color-dark, #303133)
 * - --q-arrow-size：箭头尺寸（px），默认 5
 *
 * 使用方式：
 * 1. 模板中定义 { tag: 'span', name: 'xxx:arrow', className: 'q-arrow' }
 * 2. 浮层组件声明 .with(ArrowAbility)
 * 3. constructor 中调用 initArrow()
 * 4. 定位后调用 updateArrowPlacement(placement) 更新方向
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
    /** 箭头节点名称，默认 'arrow'（对应模板中 name 的 name 部分） */
    arrowName?: string;
}

export const ArrowAbility: AbilityDefinition = {
    _arrowVisible: false,
    _arrowName: '',
    _arrowEl: null as HTMLElement | null,

    initArrow(config?: ArrowConfig): void {
        const arrowName = config?.arrowName ?? 'arrow';
        const nodeMap = this.nodeMap as Record<string, { el: HTMLElement }> | undefined;

        const arrowEl = nodeMap?.[arrowName]?.el;

        if (!arrowEl) return;

        const visible = config?.arrow ?? true;

        this._arrowVisible = visible;
        this._arrowName = arrowName;
        this._arrowEl = arrowEl;

        if (config?.arrowVars) {
            for (const [key, value] of Object.entries(config.arrowVars)) {
                arrowEl.style.setProperty(key, value);
            }
        }

        if (!visible) {
            arrowEl.style.display = 'none';
        }
    },

    updateArrowPlacement(placement: Placement): void {
        const el = this._arrowEl;
        if (!el) return;
        el.classList.remove('q-arrow--top', 'q-arrow--bottom', 'q-arrow--left', 'q-arrow--right');
        el.classList.add(`q-arrow--${placement}`);
    },

    setArrowVisible(visible: boolean): void {
        this._arrowVisible = visible;
        const el = this._arrowEl;
        if (el) {
            el.style.display = visible ? '' : 'none';
        }
    },
};
