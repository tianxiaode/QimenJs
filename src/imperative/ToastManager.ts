/**
 * ToastManager — toast 实例管理器
 *
 * 单例模式，管理 toast DOM 创建、模板选择、堆叠队列、定时器、动画、销毁。
 */

import { HtmlTemplateRegistrar } from '@qimenjs/registry';
import { resolveI18nValue } from '@qimenjs/i18n';
import { OverlayRoot } from '@qimenjs/component';
import { ZIndexLevel, nextZIndex, releaseZIndex } from '@qimenjs/component';
import type { ToastOptions, ToastHandle, ToastPosition, ToastType } from './types';

/** 同时显示的 toast 最大数量 */
const MAX_COUNT = 5;

/** toast 间距 px */
const GAP = 16;

/** 距视口边缘间距 px */
const MARGIN = 16;

/** 进入动画时长 ms */
const ENTER_DURATION = 200;

/** 退出动画时长 ms */
const EXIT_DURATION = 150;

/** 默认持续时间 ms */
const DEFAULT_DURATION = 3000;

/** 类型图标映射 */
const TYPE_ICON_MAP: Record<ToastType, string> = {
    info: 'ℹ',
    success: '✓',
    warning: '⚠',
    error: '✕',
};

// ─── ToastHandleImpl ────────────────────────────────────────

class ToastHandleImpl implements ToastHandle {
    private _closed = false;
    private _resolve: (() => void) | null = null;
    private _promise: Promise<void>;

    constructor(
        private readonly manager: ToastManager,
        private readonly id: number,
    ) {
        this._promise = new Promise<void>((resolve) => {
            this._resolve = resolve;
        });
    }

    close(): void {
        if (this._closed) return;
        this._closed = true;
        this.manager.close(this.id);
    }

    then<TResult1 = void, TResult2 = never>(
        onfulfilled?: ((value: void) => TResult1 | PromiseLike<TResult1>) | null,
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
    ): Promise<TResult1 | TResult2> {
        return this._promise.then(onfulfilled, onrejected);
    }

    /** 内部方法：toast 关闭时调用 */
    _doResolve(): void {
        if (this._resolve) {
            this._resolve();
            this._resolve = null;
        }
    }
}

// ─── ToastInstance ──────────────────────────────────────────

interface ToastInstance {
    id: number;
    overlayEl: HTMLElement;
    zIndex: number;
    handle: ToastHandleImpl;
    timerId: ReturnType<typeof setTimeout> | null;
    position: ToastPosition;
}

// ─── ToastManager ───────────────────────────────────────────

export class ToastManager {
    private static instance: ToastManager;

    private instances = new Map<number, ToastInstance>();
    private nextId = 0;

    private constructor() {}

    static getInstance(): ToastManager {
        if (!ToastManager.instance) {
            ToastManager.instance = new ToastManager();
        }
        return ToastManager.instance;
    }

    /**
     * 创建 toast 实例
     */
    create(options: ToastOptions): ToastHandle {
        const type: ToastType = options.type ?? 'info';
        const duration: number = options.duration ?? DEFAULT_DURATION;
        const position: ToastPosition = options.position ?? 'top-right';
        const hasTitle = !!options.title;

        // 1. 选择模板
        const templateId = hasTitle ? 'ToastNotification' : 'Toast';
        const template = HtmlTemplateRegistrar.getInstance().get(templateId);

        // 2. 创建 toast DOM 容器
        const overlayEl = document.createElement('div');
        overlayEl.innerHTML = template;
        overlayEl.classList.add('q-toast', `q-toast--${type}`);
        if (hasTitle) {
            overlayEl.classList.add('q-toast--titled');
        }
        overlayEl.style.position = 'fixed';
        overlayEl.style.pointerEvents = 'auto';

        // 3. 设置内容（支持 i18n: 前缀）
        const messageEl = overlayEl.querySelector('[data-ref="message"]') as HTMLElement | null;
        if (messageEl) {
            messageEl.textContent = resolveI18nValue(options.message);
        }

        const iconEl = overlayEl.querySelector('[data-ref="icon"]') as HTMLElement | null;
        if (iconEl) {
            iconEl.textContent = TYPE_ICON_MAP[type] ?? '';
        }

        if (hasTitle) {
            const titleEl = overlayEl.querySelector('[data-ref="title"]') as HTMLElement | null;
            if (titleEl) {
                titleEl.textContent = resolveI18nValue(options.title!);
            }
        }

        // 4. z-index
        const zIndex = nextZIndex(ZIndexLevel.notification);
        overlayEl.style.zIndex = String(zIndex);

        // 5. 计算堆叠位置
        const id = this.nextId++;
        this.setPosition(overlayEl, position, 0);

        // 6. 挂载到 OverlayRoot
        OverlayRoot.getInstance().getRoot().appendChild(overlayEl);

        // 7. 创建 handle
        const handle = new ToastHandleImpl(this, id);

        // 8. 绑定 closeBtn 事件（ToastNotification 模板）
        if (hasTitle) {
            const closeBtn = overlayEl.querySelector('[data-ref="closeBtn"]') as HTMLElement | null;
            if (closeBtn) {
                closeBtn.addEventListener('click', () => handle.close());
            }
        }

        // 9. 播放进入动画
        overlayEl.animate(
            [
                { opacity: 0, transform: this.getEnterTransform(position) },
                { opacity: 1, transform: 'translate(0, 0)' },
            ],
            { duration: ENTER_DURATION, easing: 'ease-out' },
        );

        // 10. 加入队列
        const instance: ToastInstance = {
            id,
            overlayEl,
            zIndex,
            handle,
            timerId: null,
            position,
        };

        if (duration > 0) {
            instance.timerId = setTimeout(() => {
                if (!handle['_closed']) {
                    handle['_closed'] = true;
                    this.close(id);
                }
            }, duration);
        }

        this.instances.set(id, instance);

        // 11. 超过上限时关闭最早的
        this.enforceMaxCount(position);

        // 12. 重新计算所有同位置 toast 的堆叠位置
        this.repositionAll(position);

        return handle;
    }

    /**
     * 关闭指定 toast
     */
    close(id: number): void {
        const instance = this.instances.get(id);
        if (!instance) return;

        // 清除定时器
        if (instance.timerId !== null) {
            clearTimeout(instance.timerId);
            instance.timerId = null;
        }

        const { overlayEl, zIndex, handle, position } = instance;

        // 播放退出动画
        const animation = overlayEl.animate(
            [
                { opacity: 1, transform: 'translate(0, 0)' },
                { opacity: 0, transform: this.getExitTransform(position) },
            ],
            { duration: EXIT_DURATION, easing: 'ease-in' },
        );

        animation.onfinish = () => {
            // 从 OverlayRoot 移除
            if (overlayEl.parentNode) {
                overlayEl.parentNode.removeChild(overlayEl);
            }

            // 释放 z-index
            releaseZIndex(ZIndexLevel.notification);

            // 从队列中移除
            this.instances.delete(id);

            // 重新计算剩余 toast 位置
            this.repositionAll(position);

            // resolve Promise
            handle._doResolve();
        };
    }

    /**
     * 重新计算指定位置所有活跃 toast 的堆叠位置
     */
    private repositionAll(position: ToastPosition): void {
        const samePositionInstances = this.getInstancesByPosition(position);
        let offset = 0;

        for (const inst of samePositionInstances) {
            this.setPosition(inst.overlayEl, position, offset);
            offset += inst.overlayEl.offsetHeight + GAP;
        }
    }

    /**
     * 获取指定位置的所有实例（按创建顺序）
     */
    private getInstancesByPosition(position: ToastPosition): ToastInstance[] {
        const result: ToastInstance[] = [];
        for (const inst of this.instances.values()) {
            if (inst.position === position) {
                result.push(inst);
            }
        }
        return result;
    }

    /**
     * 设置单个 toast 的固定定位
     */
    private setPosition(el: HTMLElement, position: ToastPosition, offset: number): void {
        // 重置所有定位属性
        el.style.top = '';
        el.style.bottom = '';
        el.style.left = '';
        el.style.right = '';
        el.style.transform = '';

        const isTop = position.startsWith('top');
        const isBottom = position.startsWith('bottom');
        const isLeft = position.endsWith('left');
        const isRight = position.endsWith('right');
        const isCenter = position === 'top' || position === 'bottom';

        if (isTop) {
            el.style.top = `${MARGIN + offset}px`;
        } else if (isBottom) {
            el.style.bottom = `${MARGIN + offset}px`;
        }

        if (isLeft) {
            el.style.left = `${MARGIN}px`;
        } else if (isRight) {
            el.style.right = `${MARGIN}px`;
        } else if (isCenter) {
            el.style.left = '50%';
            el.style.transform = 'translateX(-50%)';
        }
    }

    /**
     * 获取进入动画的初始 transform
     */
    private getEnterTransform(position: ToastPosition): string {
        if (position.startsWith('top')) return 'translateY(-100%)';
        if (position.startsWith('bottom')) return 'translateY(100%)';
        return 'translateY(-100%)';
    }

    /**
     * 获取退出动画的最终 transform
     */
    private getExitTransform(position: ToastPosition): string {
        if (position.startsWith('top')) return 'translateY(-100%)';
        if (position.startsWith('bottom')) return 'translateY(100%)';
        return 'translateY(-100%)';
    }

    /**
     * 超过上限时关闭最早的同位置 toast
     */
    private enforceMaxCount(position: ToastPosition): void {
        const samePositionInstances = this.getInstancesByPosition(position);
        if (samePositionInstances.length <= MAX_COUNT) return;

        // 关闭最早的
        const oldest = samePositionInstances[0];
        if (!oldest.handle['_closed']) {
            oldest.handle['_closed'] = true;
            this.close(oldest.id);
        }
    }
}
