/**
 * ExpandArrowAbility — 展开/折叠箭头能力
 *
 * 为 MenuItem、TreeNode、Dropdown 等组件提供可交互的展开/折叠箭头。
 * 模板中通过 data-content="expand:expand" 声明箭头节点，
 * Ability 从 nodeMap 定位节点，绑定点击事件，切换 CSS 状态类，发射内部事件。
 * 不创建 DOM，不操作图标内容——图标由模板/CSS 负责。
 *
 * 与 ArrowAbility（浮层定位箭头，name='arrow'）区分。
 *
 * CSS 状态类：
 * - q-expand-arrow：始终存在
 * - q-expand-arrow--collapsed / q-expand-arrow--expanded：当前状态
 *
 * 使用方式：
 * 1. 模板中定义 { tag: 'span', name: 'expand', content: '▶' }
 * 2. 组件声明 abilities 包含 ExpandArrowAbility
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
    // ─── 能力状态 ───

    _expandArrowState: {
        get(): 'collapsed' | 'expanded' {
            return this.abilityState('ExpandArrowAbility:state', 'collapsed');
        },
        set(value: 'collapsed' | 'expanded') {
            this.setAbilityState('ExpandArrowAbility:state', value);
        },
    },

    _expandArrowEvent: {
        get(): string {
            return this.abilityState('ExpandArrowAbility:event', 'toggle');
        },
        set(value: string) {
            this.setAbilityState('ExpandArrowAbility:event', value);
        },
    },

    // ─── 初始化 ───

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
        this._expandArrowState = config?.arrowState ?? 'collapsed';
        this._expandArrowEvent = config?.arrowEvent ?? 'toggle';

        // 设置初始状态类
        el.classList.add('q-expand-arrow', `q-expand-arrow--${this._expandArrowState}`);

        // 绑定点击
        el.addEventListener('click', (e: Event) => {
            e.stopPropagation();
            this.toggleExpandArrow();
        });
    },

    // ─── 状态切换 ───

    /**
     * 切换展开/折叠状态
     */
    toggleExpandArrow(): void {
        const next = this._expandArrowState === 'collapsed' ? 'expanded' : 'collapsed';
        this.setExpandArrowState(next);
    },

    /**
     * 设置箭头状态
     */
    setExpandArrowState(state: 'collapsed' | 'expanded'): void {
        const prev = this._expandArrowState;
        if (prev === state) return;

        this._expandArrowState = state;

        // 更新 CSS 状态类
        const arrowName = this.abilityState('ExpandArrowAbility:arrowName', 'expand');
        const nodeMap = this.nodeMap as Record<string, Record<string, { el: HTMLElement }>> | undefined;
        const el = nodeMap?.[arrowName]?.[arrowName]?.el;
        if (el) {
            el.classList.remove(`q-expand-arrow--${prev}`);
            el.classList.add(`q-expand-arrow--${state}`);
        }

        // 触发内部事件
        this.emit(this._expandArrowEvent, { state, prev });
    },
};
