/**
 * OverflowAbility — 溢出能力
 *
 * 为 ItemGroup 组件提供溢出检测与滚动/菜单能力。
 * overflow 节点（prev/next/more）作为 itemContainer 的兄弟节点
 * 渲染在 ItemGroup 模板内部，天然位置正确，不进入浮层层级。
 *
 * 模式：
 * - 'none'  — 无溢出处理
 * - 'scroll' — 显示 prev/next 箭头，点击滚动
 * - 'menu'  — 显示 more 按钮，点击溢出菜单项
 *
 * 使用方式：
 *   ItemGroupBaseComponent.use(OverflowAbility);
 *   new ItemGroupStaticComponent({ overflowMode: 'scroll' });
 *
 * 事件：
 *   - 'overflowmenu'  — menu 模式下点击溢出项时触发
 */

import type { AbilityDefinition } from '@/composable';

export type OverflowMode = 'none' | 'scroll' | 'menu';

export interface OverflowState {
    canScrollPrev: boolean;
    canScrollNext: boolean;
    scrollPos: number;
    maxScroll: number;
    overflowing: boolean;
}

export interface OverflowItem {
    key: string;
    label: string;
    element: HTMLElement;
    data?: any;
}

const STATE_KEY = 'OverflowAbility:state';

interface InternalState {
    mode: OverflowMode;
    direction: 'horizontal' | 'vertical';
    step: number;
    rafId: number;
    scrollHandler: (() => void) | null;
    resizeObserver: ResizeObserver | null;
    mutationObserver: MutationObserver | null;
    prevClickHandler: (() => void) | null;
    nextClickHandler: (() => void) | null;
    moreClickHandler: (() => void) | null;
    overflowItems: OverflowItem[];
}

function getScrollPos(el: HTMLElement, direction: 'horizontal' | 'vertical'): number {
    return direction === 'horizontal' ? el.scrollLeft : el.scrollTop;
}

function getScrollSize(el: HTMLElement, direction: 'horizontal' | 'vertical'): number {
    return direction === 'horizontal' ? el.scrollWidth : el.scrollHeight;
}

function getClientSize(el: HTMLElement, direction: 'horizontal' | 'vertical'): number {
    return direction === 'horizontal' ? el.clientWidth : el.clientHeight;
}

export const OverflowAbility = {
    /**
     * 初始化溢出能力
     */
    initOverflow(config: {
        mode?: OverflowMode;
        direction?: 'horizontal' | 'vertical';
        step?: number;
    }): void {
        this.setAbilityState(STATE_KEY, {
            mode: config.mode ?? 'none',
            direction: config.direction ?? 'horizontal',
            step: config.step ?? 100,
            rafId: 0,
            scrollHandler: null,
            resizeObserver: null,
            mutationObserver: null,
            prevClickHandler: null,
            nextClickHandler: null,
            moreClickHandler: null,
            overflowItems: [],
        } as InternalState);

        this._applyOverflowMode();
    },

    /**
     * 获取当前溢出状态
     */
    getOverflowState(): OverflowState {
        const state = this.abilityState(STATE_KEY) as InternalState | undefined;
        if (!state) return { canScrollPrev: false, canScrollNext: false, scrollPos: 0, maxScroll: 0, overflowing: false };

        const container = this.itemContainer?.el;
        if (!container) return { canScrollPrev: false, canScrollNext: false, scrollPos: 0, maxScroll: 0, overflowing: false };

        const scrollPos = getScrollPos(container, state.direction);
        const scrollSize = getScrollSize(container, state.direction);
        const clientSize = getClientSize(container, state.direction);
        const maxScroll = Math.max(0, scrollSize - clientSize);

        return {
            canScrollPrev: scrollPos > 1,
            canScrollNext: scrollPos < maxScroll - 1,
            scrollPos,
            maxScroll,
            overflowing: maxScroll > 0,
        };
    },

    /**
     * 获取溢出项列表（menu 模式）
     */
    getOverflowItems(): OverflowItem[] {
        const state = this.abilityState(STATE_KEY) as InternalState | undefined;
        return state?.overflowItems ?? [];
    },

    /**
     * 上一个按钮点击处理
     */
    _onOverflowPrevClick(): void {
        const state = this.abilityState(STATE_KEY) as InternalState | undefined;
        if (!state || state.mode !== 'scroll') return;
        this._scrollBy('prev');
    },

    /**
     * 下一个按钮点击处理
     */
    _onOverflowNextClick(): void {
        const state = this.abilityState(STATE_KEY) as InternalState | undefined;
        if (!state || state.mode !== 'scroll') return;
        this._scrollBy('next');
    },

    /**
     * more 按钮点击处理（menu 模式）
     */
    _onOverflowMoreClick(): void {
        const state = this.abilityState(STATE_KEY) as InternalState | undefined;
        if (!state || state.mode !== 'menu') return;

        const items = state.overflowItems;
        if (items.length === 0) return;

        this.emit('overflowmenutoggle', {
            anchor: this.nodeMap?.overflowMore?.el,
            items: items.map(item => ({
                key: item.key,
                label: item.label,
                data: item.element.getAttribute('data-data')
                    ? JSON.parse(item.element.getAttribute('data-data')!)
                    : undefined,
            })),
        });
    },

    /**
     * 滚动指定方向
     */
    _scrollBy(which: 'prev' | 'next'): void {
        const state = this.abilityState(STATE_KEY) as InternalState | undefined;
        if (!state) return;

        const container = this.itemContainer?.el;
        if (!container) return;

        const delta = which === 'prev' ? -state.step : state.step;

        if (state.direction === 'horizontal') {
            container.scrollBy({ left: delta, behavior: 'smooth' });
        } else {
            container.scrollBy({ top: delta, behavior: 'smooth' });
        }
    },

    /**
     * 滚动到指定位置
     */
    overflowScrollTo(position: number, smooth: boolean = true): void {
        const state = this.abilityState(STATE_KEY) as InternalState | undefined;
        if (!state) return;

        const container = this.itemContainer?.el;
        if (!container) return;

        if (state.direction === 'horizontal') {
            container.scrollTo({ left: position, behavior: smooth ? 'smooth' : 'instant' });
        } else {
            container.scrollTo({ top: position, behavior: smooth ? 'smooth' : 'instant' });
        }
    },

    /**
     * 滚动到指定子元素
     */
    overflowScrollToChild(child: HTMLElement, smooth: boolean = true): void {
        const state = this.abilityState(STATE_KEY) as InternalState | undefined;
        if (!state) return;

        const container = this.itemContainer?.el;
        if (!container || !child) return;

        const containerRect = container.getBoundingClientRect();
        const childRect = child.getBoundingClientRect();

        if (state.direction === 'horizontal') {
            if (childRect.left < containerRect.left) {
                container.scrollBy({ left: childRect.left - containerRect.left, behavior: smooth ? 'smooth' : 'instant' });
            } else if (childRect.right > containerRect.right) {
                container.scrollBy({ left: childRect.right - containerRect.right, behavior: smooth ? 'smooth' : 'instant' });
            }
        } else {
            if (childRect.top < containerRect.top) {
                container.scrollBy({ top: childRect.top - containerRect.top, behavior: smooth ? 'smooth' : 'instant' });
            } else if (childRect.bottom > containerRect.bottom) {
                container.scrollBy({ top: childRect.bottom - containerRect.bottom, behavior: smooth ? 'smooth' : 'instant' });
            }
        }
    },

    /**
     * 应用溢出模式
     */
    _applyOverflowMode(): void {
        const state = this.abilityState(STATE_KEY) as InternalState | undefined;
        if (!state) return;

        const mode = this._overflowMode ?? state.mode;
        state.mode = mode;

        if (mode === 'none') {
            this._teardownOverflow();
            return;
        }

        this.el.classList.add('q-itemgroup--overflow');

        if (mode === 'scroll') {
            this.el.classList.add('q-itemgroup--overflow-scroll');
            this.el.classList.remove('q-itemgroup--overflow-menu');
            this.setNodeHidden(false, 'overflowPrev');
            this.setNodeHidden(false, 'overflowNext');
            this.setNodeHidden(true, 'overflowMore');
        } else if (mode === 'menu') {
            this.el.classList.add('q-itemgroup--overflow-menu');
            this.el.classList.remove('q-itemgroup--overflow-scroll');
            this.setNodeHidden(false, 'overflowPrev');
            this.setNodeHidden(true, 'overflowNext');
            this.setNodeHidden(false, 'overflowMore');
        }

        this._setupOverflowListeners();
        this._scheduleOverflowUpdate();
    },

    /**
     * 清理溢出能力
     */
    _teardownOverflow(): void {
        const state = this.abilityState(STATE_KEY) as InternalState | undefined;
        if (!state) return;

        if (state.rafId) {
            cancelAnimationFrame(state.rafId);
            state.rafId = 0;
        }

        if (state.scrollHandler) {
            const container = this.itemContainer?.el;
            if (container) {
                container.removeEventListener('scroll', state.scrollHandler);
            }
            state.scrollHandler = null;
        }

        if (state.prevClickHandler) {
            const prevEl = this.nodeMap?.overflowPrev?.el;
            if (prevEl) prevEl.removeEventListener('click', state.prevClickHandler);
            state.prevClickHandler = null;
        }

        if (state.nextClickHandler) {
            const nextEl = this.nodeMap?.overflowNext?.el;
            if (nextEl) nextEl.removeEventListener('click', state.nextClickHandler);
            state.nextClickHandler = null;
        }

        if (state.moreClickHandler) {
            const moreEl = this.nodeMap?.overflowMore?.el;
            if (moreEl) moreEl.removeEventListener('click', state.moreClickHandler);
            state.moreClickHandler = null;
        }

        state.resizeObserver?.disconnect();
        state.resizeObserver = null;

        state.mutationObserver?.disconnect();
        state.mutationObserver = null;

        this.el.classList.remove(
            'q-itemgroup--overflow',
            'q-itemgroup--overflow-scroll',
            'q-itemgroup--overflow-menu',
            'q-itemgroup--can-prev',
            'q-itemgroup--can-next',
            'q-itemgroup--overflowing',
            'q-itemgroup--has-overflow'
        );

        this.setNodeHidden(true, 'overflowPrev');
        this.setNodeHidden(true, 'overflowNext');
        this.setNodeHidden(true, 'overflowMore');
    },

    /**
     * 设置事件监听
     */
    _setupOverflowListeners(): void {
        const state = this.abilityState(STATE_KEY) as InternalState | undefined;
        if (!state) return;

        const container = this.itemContainer?.el;
        if (!container) return;

        if (state.scrollHandler) {
            container.removeEventListener('scroll', state.scrollHandler);
        }
        state.scrollHandler = () => this._scheduleOverflowUpdate();
        container.addEventListener('scroll', state.scrollHandler);

        state.resizeObserver?.disconnect();
        state.resizeObserver = new ResizeObserver(() => this._scheduleOverflowUpdate());
        state.resizeObserver.observe(container);

        state.mutationObserver?.disconnect();
        state.mutationObserver = new MutationObserver(() => this._scheduleOverflowUpdate());
        state.mutationObserver.observe(container, { childList: true });

        const prevEl = this.nodeMap?.overflowPrev?.el;
        if (prevEl) {
            if (state.prevClickHandler) prevEl.removeEventListener('click', state.prevClickHandler);
            state.prevClickHandler = () => this._onOverflowPrevClick();
            prevEl.addEventListener('click', state.prevClickHandler);
        }

        const nextEl = this.nodeMap?.overflowNext?.el;
        if (nextEl) {
            if (state.nextClickHandler) nextEl.removeEventListener('click', state.nextClickHandler);
            state.nextClickHandler = () => this._onOverflowNextClick();
            nextEl.addEventListener('click', state.nextClickHandler);
        }

        const moreEl = this.nodeMap?.overflowMore?.el;
        if (moreEl) {
            if (state.moreClickHandler) moreEl.removeEventListener('click', state.moreClickHandler);
            state.moreClickHandler = () => this._onOverflowMoreClick();
            moreEl.addEventListener('click', state.moreClickHandler);
        }
    },

    /**
     * 调度更新（rAF 节流）
     */
    _scheduleOverflowUpdate(): void {
        const state = this.abilityState(STATE_KEY) as InternalState | undefined;
        if (!state) return;

        if (state.rafId) cancelAnimationFrame(state.rafId);
        state.rafId = requestAnimationFrame(() => {
            state.rafId = 0;
            this._detectOverflow();
            this._updateOverflowUI();
        });
    },

    /**
     * 检测溢出（menu 模式下找出溢出项）
     */
    _detectOverflow(): void {
        const state = this.abilityState(STATE_KEY) as InternalState | undefined;
        if (!state) return;

        const container = this.itemContainer?.el;
        if (!container) return;

        if (state.mode === 'menu') {
            this._detectMenuOverflow(container, state);
        } else if (state.mode === 'scroll') {
            this._detectScrollOverflow(container, state);
        }
    },

    _detectMenuOverflow(container: HTMLElement, state: InternalState): void {
        const containerRect = container.getBoundingClientRect();
        const children = Array.from(container.children) as HTMLElement[];

        const overflowItems: OverflowItem[] = [];
        let firstOverflowIndex = children.length;

        for (let i = 0; i < children.length; i++) {
            const childRect = children[i].getBoundingClientRect();
            const isOverflowing =
                state.direction === 'horizontal'
                    ? childRect.right > containerRect.right
                    : childRect.bottom > containerRect.bottom;

            if (isOverflowing) {
                firstOverflowIndex = i;
                break;
            }
        }

        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (i >= firstOverflowIndex) {
                child.hidden = true;
                overflowItems.push({
                    key: child.getAttribute('data-key') ?? `item-${i}`,
                    label: child.getAttribute('data-label') ?? child.textContent ?? `项 ${i + 1}`,
                    element: child,
                });
            } else {
                child.hidden = false;
            }
        }

        state.overflowItems = overflowItems;
    },

    _detectScrollOverflow(container: HTMLElement, state: InternalState): void {
        const children = Array.from(container.children) as HTMLElement[];
        for (const child of children) {
            child.hidden = false;
        }
        state.overflowItems = [];
    },

    /**
     * 更新溢出 UI
     */
    _updateOverflowUI(): void {
        const state = this.abilityState(STATE_KEY) as InternalState | undefined;
        if (!state) return;

        const overflowState = this.getOverflowState();

        if (state.mode === 'scroll') {
            this.setNodeHidden(!overflowState.canScrollPrev, 'overflowPrev');
            this.setNodeHidden(!overflowState.canScrollNext, 'overflowNext');

            this.el.classList.toggle('q-itemgroup--can-prev', overflowState.canScrollPrev);
            this.el.classList.toggle('q-itemgroup--can-next', overflowState.canScrollNext);
            this.el.classList.toggle('q-itemgroup--overflowing', overflowState.overflowing);
        } else if (state.mode === 'menu') {
            const hasOverflow = state.overflowItems.length > 0;
            this.setNodeHidden(!hasOverflow, 'overflowMore');
            this.setNodeHidden(!overflowState.canScrollPrev || !hasOverflow, 'overflowPrev');

            this.el.classList.toggle('q-itemgroup--can-prev', overflowState.canScrollPrev);
            this.el.classList.toggle('q-itemgroup--has-overflow', hasOverflow);
        }
    },

    /**
     * 刷新溢出状态（外部可调用）
     */
    refreshOverflow(): void {
        this._scheduleOverflowUpdate();
    },

    /**
     * 方向变化时重新检测
     */
    _onOverflowDirectionChange(): void {
        const state = this.abilityState(STATE_KEY) as InternalState | undefined;
        if (!state) return;

        this._scheduleOverflowUpdate();
    },

    /**
     * 步骤变化时
     */
    _onOverflowStepChange(step: number): void {
        const state = this.abilityState(STATE_KEY) as InternalState | undefined;
        if (!state) return;
        state.step = step;
    },
} satisfies AbilityDefinition;
