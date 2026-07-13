/**
 * ExpandArrowAbility — 展开/折叠箭头能力
 *
 * 为 MenuItem、TreeNode、Dropdown、Panel 等组件提供可交互的展开/折叠箭头。
 * 模板中通过 data-content="expand:expand" 声明箭头节点，
 * 从 nodeMap 定位节点，绑定点击事件，切换 CSS 状态类，发射内部事件。
 * 不创建 DOM，不操作图标内容——图标由模板/CSS 负责。
 *
 * 与 ArrowAbility（浮层定位箭头，name='arrow'）区分。
 *
 * 特定组件能力：由组件定义时 .with(ExpandArrowAbility) 注入，
 * 不加入 TEMPLATE_COMPONENT_ABILITIES，与 tooltip/badge 等通用能力不同。
 *
 * 状态直接存储在实例属性上，通过 nodeMap 操作 DOM，不使用 abilityState。
 *
 * CSS 状态类：
 * - q-expand-arrow：始终存在
 * - q-expand-arrow--collapsed / q-expand-arrow--expanded：当前状态
 *
 * 使用方式：
 * 1. 模板中定义 { tag: 'span', name: 'expand', content: '▶' }
 * 2. 组件声明 .with(ExpandArrowAbility)
 * 3. constructor 中调用 initExpandArrow()
 * 4. 点击箭头自动切换状态类并触发 'toggle' 内部事件
 */

import type { AbilityDefinition } from '@/composable';

/**
 * 展开/折叠箭头配置
 */
export interface ExpandArrowConfig {
    /** 初始状态，默认 'collapsed' */
    arrowState?: 'collapsed' | 'expanded';
    /** 点击触发的内部事件名，默认 'toggle' */
    arrowEvent?: string;
    /** 箭头节点名称，默认 'expand'（对应模板中 data-content 的 name，与 ArrowAbility 的 'arrow' 区分） */
    arrowName?: string;
}

export const ExpandArrowAbility: AbilityDefinition = {
    /**
     * 初始化展开/折叠箭头
     *
     * 从 nodeMap 中查找箭头节点，绑定点击监听，设置初始状态类。
     * 在模板渲染完成后（_initWithTemplate 之后）调用。
     */
    initExpandArrow(config?: ExpandArrowConfig): void {
        const arrowName = config?.arrowName ?? 'expand';
        const nodeMap = this.nodeMap as Record<string, Record<string, { el: HTMLElement }>> | undefined;
        const arrowNode = nodeMap?.[arrowName]?.[arrowName];

        if (!arrowNode?.el) return;

        const el = arrowNode.el;
        const state = config?.arrowState ?? 'collapsed';
        const eventName = config?.arrowEvent ?? 'toggle';

        // 存储到实例属性
        (this as any)._expandArrowState = state;
        (this as any)._expandArrowEvent = eventName;
        (this as any)._expandArrowName = arrowName;

        // 设置初始状态类
        el.classList.add('q-expand-arrow', `q-expand-arrow--${state}`);

        // 绑定点击
        el.addEventListener('click', (e: Event) => {
            e.stopPropagation();
            this.toggleExpandArrow();
        });
    },

    /**
     * 切换展开/折叠状态
     */
    toggleExpandArrow(): void {
        const current = (this as any)._expandArrowState as 'collapsed' | 'expanded';
        const next = current === 'collapsed' ? 'expanded' : 'collapsed';
        this.setExpandArrowState(next);
    },

    /**
     * 设置箭头状态
     */
    setExpandArrowState(state: 'collapsed' | 'expanded'): void {
        const prev = (this as any)._expandArrowState as 'collapsed' | 'expanded';
        if (prev === state) return;

        (this as any)._expandArrowState = state;

        // 更新 CSS 状态类
        const arrowName = (this as any)._expandArrowName as string;
        const nodeMap = this.nodeMap as Record<string, Record<string, { el: HTMLElement }>> | undefined;
        const el = nodeMap?.[arrowName]?.[arrowName]?.el;
        if (el) {
            el.classList.remove(`q-expand-arrow--${prev}`);
            el.classList.add(`q-expand-arrow--${state}`);
        }

        // 触发内部事件
        this.emit((this as any)._expandArrowEvent, { state, prev });
    },
};
