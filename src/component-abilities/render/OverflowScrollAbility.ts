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
 * 事件模式：
 * - 使用 this.bind(el, 'drag') 绑定拖拽手势实现滑动滚动
 * - 使用 this.emit 发布 overflowscroll/overflowstate 事件
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
    /** 箭头按钮的 CSS 类名前缀，默认 'q-overflow-arrow' */
    arrowClassPrefix?: string;
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
     * @param config - 配置项
     */
    initOverflowScroll(config: OverflowScrollConfig = {}): void {
        const direction: OverflowDirection = config.direction ?? 'horizontal';
        const scrollStep: number = config.scrollStep ?? 200;
        const arrowClassPrefix: string = config.arrowClassPrefix ?? 'q-overflow-arrow';

        this.setOverflowScroll('direction', direction);
        this.setOverflowScroll('scrollStep', scrollStep);
        this.setOverflowScroll('arrowClassPrefix', arrowClassPrefix);

        const container = this.el;

        // ── 1. 设置容器样式 ──

        container.classList.add('q-overflow-scroll');
        container.classList.add(`q-overflow-scroll--${direction}`);

        // ── 2. 创建内部滚动区域 ──

        // 将现有子元素包裹到滚动区域中
        const scrollArea = document.createElement('div');
        scrollArea.className = 'q-overflow-scroll__area';

        // 移动所有子节点到滚动区域
        while (container.firstChild) {
            scrollArea.appendChild(container.firstChild);
        }
        container.appendChild(scrollArea);

        this.setOverflowScroll('scrollArea', scrollArea);

        // ── 3. 创建箭头按钮 ──

        const prevBtn = this.createArrowButton('prev', direction, arrowClassPrefix);
        const nextBtn = this.createArrowButton('next', direction, arrowClassPrefix);

        container.insertBefore(prevBtn, scrollArea);
        container.appendChild(nextBtn);

        this.setOverflowScroll('prevBtn', prevBtn);
        this.setOverflowScroll('nextBtn', nextBtn);

        // ── 4. 箭头点击滚动 ──

        prevBtn.addEventListener('click', () => this.scrollOverflowByStep('prev'));
        nextBtn.addEventListener('click', () => this.scrollOverflowByStep('next'));

        // ── 5. 拖拽滑动滚动 ──

        this.bind(scrollArea, 'drag');

        let dragStartScrollPos = 0;

        this.on('drag', (gesture: any) => {
            const phase = gesture?.phase;

            if (phase === 'start') {
                dragStartScrollPos = direction === 'horizontal'
                    ? scrollArea.scrollLeft
                    : scrollArea.scrollTop;

                scrollArea.style.cursor = 'grabbing';
                scrollArea.style.userSelect = 'none';
            } else if (phase === 'move') {
                const dx = gesture.dx ?? 0;
                const dy = gesture.dy ?? 0;
                const delta = direction === 'horizontal' ? -dx : -dy;

                if (direction === 'horizontal') {
                    scrollArea.scrollLeft = dragStartScrollPos + delta;
                } else {
                    scrollArea.scrollTop = dragStartScrollPos + delta;
                }

                this.updateOverflowState(scrollArea, direction, prevBtn, nextBtn);
            } else if (phase === 'end' || phase === 'cancel') {
                scrollArea.style.cursor = '';
                scrollArea.style.userSelect = '';
            }
        });

        // ── 6. 滚动事件监听（更新箭头显隐） ──

        scrollArea.addEventListener('scroll', () => {
            this.updateOverflowState(scrollArea, direction, prevBtn, nextBtn);
        });

        // ── 7. ResizeObserver 监听容器尺寸变化 ──

        const resizeObserver = new ResizeObserver(() => {
            this.updateOverflowState(scrollArea, direction, prevBtn, nextBtn);
        });
        resizeObserver.observe(scrollArea);
        this.setOverflowScroll('resizeObserver', resizeObserver);

        // ── 8. MutationObserver 监听子元素变化 ──

        const mutationObserver = new MutationObserver(() => {
            this.updateOverflowState(scrollArea, direction, prevBtn, nextBtn);
        });
        mutationObserver.observe(scrollArea, { childList: true });
        this.setOverflowScroll('mutationObserver', mutationObserver);

        // ── 9. 初始状态检测 ──

        // 延迟一帧确保布局完成
        requestAnimationFrame(() => {
            this.updateOverflowState(scrollArea, direction, prevBtn, nextBtn);
        });

        // ── 10. 清理 ──

        this.onCleanup(() => {
            prevBtn.removeEventListener('click', () => this.scrollOverflowByStep('prev'));
            nextBtn.removeEventListener('click', () => this.scrollOverflowByStep('next'));
            resizeObserver.disconnect();
            mutationObserver.disconnect();

            container.classList.remove('q-overflow-scroll', `q-overflow-scroll--${direction}`);

            // 移除箭头按钮
            prevBtn.remove();
            nextBtn.remove();

            // 将子节点从滚动区域移回容器
            while (scrollArea.firstChild) {
                container.insertBefore(scrollArea.firstChild, scrollArea);
            }
            scrollArea.remove();
        });
    },

    // ─── 创建箭头按钮 ───

    /**
     * 创建箭头按钮元素
     */
    createArrowButton(which: 'prev' | 'next', direction: OverflowDirection, classPrefix: string): HTMLElement {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `${classPrefix} ${classPrefix}--${which} ${classPrefix}--${direction}`;
        btn.setAttribute('aria-label', which === 'prev'
            ? (direction === 'horizontal' ? '向左滚动' : '向上滚动')
            : (direction === 'horizontal' ? '向右滚动' : '向下滚动')
        );

        // 箭头图标用 CSS 绘制，不依赖图标库
        const icon = document.createElement('span');
        icon.className = `${classPrefix}__icon ${classPrefix}__icon--${which} ${classPrefix}__icon--${direction}`;
        btn.appendChild(icon);

        // 默认隐藏，溢出时才显示
        btn.style.display = 'none';

        return btn;
    },

    // ─── 按步长滚动 ───

    /**
     * 按步长滚动
     */
    scrollOverflowByStep(which: 'prev' | 'next'): void {
        const scrollArea = this.getOverflowScroll('scrollArea') as HTMLElement | null;
        const direction = this.getOverflowScroll('direction') as OverflowDirection;
        const scrollStep = this.getOverflowScroll('scrollStep') as number;

        if (!scrollArea) return;

        const delta = which === 'prev' ? -scrollStep : scrollStep;

        scrollArea.scrollBy({
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
        prevBtn: HTMLElement,
        nextBtn: HTMLElement,
    ): void {
        const scrollPos = direction === 'horizontal' ? scrollArea.scrollLeft : scrollArea.scrollTop;
        const scrollSize = direction === 'horizontal' ? scrollArea.scrollWidth : scrollArea.scrollHeight;
        const clientSize = direction === 'horizontal' ? scrollArea.clientWidth : scrollArea.clientHeight;
        const maxScroll = scrollSize - clientSize;

        const canScrollPrev = scrollPos > 1;
        const canScrollNext = scrollPos < maxScroll - 1;

        // 更新箭头显隐
        prevBtn.style.display = canScrollPrev ? '' : 'none';
        nextBtn.style.display = canScrollNext ? '' : 'none';

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
        const scrollArea = this.getOverflowScroll('scrollArea') as HTMLElement | null;
        const direction = this.getOverflowScroll('direction') as OverflowDirection;

        if (!scrollArea) return;

        scrollArea.scrollTo({
            [direction === 'horizontal' ? 'left' : 'top']: position,
            behavior: smooth ? 'smooth' : 'instant',
        });
    },

    // ─── 滚动到指定子元素 ───

    /**
     * 滚动到指定子元素使其可见
     */
    scrollOverflowToChild(child: HTMLElement, smooth: boolean = true): void {
        const scrollArea = this.getOverflowScroll('scrollArea') as HTMLElement | null;
        const direction = this.getOverflowScroll('direction') as OverflowDirection;

        if (!scrollArea || !child) return;

        const areaRect = scrollArea.getBoundingClientRect();
        const childRect = child.getBoundingClientRect();

        if (direction === 'horizontal') {
            if (childRect.left < areaRect.left) {
                scrollArea.scrollBy({
                    left: childRect.left - areaRect.left,
                    behavior: smooth ? 'smooth' : 'instant',
                });
            } else if (childRect.right > areaRect.right) {
                scrollArea.scrollBy({
                    left: childRect.right - areaRect.right,
                    behavior: smooth ? 'smooth' : 'instant',
                });
            }
        } else {
            if (childRect.top < areaRect.top) {
                scrollArea.scrollBy({
                    top: childRect.top - areaRect.top,
                    behavior: smooth ? 'smooth' : 'instant',
                });
            } else if (childRect.bottom > areaRect.bottom) {
                scrollArea.scrollBy({
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
        const scrollArea = this.getOverflowScroll('scrollArea') as HTMLElement | null;
        const direction = this.getOverflowScroll('direction') as OverflowDirection;

        if (!scrollArea) {
            return { canScrollPrev: false, canScrollNext: false };
        }

        const scrollPos = direction === 'horizontal' ? scrollArea.scrollLeft : scrollArea.scrollTop;
        const scrollSize = direction === 'horizontal' ? scrollArea.scrollWidth : scrollArea.scrollHeight;
        const clientSize = direction === 'horizontal' ? scrollArea.clientWidth : scrollArea.clientHeight;
        const maxScroll = scrollSize - clientSize;

        return {
            canScrollPrev: scrollPos > 1,
            canScrollNext: scrollPos < maxScroll - 1,
        };
    },
};
