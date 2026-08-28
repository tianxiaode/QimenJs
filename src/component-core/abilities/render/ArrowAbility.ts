/**
 * ArrowAbility — 浮层箭头指示器能力
 *
 * 通用浮层箭头能力，可组合到任何浮层组件（Tips/Dropdown/Popover 等）。
 * 模板中通过 name="xxx:arrow" 声明箭头节点，
 * 通过 getNodeEl 定位节点，控制方向类和显隐。
 * 不创建 DOM——箭头 div 由模板定义。
 *
 * 与 ExpandArrowAbility（展开/折叠箭头，name='expand'）区分。
 *
 * 特定组件能力：由组件定义时 .with(ArrowAbility) 注入，
 * 不加入 TEMPLATE_COMPONENT_ABILITIES，与 tooltip/badge 等通用能力不同。
 *
 * 状态通过 abilityState 保存，不使用实例属性。
 * 箭头节点通过 getNodeEl(arrowName) 惰性获取，无需显式 init。
 *
 * CSS 变量（在 .q-arrow 上定义默认值）：
 * - --q-arrow-color：箭头颜色，默认 var(--q-color-dark, #303133)
 * - --q-arrow-size：箭头尺寸（px），默认 5
 *
 * 使用方式：
 * 1. 模板中定义 { tag: 'span', name: 'xxx:arrow', className: 'q-arrow' }
 * 2. 浮层组件声明 .with(ArrowAbility)
 * 3. 直接设置 arrowName/arrow/arrowVars 属性即可
 * 4. 定位后调用 updateArrowPlacement(placement) 更新方向
 */

import type { AbilityDefinition } from '@/composable';
import {
    ARROW_HIDDEN_CLS,
    ARROW_PLACEMENT_CLS,
    ARROW_STATE_KEYS,
} from '@/component-core/constants';

export const ArrowAbility = {
    /** 箭头节点名称，默认 'arrow' */
    arrowName: {
        get() {
            return this.abilityState(ARROW_STATE_KEYS.name) ?? 'arrow';
        },
        set(v: string) {
            this.setAbilityState(ARROW_STATE_KEYS.name, v);
        },
    },

    /** 箭头可见性 */
    arrow: {
        get() {
            return this.abilityState(ARROW_STATE_KEYS.visible) ?? true;
        },
        set(v: boolean) {
            this.setAbilityState(ARROW_STATE_KEYS.visible, v);
            const name = this.arrowName;
            if (!name) return;
            if (v) {
                this.removeCls(name, ARROW_HIDDEN_CLS);
            } else {
                this.addCls(name, ARROW_HIDDEN_CLS);
            }
        },
    },

    /** 箭头 CSS 变量（setter only） */
    arrowVars: {
        set(v: Record<string, string>) {
            const name = this.arrowName;
            if (!name) return;
            this.setStyles(name, v);
        },
    },

    updateArrowPlacement(placement: string): void {
        const name = this.arrowName;
        if (!name) return;
        this.removeCls(name, ARROW_PLACEMENT_CLS.top);
        this.removeCls(name, ARROW_PLACEMENT_CLS.bottom);
        this.removeCls(name, ARROW_PLACEMENT_CLS.left);
        this.removeCls(name, ARROW_PLACEMENT_CLS.right);
        this.addCls(name, ARROW_PLACEMENT_CLS[placement as keyof typeof ARROW_PLACEMENT_CLS]);
    },
} satisfies AbilityDefinition;
