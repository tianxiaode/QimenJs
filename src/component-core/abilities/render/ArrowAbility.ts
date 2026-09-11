/**
 * ArrowAbility — 浮层箭头能力
 *
 * 默认绑定到所有组件（COMPONENT_ABILITIES）。
 * 通过 arrowCls option 附加自定义 CSS 类到箭头节点，
 * 通过 updateArrowPlacement() 更新方向类（q-arrow--top/bottom/left/right）。
 *
 * 箭头基础样式由全局 theme/arrow.css 定义，组件通过 --q-arrow-color / --q-arrow-size
 * CSS 变量定制外观，无需各自定义箭头 CSS。
 *
 * 模板中通过 name="arrow" 声明箭头节点（可通过 arrowNode field 修改）。
 * arrowCls option 为 null 时不附加任何自定义类。
 */

import type { AbilityDefinition } from '@/composable';

export const ArrowAbility = {
    _onArrowClsOptionChange(value: string, old: string): void {
        const node = this.arrowNode;
        if (old) this.removeCls(old, node);
        if (value) this.addCls(value, node);
    },

    updateArrowPlacement(placement: string): void {
        const node = this.arrowNode;
        this.removeCls('q-arrow--top', node);
        this.removeCls('q-arrow--bottom', node);
        this.removeCls('q-arrow--left', node);
        this.removeCls('q-arrow--right', node);
        this.addCls(`q-arrow--${placement}`, node);
    },
} satisfies AbilityDefinition;
