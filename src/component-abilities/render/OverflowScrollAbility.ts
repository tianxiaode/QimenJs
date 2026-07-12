/**
 * OverflowScrollAbility — 溢出滚动能力
 *
 * 当子组件超出容器可视范围时：
 * - 横向：显示左/右箭头按钮，点击可滚动；支持触摸/鼠标拖拽横向滑动
 * - 纵向：显示上/下箭头按钮，点击可滚动；支持触摸/鼠标拖拽纵向滑动
 *
 * 适用于工具栏、标签栏等横向/纵向溢出容器。
 *
 * 互斥说明：与 OverflowMenuAbility 互斥，
 * 同一容器不应同时使用两种溢出策略。
 *
 * 模板约定：
 * - 需要模板预定义以下节点（通过 nodeMap 引用）：
 *   - toolbar:contentArea — 子项容器（兼做滚动区域）
 *   - toolbar:prevBtn — 左/上箭头按钮
 *   - toolbar:nextBtn — 右/下箭头按钮
 * - 能力初始化时只做样式/事件绑定，不创建/移动 DOM
 *
 * 事件模式：
 * - 使用 this.bind(el, 'drag') 绑定拖拽手势实现滑动滚动
 * - 使用 this.emit 发布 overflowstate 事件
 * - 使用 abilityState / setAbilityState 做数据隔离
 * - 使用 this.onCleanup 注册清理回调
 */

import type { AbilityDefinition } from '@/composable';

// ─── 滚动方向 ──────────────────────────────────────────

export type OverflowDirection = 'horizontal' | 'vertical';

// ─── 溢出状态 ──────────────────────────────────────────

export interface OverflowState {
    /** 是否可以向前滚动（左/上） */
    canScrollPrev: boolean;
    /** 是否可以向后滚动（右/下） */
    canScrollNext: boolean;
}

// ─── 配置 ──────────────────────────────────────────────

export interface OverflowScrollConfig {
    /** 滚动方向，默认 'horizontal' */
    direction?: OverflowDirection;
    /** 每次箭头点击滚动的像素距离，默认 200 */
    scrollStep?: number;
}

// ─── 能力定义 ──────────────────────────────────────────

export const OverflowScrollAbility: AbilityDefinition = {
    // ─── 属性访问方法 ───

    /**
     * 获取溢出滚动属性
     */
    getOverflowScroll(key: string): any {
        return this.abilityState(`OverflowScrollAbility:prop:${key}`);
    },

    /**
     * 设置溢出滚动属性
     */
    setOverflowScroll(key: string, value: any): void {
        this.setAbilityState(`OverflowScrollAbility:prop:${key}`, value);
    },

    // ─── 初始化 ───

    /**
     * 初始化溢出滚动能力
     *
     * 从 nodeMap 获取模板预定义的节点，绑定事件和 Observer。
     * 不创建/移动 DOM，所有节点由模板预定义。
     *
     * @param config - 配置项
     */
    initOverflowScroll(config: OverflowScrollConfig = {}): void {
        const direction: OverflowDirection = config.direction ?? 'horizontal';
        const scrollStep: number = config.scrollStep ?? 200;

        this.setOverflowScroll('direction', direction);
        this.setOverflowScroll('scrollStep', scrollStep);

        // 从 nodeMap 获取模板预定义的节点
        const contentArea = this.nodeMap?.['toolbar']?.['contentArea']?.el as HTMLElement | undefined;
        const prevBtn = this.nodeMap?.['toolbar']?.['prevBtn']?.el as HTMLElement | undefined;
        const nextBtn = this.nodeMap?.['toolbar']?.['nextBtn']?.el as HTMLElement | undefined;

        if (!contentArea) return;

        const container = this.el;

        // ── 1. 设置容器样式 ──

        container.classList.add('q-overflow-scroll');
        container.classList.add(`q-overflow-scroll--${direction}`);

        // contentArea 作为滚动区域
        contentArea.classList.add('q-overflow-scroll__area');

        // ── 2. 箭头按钮方向样式 + aria ──

        if (prevBtn) {
            prevBtn.classList.add(`q-overflow-arrow--${direction}`);
            prevBtn.setAttribute('aria-label', direction === 'horizontal' ? '向左滚动' : '向上滚动');
        }
        if (nextBtn) {
            nextBtn.classList.add(`q-overflow-arrow--${direction}`);
            nextBtn.setAttribute('aria-label', direction === 'horizontal' ? '向右滚动' : '向下滚动');
        }

        // ── 3. 拖拽滑动滚动 ──

        this.bind(contentArea, 'drag');

        let dragStartScrollPos = 0;

        this.on('drag', (gesture: any) => {
            const phase = gesture?.phase;

            if (phase === 'start') {
                dragStartScrollPos = direction === 'horizontal'
                    ? contentArea.scrollLeft
                    : contentArea.scrollTop;

                contentArea.style.cursor = 'grabbing';
                contentArea.style.userSelect = 'none';
            } else if (phase === 'move') {
                const dx = gesture.dx ?? 0;
                const dy = gesture.dy ?? 0;
                const delta = direction === 'horizontal' ? -dx : -dy;

                if (direction === 'horizontal') {
                    contentArea.scrollLeft = dragStartScrollPos + delta;
                } else {
                    contentArea.scrollTop = dragStartScrollPos + delta;
                }

                this.updateOverflowState(contentArea, direction, prevBtn, nextBtn);
            } else if (phase === 'end' || phase === 'cancel') {
                contentArea.style.cursor = '';
                contentArea.style.userSelect = '';
            }
        });

        // ── 4. 滚动事件监听（更新箭头显隐） ──

        contentArea.addEventListener('scroll', () => {
            this.updateOverflowState(contentArea, direction, prevBtn, nextBtn);
        });

        // ── 5. ResizeObserver 监听容器尺寸变化 ──

        const resizeObserver = new ResizeObserver(() => {
            this.updateOverflowState(contentArea, direction, prevBtn, nextBtn);
        });
        resizeObserver.observe(contentArea);
        this.setOverflowScroll('resizeObserver', resizeObserver);

        // ── 6. MutationObserver 监听子元素变化 ──

        const mutationObserver = new MutationObserver(() => {
            this.updateOverflowState(contentArea, direction, prevBtn, nextBtn);
        });
        mutationObserver.observe(contentArea, { childList: true });
        this.setOverflowScroll('mutationObserver', mutationObserver);

        // ── 7. 初始状态检测 ──

        // 延迟一帧确保布局完成
        requestAnimationFrame(() => {
            this.updateOverflowState(contentArea, direction, prevBtn, nextBtn);
        });

        // ── 8. 清理 ──

        this.onCleanup(() => {
            resizeObserver.disconnect();
            mutationObserver.disconnect();

            container.classList.remove('q-overflow-scroll', `q-overflow-scroll--${direction}`);
            container.classList.remove('q-overflow-scroll--can-prev', 'q-overflow-scroll--can-next', 'q-overflow-scroll--overflowing');

            contentArea.classList.remove('q-overflow-scroll__area');

            // 隐藏箭头按钮（不移除，模板节点由 withTemplate 管理）
            if (prevBtn) prevBtn.hidden = true;
            if (nextBtn) nextBtn.hidden = true;
        });
    },

    // ─── 按步长滚动 ───

    /**
     * 按步长滚动
     */
    scrollOverflowByStep(which: 'prev' | 'next'): void {
        const contentArea = this.nodeMap?.['toolbar']?.['contentArea']?.el as HTMLElement | null;
        const direction = this.getOverflowScroll('direction') as OverflowDirection;
        const scrollStep = this.getOverflowScroll('scrollStep') as number;

        if (!contentArea) return;

        const delta = which === 'prev' ? -scrollStep : scrollStep;

        contentArea.scrollBy({
            [direction === 'horizontal' ? 'left' : 'top']: delta,
            behavior: 'smooth',
        });
    },

    // ─── 更新溢出状态 ───

    /**
     * 更新溢出状态（箭头显隐 + 发布事件）
     */
    updateOverflowState(
        scrollArea: HTMLElement,
        direction: OverflowDirection,
        prevBtn?: HTMLElement | null,
        nextBtn?: HTMLElement | null,
    ): void {
        const scrollPos = direction === 'horizontal' ? scrollArea.scrollLeft : scrollArea.scrollTop;
        const scrollSize = direction === 'horizontal' ? scrollArea.scrollWidth : scrollArea.scrollHeight;
        const clientSize = direction === 'horizontal' ? scrollArea.clientWidth : scrollArea.clientHeight;
        const maxScroll = scrollSize - clientSize;

        const canScrollPrev = scrollPos > 1;
        const canScrollNext = scrollPos < maxScroll - 1;

        // 更新箭头显隐
        if (prevBtn) prevBtn.hidden = !canScrollPrev;
        if (nextBtn) nextBtn.hidden = !canScrollNext;

        // 更新容器 CSS 状态类
        const container = this.el;
        container.classList.toggle('q-overflow-scroll--can-prev', canScrollPrev);
        container.classList.toggle('q-overflow-scroll--can-next', canScrollNext);
        container.classList.toggle('q-overflow-scroll--overflowing', maxScroll > 0);

        // 发布溢出状态事件
        this.emit('overflowstate', {
            canScrollPrev,
            canScrollNext,
            scrollPos,
            maxScroll,
        } as OverflowState, { source: this.eventKey });
    },

    // ─── 滚动到指定位置 ───

    /**
     * 滚动到指定位置
     */
    scrollOverflowTo(position: number, smooth: boolean = true): void {
        const contentArea = this.nodeMap?.['toolbar']?.['contentArea']?.el as HTMLElement | null;
        const direction = this.getOverflowScroll('direction') as OverflowDirection;

        if (!contentArea) return;

        contentArea.scrollTo({
            [direction === 'horizontal' ? 'left' : 'top']: position,
            behavior: smooth ? 'smooth' : 'instant',
        });
    },

    // ─── 滚动到指定子元素 ───

    /**
     * 滚动到指定子元素使其可见
     */
    scrollOverflowToChild(child: HTMLElement, smooth: boolean = true): void {
        const contentArea = this.nodeMap?.['toolbar']?.['contentArea']?.el as HTMLElement | null;
        const direction = this.getOverflowScroll('direction') as OverflowDirection;

        if (!contentArea || !child) return;

        const areaRect = contentArea.getBoundingClientRect();
        const childRect = child.getBoundingClientRect();

        if (direction === 'horizontal') {
            if (childRect.left < areaRect.left) {
                contentArea.scrollBy({
                    left: childRect.left - areaRect.left,
                    behavior: smooth ? 'smooth' : 'instant',
                });
            } else if (childRect.right > areaRect.right) {
                contentArea.scrollBy({
                    left: childRect.right - areaRect.right,
                    behavior: smooth ? 'smooth' : 'instant',
                });
            }
        } else {
            if (childRect.top < areaRect.top) {
                contentArea.scrollBy({
                    top: childRect.top - areaRect.top,
                    behavior: smooth ? 'smooth' : 'instant',
                });
            } else if (childRect.bottom > areaRect.bottom) {
                contentArea.scrollBy({
                    top: childRect.bottom - areaRect.bottom,
                    behavior: smooth ? 'smooth' : 'instant',
                });
            }
        }
    },

    // ─── 获取当前溢出状态 ───

    /**
     * 获取当前溢出状态
     */
    getOverflowState(): OverflowState {
        const contentArea = this.nodeMap?.['toolbar']?.['contentArea']?.el as HTMLElement | null;
        const direction = this.getOverflowScroll('direction') as OverflowDirection;

        if (!contentArea) {
            return { canScrollPrev: false, canScrollNext: false };
        }

        const scrollPos = direction === 'horizontal' ? contentArea.scrollLeft : contentArea.scrollTop;
        const scrollSize = direction === 'horizontal' ? contentArea.scrollWidth : contentArea.scrollHeight;
        const clientSize = direction === 'horizontal' ? contentArea.clientWidth : contentArea.clientHeight;
        const maxScroll = scrollSize - clientSize;

        return {
            canScrollPrev: scrollPos > 1,
            canScrollNext: scrollPos < maxScroll - 1,
        };
    },
};
