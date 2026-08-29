/**
 * IndicatorAbility — 指示器能力（内嵌模式）
 *
 * indicator 不走浮动引擎，由 `_initIndicator` 在能力初始化时创建 DOM，
 * 参照 BadgeAbility 模式，直接追加到 `this.el`，不进 nodeMap、不影响节点查询。
 *
 * 支持 dot/number/dash/button/tab 五种指示项形态，以及 prev/next 箭头，
 * 通过 trigger 控制显隐（always 常显 / hover 悬停显隐 / manual 手动）。
 *
 * @example
 * // 组件 options 中声明
 * indicator: { type: 'dot', count: 5, activeIndex: 0, arrows: true }
 *
 * // 运行时操作
 * this.updateIndicator({ activeIndex: 2 });   // 更新选中
 * this.prevIndicator();                        // 上一项
 * this.nextIndicator();                        // 下一项
 * this.showIndicator();                        // 显示
 * this.hideIndicator();                        // 隐藏
 */

import type { AbilityDefinition } from '@/composable';
import type { IndicatorOptions } from '../../types';
import { INDICATOR_PLACEMENT_MAP, INDICATOR_STATE_KEY, INDICATOR_TYPE_CLS } from '../../constants';

interface IndicatorState {
    /** 根元素 */
    el: HTMLElement;
    /** 指示项容器 */
    itemsEl: HTMLElement;
    /** 指示项元素列表 */
    items: HTMLElement[];
    /** 上一项箭头 */
    prevEl?: HTMLElement;
    /** 下一项箭头 */
    nextEl?: HTMLElement;
    /** 指示器配置 */
    config: IndicatorOptions;
    /** 当前选中索引 */
    activeIndex: number;
    /** 指示项总数 */
    count: number;
}

/** 箭头符号 */
const ARROW_TEXT = {
    prev: '‹',
    next: '›',
} as const;

/** 带文本指示项的形态 */
const TEXTUAL_TYPES = new Set(['number', 'button', 'tab']);

/** 指示器能力，提供指示器创建、选中切换与显示/隐藏 */
export const IndicatorAbility: AbilityDefinition = {
    /**
     * 初始化指示器
     *
     * 根据组件 indicator 配置创建轮播指示器 DOM（箭头 + 指示项），
     * 插入 this.el 末尾，并绑定点击切换、trigger 显隐。
     */
    _initIndicator(): void {
        const cfg = this.indicator as IndicatorOptions | undefined;
        if (!cfg) return;
        const count = cfg.count ?? 0;
        if (count <= 0) return;

        const root = document.createElement('div');
        root.className = `q-indicator ${INDICATOR_TYPE_CLS[cfg.type] ?? INDICATOR_TYPE_CLS.dot}`;
        root.style.position = 'absolute';
        const placement =
            INDICATOR_PLACEMENT_MAP[cfg.placement as keyof typeof INDICATOR_PLACEMENT_MAP] ??
            INDICATOR_PLACEMENT_MAP.bottom;
        Object.assign(root.style, placement);

        let prevEl: HTMLElement | undefined;
        let nextEl: HTMLElement | undefined;
        if (cfg.arrows) {
            prevEl = this._createArrow('prev');
            nextEl = this._createArrow('next');
            this.bind(prevEl, 'click');
            this.bind(nextEl, 'click');
        }

        const itemsEl = document.createElement('div');
        itemsEl.className = 'q-indicator__items';
        const items: HTMLElement[] = [];
        for (let i = 0; i < count; i++) {
            const item = this._createItem(cfg.type, i);
            items.push(item);
            itemsEl.appendChild(item);
            this.bind(item, 'click');
        }

        if (prevEl) root.appendChild(prevEl);
        root.appendChild(itemsEl);
        if (nextEl) root.appendChild(nextEl);

        if (!this.el.style.position || this.el.style.position === 'static') {
            this.el.style.position = 'relative';
        }
        this.el.appendChild(root);

        const state: IndicatorState = {
            el: root,
            itemsEl,
            items,
            prevEl,
            nextEl,
            config: cfg,
            activeIndex: cfg.activeIndex ?? 0,
            count,
        };
        this.abilityState(INDICATOR_STATE_KEY, () => state);

        this._applyActive(state);
        this._setupTrigger(state);

        this.on('dom:click', (e: any) => this._handleClick(e, state));
    },

    /**
     * 创建箭头元素
     */
    _createArrow(dir: 'prev' | 'next'): HTMLElement {
        const el = document.createElement('span');
        el.className = `q-indicator__arrow q-indicator__arrow--${dir}`;
        el.textContent = ARROW_TEXT[dir];
        return el;
    },

    /**
     * 创建指示项元素
     */
    _createItem(type: string, index: number): HTMLElement {
        const el = document.createElement('span');
        el.className = 'q-indicator__item';
        if (TEXTUAL_TYPES.has(type)) {
            el.textContent = String(index + 1);
        }
        return el;
    },

    /**
     * 应用选中态高亮
     */
    _applyActive(state: IndicatorState): void {
        state.items.forEach((item, i) => {
            item.classList.toggle('q-indicator__item--active', i === state.activeIndex);
        });
    },

    /**
     * 处理指示器点击（指示项切换 / 箭头翻页）
     */
    _handleClick(e: any, state: IndicatorState): void {
        const target = e?.target;
        if (!target) return;

        if (target === state.prevEl) {
            this._step(state, -1);
            return;
        }
        if (target === state.nextEl) {
            this._step(state, 1);
            return;
        }

        const index = state.items.indexOf(target);
        if (index >= 0) {
            this._setActive(state, index);
        }
    },

    /**
     * 切换选中索引
     */
    _setActive(state: IndicatorState, index: number): void {
        if (index < 0 || index >= state.count || index === state.activeIndex) return;
        const prevIndex = state.activeIndex;
        state.activeIndex = index;
        this._applyActive(state);
        const eventName = state.config.emits?.changed ?? 'indicatorChange';
        this.emit?.(eventName, { index, prevIndex });
    },

    /**
     * 步进（prev/next）
     */
    _step(state: IndicatorState, delta: number): void {
        const next = state.activeIndex + delta;
        if (next >= 0 && next < state.count) {
            this._setActive(state, next);
        }
    },

    /**
     * 按 trigger 配置设置显隐时机
     */
    _setupTrigger(state: IndicatorState): void {
        const trigger = state.config.trigger ?? 'always';

        if (trigger === 'hover') {
            state.el.style.display = 'none';
            this.bind(this.el, 'enter');
            this.bind(this.el, 'leave');
            this.on('dom:enter', () => {
                state.el.style.display = '';
            });
            this.on('dom:leave', () => {
                state.el.style.display = 'none';
            });
            return;
        }

        if (trigger === 'manual') {
            state.el.style.display = 'none';
        }
    },

    /**
     * 更新指示器
     *
     * @param data - 更新数据（如 { activeIndex: 2 }）
     */
    updateIndicator(data: Record<string, any>): void {
        const state = this.abilityState(INDICATOR_STATE_KEY) as IndicatorState | undefined;
        if (!state || data.activeIndex === undefined) return;
        this._setActive(state, data.activeIndex);
    },

    /**
     * 显示指示器
     */
    showIndicator(): void {
        const state = this.abilityState(INDICATOR_STATE_KEY) as IndicatorState | undefined;
        if (state) state.el.style.display = '';
    },

    /**
     * 隐藏指示器
     */
    hideIndicator(): void {
        const state = this.abilityState(INDICATOR_STATE_KEY) as IndicatorState | undefined;
        if (state) state.el.style.display = 'none';
    },

    /**
     * 切换指示器显示/隐藏
     */
    toggleIndicator(): void {
        const state = this.abilityState(INDICATOR_STATE_KEY) as IndicatorState | undefined;
        if (state) {
            state.el.style.display = state.el.style.display === 'none' ? '' : 'none';
        }
    },

    /**
     * 切换到上一项
     */
    prevIndicator(): void {
        const state = this.abilityState(INDICATOR_STATE_KEY) as IndicatorState | undefined;
        if (state) this._step(state, -1);
    },

    /**
     * 切换到下一项
     */
    nextIndicator(): void {
        const state = this.abilityState(INDICATOR_STATE_KEY) as IndicatorState | undefined;
        if (state) this._step(state, 1);
    },
};
