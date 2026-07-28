/**
 * OverflowScrollComponent 溢出滚动浮层组件
 *
 * 由 OverlayDispatchCenter 创建和管理生命周期。
 * 检测宿主容器溢出状态，在容器边缘浮动显示箭头按钮。
 * 内置 prevIcon / nextIcon 两个箭头（DOM 节点），模板声明 + handler 自动转发。
 *
 * 职责：
 * - 监听宿主容器 scroll/resize/mutation，检测溢出状态
 * - 内置箭头，挂载到 OverlayRoot，positionOverlay 定位
 * - 点击箭头 → scrollBy 宿主容器
 * - 拖拽滑动滚动（bind drag 手势）
 * - 便捷方法：scrollByStep / scrollTo / scrollToChild / autoGrowScroll
 * - 钩子：onOverflowChange / onScrollStateChange
 */

import { Component } from '@qimenjs/component-core';
import { OverlayRoot } from '@/overlay/OverlayRoot';
import { positionOverlay, type Placement } from '@/overlay/dispatch';
import { ZIndexLevel, nextZIndex } from '@/component/z-index';
import { DOM_EVENT_PREFIX } from '@qimenjs/event-dom';

export type OverflowDirection = 'horizontal' | 'vertical';

export interface OverflowState {
    canScrollPrev: boolean;
    canScrollNext: boolean;
    scrollPos: number;
    maxScroll: number;
}

export interface OverflowScrollProps {
    anchor?: HTMLElement;
    direction?: OverflowDirection;
    scrollStep?: number;
}

class OverflowScrollComponent extends Component {
    static type = 'OverflowScroll';

    type = 'OverflowScroll';

    onInitState() {
        return {
            _anchor: null as HTMLElement | null,
            _direction: 'horizontal' as OverflowDirection,
            _scrollStep: 200,
            _scrollArea: null as HTMLElement | null,
            _resizeObserver: null as ResizeObserver | null,
            _mutationObserver: null as MutationObserver | null,
            _rafId: 0,
            _dragStartScrollPos: 0,
            _lastState: null as OverflowState | null,
            _onOverflowChange: null as ((state: OverflowState) => void) | null,
            _onScrollStateChange: null as ((state: OverflowState) => void) | null,
        };
    }

    _initOverflowScroll(props?: OverflowScrollProps): void {
        const anchor = props?.anchor;
        if (!anchor) return;

        this._anchor = anchor;
        this._direction = props?.direction ?? 'horizontal';
        this._scrollStep = props?.scrollStep ?? 200;

        this.el.classList.add(`q-overflow-scroll-overlay--${this._direction}`);

        this._scrollArea = anchor;
        this._mountIconsToOverlay();
        this._bindEvents();
        this._updateState();

        this.onCleanup(() => {
            this._destroy();
        });
    }

    onPrevIconClick(): void {
        this.scrollByStep('prev');
    }

    onNextIconClick(): void {
        this.scrollByStep('next');
    }

    set onOverflowChange(fn: (state: OverflowState) => void) {
        this._onOverflowChange = fn;
    }

    set onScrollStateChange(fn: (state: OverflowState) => void) {
        this._onScrollStateChange = fn;
    }

    scrollByStep(which: 'prev' | 'next'): void {
        if (!this._scrollArea) return;

        const delta = which === 'prev' ? -this._scrollStep : this._scrollStep;
        this._scrollArea.scrollBy({
            [this._direction === 'horizontal' ? 'left' : 'top']: delta,
            behavior: 'smooth',
        });
    }

    scrollTo(position: number, smooth: boolean = true): void {
        if (!this._scrollArea) return;

        this._scrollArea.scrollTo({
            [this._direction === 'horizontal' ? 'left' : 'top']: position,
            behavior: smooth ? 'smooth' : 'instant',
        });
    }

    scrollToChild(child: HTMLElement, smooth: boolean = true): void {
        if (!this._scrollArea || !child) return;

        const areaRect = this._scrollArea.getBoundingClientRect();
        const childRect = child.getBoundingClientRect();

        if (this._direction === 'horizontal') {
            if (childRect.left < areaRect.left) {
                this._scrollArea.scrollBy({
                    left: childRect.left - areaRect.left,
                    behavior: smooth ? 'smooth' : 'instant',
                });
            } else if (childRect.right > areaRect.right) {
                this._scrollArea.scrollBy({
                    left: childRect.right - areaRect.right,
                    behavior: smooth ? 'smooth' : 'instant',
                });
            }
        } else {
            if (childRect.top < areaRect.top) {
                this._scrollArea.scrollBy({
                    top: childRect.top - areaRect.top,
                    behavior: smooth ? 'smooth' : 'instant',
                });
            } else if (childRect.bottom > areaRect.bottom) {
                this._scrollArea.scrollBy({
                    top: childRect.bottom - areaRect.bottom,
                    behavior: smooth ? 'smooth' : 'instant',
                });
            }
        }
    }

    autoGrowScroll(maxHeight?: number): void {
        if (!this._scrollArea) return;

        const prop = this._direction === 'horizontal' ? 'scrollWidth' : 'scrollHeight';
        const clientProp = this._direction === 'horizontal' ? 'clientWidth' : 'clientHeight';
        const styleProp = this._direction === 'horizontal' ? 'width' : 'height';

        const contentSize = this._scrollArea[prop];
        const viewSize = this._scrollArea[clientProp];

        if (contentSize > viewSize) {
            const growTo = maxHeight ? Math.min(contentSize, maxHeight) : contentSize;
            this._scrollArea.style[styleProp] = `${growTo}px`;
        }
    }

    getOverflowState(): OverflowState {
        if (!this._scrollArea) {
            return { canScrollPrev: false, canScrollNext: false, scrollPos: 0, maxScroll: 0 };
        }

        const scrollPos =
            this._direction === 'horizontal'
                ? this._scrollArea.scrollLeft
                : this._scrollArea.scrollTop;
        const scrollSize =
            this._direction === 'horizontal'
                ? this._scrollArea.scrollWidth
                : this._scrollArea.scrollHeight;
        const clientSize =
            this._direction === 'horizontal'
                ? this._scrollArea.clientWidth
                : this._scrollArea.clientHeight;
        const maxScroll = scrollSize - clientSize;

        return {
            canScrollPrev: scrollPos > 1,
            canScrollNext: scrollPos < maxScroll - 1,
            scrollPos,
            maxScroll,
        };
    }

    _mountIconsToOverlay(): void {
        const root = OverlayRoot.getInstance().getRoot();
        if (!root) return;

        const prevEl = this.nodeMap?.prevIcon?.el;
        const nextEl = this.nodeMap?.nextIcon?.el;

        if (prevEl) {
            prevEl.style.position = 'absolute';
            prevEl.style.zIndex = String(nextZIndex(ZIndexLevel.dropdown));
            prevEl.style.pointerEvents = 'auto';
            prevEl.classList.add(`q-overflow-arrow--${this._direction}`);
            root.appendChild(prevEl);
        }

        if (nextEl) {
            nextEl.style.position = 'absolute';
            nextEl.style.zIndex = String(nextZIndex(ZIndexLevel.dropdown));
            nextEl.style.pointerEvents = 'auto';
            nextEl.classList.add(`q-overflow-arrow--${this._direction}`);
            root.appendChild(nextEl);
        }
    }

    _bindEvents(): void {
        if (!this._scrollArea) return;

        this.bind(this._scrollArea, 'scroll');
        this.on(`${DOM_EVENT_PREFIX}scroll`, () => this._scheduleUpdate());

        this._resizeObserver = new ResizeObserver(() => this._scheduleUpdate());
        this._resizeObserver.observe(this._scrollArea);

        this._mutationObserver = new MutationObserver(() => this._scheduleUpdate());
        this._mutationObserver.observe(this._scrollArea, { childList: true });

        this._bindDragScroll();
    }

    _bindDragScroll(): void {
        if (!this._scrollArea || typeof this.bind !== 'function') return;

        this.bind(this._scrollArea, 'drag');

        this.on('drag', (gesture: any) => {
            const phase = gesture?.phase;
            if (!phase) return;

            if (phase === 'start') {
                this._dragStartScrollPos =
                    this._direction === 'horizontal'
                        ? this._scrollArea!.scrollLeft
                        : this._scrollArea!.scrollTop;

                this._scrollArea!.style.cursor = 'grabbing';
                this._scrollArea!.style.userSelect = 'none';
            } else if (phase === 'move') {
                const dx = gesture.dx ?? 0;
                const dy = gesture.dy ?? 0;
                const delta = this._direction === 'horizontal' ? -dx : -dy;

                if (this._direction === 'horizontal') {
                    this._scrollArea!.scrollLeft = this._dragStartScrollPos + delta;
                } else {
                    this._scrollArea!.scrollTop = this._dragStartScrollPos + delta;
                }

                this._updateState();
            } else if (phase === 'end' || phase === 'cancel') {
                this._scrollArea!.style.cursor = '';
                this._scrollArea!.style.userSelect = '';
            }
        });
    }

    _scheduleUpdate(): void {
        if (this._rafId) cancelAnimationFrame(this._rafId);
        this._rafId = requestAnimationFrame(() => {
            this._updateState();
            this._rafId = 0;
        });
    }

    _updateState(): void {
        if (!this._scrollArea || !this._anchor) return;

        const state = this.getOverflowState();

        const prevEl = this.nodeMap?.prevIcon?.el;
        if (prevEl) {
            prevEl.hidden = !state.canScrollPrev;
            if (state.canScrollPrev) {
                const placement: Placement = this._direction === 'horizontal' ? 'left' : 'top';
                positionOverlay(prevEl, this._anchor, placement, 0, false);
            }
        }

        const nextEl = this.nodeMap?.nextIcon?.el;
        if (nextEl) {
            nextEl.hidden = !state.canScrollNext;
            if (state.canScrollNext) {
                const placement: Placement = this._direction === 'horizontal' ? 'right' : 'bottom';
                positionOverlay(nextEl, this._anchor, placement, 0, false);
            }
        }

        this._anchor.classList.toggle('q-overflow-scroll--can-prev', state.canScrollPrev);
        this._anchor.classList.toggle('q-overflow-scroll--can-next', state.canScrollNext);
        this._anchor.classList.toggle('q-overflow-scroll--overflowing', state.maxScroll > 0);

        const wasOverflowing = this._lastState ? this._lastState.maxScroll > 0 : false;
        const isOverflowing = state.maxScroll > 0;
        const stateChanged =
            !this._lastState ||
            this._lastState.canScrollPrev !== state.canScrollPrev ||
            this._lastState.canScrollNext !== state.canScrollNext ||
            this._lastState.scrollPos !== state.scrollPos;

        if (wasOverflowing !== isOverflowing && this._onOverflowChange) {
            this._onOverflowChange(state);
        }

        if (stateChanged && this._onScrollStateChange) {
            this._onScrollStateChange(state);
        }

        this._lastState = state;
    }

    _destroy(): void {
        if (this._rafId) cancelAnimationFrame(this._rafId);

        this._resizeObserver?.disconnect();
        this._mutationObserver?.disconnect();

        const prevEl = this.nodeMap?.prevIcon?.el;
        const nextEl = this.nodeMap?.nextIcon?.el;
        prevEl?.remove();
        nextEl?.remove();

        if (this._anchor) {
            this._anchor.classList.remove(
                'q-overflow-scroll--can-prev',
                'q-overflow-scroll--can-next',
                'q-overflow-scroll--overflowing'
            );
        }
    }

    onOverlayChange(data: any): void {
        if (!data) return;
        if (data.direction !== undefined) this._direction = data.direction;
        if (data.scrollStep !== undefined) this._scrollStep = data.scrollStep;
        this._updateState();
    }
}

export { OverflowScrollComponent };
export type OverflowScrollComponentInstance = InstanceType<typeof OverflowScrollComponent>;
