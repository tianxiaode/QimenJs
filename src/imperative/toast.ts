/**
 * Toast — toast 实例
 *
 * 独立的能力实例（ComposableBase.with 派生类），
 * 内聚了 el 管理、节点缓存、事件绑定、动画、销毁等全部功能。
 *
 * 通过 ComposableBase.with() 组合能力：
 * - TemplateCacheAbility：模板缓存 + 克隆 + nodeMap
 * - FloatingLayerAbility：OverlayRoot 挂载 + z-index + 动画 + 视口定位 + bindDomEvent
 *
 * 事件通过 OverlayEventBus 发送，编码：overlay:{overlayKey}:{action}
 * 外部可通过 overlayEventBus.overlayOn(overlayKey, action, handler) 监听。
 */

import { ComposableBase } from '@/composable';
import { TemplateCacheAbility } from '@/component-abilities/render/TemplateCacheAbility';
import { FloatingLayerAbility } from '@/overlay/FloatingLayerAbility';
import type { ViewportPosition } from '@/overlay/FloatingLayerAbility';
import { OverlayEventBus } from '@/events/OverlayEventBus';
import { EventContextBuilder } from '@/context';
import { TOAST_ACTIONS, TOAST_FEEDBACK_EVENTS } from './imperative-events';
import { TOAST_TEMPLATE, TOAST_NOTIFICATION_TEMPLATE } from '@/component-core/template-presets';
import { resolveI18nValue } from '@qimenjs/i18n';
import { ZIndexLevel } from '@qimenjs/component';
import type { TplNode } from '@/component-core/types/tpl-node-types';
import type { ToastOptions, ToastHandle, ToastPosition, ToastType } from './types';

const DEFAULT_DURATION = 3000;

const TYPE_ICON_MAP: Record<ToastType, string> = {
    info: 'ℹ',
    success: '✓',
    warning: '⚠',
    error: '✕',
};

// ─── ToastHandleImpl ────────────────────────────────────────

export class ToastHandleImpl implements ToastHandle {
    private _closed = false;
    private _resolve: (() => void) | null = null;
    private _promise: Promise<void>;

    constructor(private readonly toast: Toast) {
        this._promise = new Promise<void>(resolve => {
            this._resolve = resolve;
        });
    }

    get isClosed(): boolean {
        return this._closed;
    }

    close(): void {
        if (this._closed) return;
        this._closed = true;
        this.toast.close();
    }

    then<TResult1 = void, TResult2 = never>(
        onfulfilled?: ((value: void) => TResult1 | PromiseLike<TResult1>) | null,
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
    ): Promise<TResult1 | TResult2> {
        return this._promise.then(onfulfilled, onrejected);
    }

    _doResolve(): void {
        if (this._resolve) {
            this._resolve();
            this._resolve = null;
        }
    }
}

// ─── Toast ──────────────────────────────────────────────────

const ToastBase = ComposableBase.use([TemplateCacheAbility, FloatingLayerAbility]);

export class Toast extends ToastBase {
    // ─── TemplateCacheAbility 方法 ───
    declare initTemplateCache: (name: string, template: TplNode) => void;
    declare cloneFromCache: (name: string) => {
        root: HTMLElement;
        nodeMap: Record<string, HTMLElement>;
    };

    // ─── FloatingLayerAbility 方法 ───
    declare _zIndexLevel: number;
    declare acquireZIndex: (level?: number) => number;
    declare releaseZIndex: () => void;
    declare mountToOverlay: (el: HTMLElement) => void;
    declare unmountFromOverlay: (el: HTMLElement) => void;
    declare setViewportPosition: (
        el: HTMLElement,
        position: any,
        offset?: number,
        margin?: number
    ) => void;
    declare playEnterAnimation: (
        el: HTMLElement,
        keyframes: Keyframe[],
        options?: any
    ) => Animation;
    declare playExitAnimation: (el: HTMLElement, keyframes: Keyframe[], options?: any) => Animation;
    declare bindDomEvent: (
        el: HTMLElement,
        semantic: string,
        handler: (e: Event) => void
    ) => () => void;

    el!: HTMLElement;
    nodeMap!: Record<string, HTMLElement>;
    zIndex!: number;
    position!: ToastPosition;
    overlayKey!: string;
    handle!: ToastHandleImpl;
    timerId: ReturnType<typeof setTimeout> | null = null;
    onClose!: () => void;

    private readonly bus = OverlayEventBus.getInstance();

    constructor(options: ToastOptions & { overlayKey: string }) {
        super();

        const type: ToastType = options.type ?? 'info';
        const duration: number = options.duration ?? DEFAULT_DURATION;
        const position: ToastPosition = options.position ?? 'top-right';
        const hasTitle = !!options.title;

        this.position = position;
        this.overlayKey = options.overlayKey;

        // 1. 初始化能力
        this._zIndexLevel = ZIndexLevel.notification;
        this.initTemplateCache('toast', { tpl: TOAST_TEMPLATE });
        this.initTemplateCache('notification', { tpl: TOAST_NOTIFICATION_TEMPLATE });

        // 2. 从缓存克隆 DOM + 构建 nodeMap
        const { root, nodeMap } = this.cloneFromCache(hasTitle ? 'notification' : 'toast');
        this.el = root;
        this.nodeMap = nodeMap;

        // 3. 设置样式类
        this.el.classList.add('q-toast', `q-toast--${type}`);
        if (hasTitle) {
            this.el.classList.add('q-toast--titled');
        }
        this.el.style.pointerEvents = 'auto';

        // 4. 设置内容
        this.setText('toast:message', resolveI18nValue(options.message));
        this.setText('toast:icon', TYPE_ICON_MAP[type] ?? '');
        if (hasTitle) {
            this.setText('toast:text', resolveI18nValue(options.title!));
        }

        // 5. z-index
        this.zIndex = this.acquireZIndex();
        this.el.style.zIndex = String(this.zIndex);

        // 6. 初始定位（offset=0，Manager 会重新计算堆叠）
        this.setViewportPosition(this.el, position as ViewportPosition, 0, 16);

        // 7. 挂载到 OverlayRoot
        this.mountToOverlay(this.el);

        // 8. 创建 handle
        this.handle = new ToastHandleImpl(this);

        // 9. 绑定 closeBtn 事件
        if (hasTitle) {
            const closeBtn = this.nodeMap['toast:close'];
            if (closeBtn) {
                this.bindDomEvent(closeBtn, 'tap', () => this.handle.close());
            }
        }

        // 10. 播放进入动画
        this.playEnterAnimation(this.el, [
            { opacity: 0, transform: this.getEnterTransform(position) },
            { opacity: 1, transform: 'translate(0, 0)' },
        ]);

        // 11. 自动关闭定时器
        if (duration > 0) {
            this.timerId = setTimeout(() => {
                if (!this.handle.isClosed) {
                    this.handle.close();
                }
            }, duration);
        }
    }

    private setText(key: string, text: string): void {
        const el = this.nodeMap[key];
        if (el) el.textContent = text;
    }

    private getEnterTransform(position: ToastPosition): string {
        if (position.startsWith('top')) return 'translateY(-100%)';
        if (position.startsWith('bottom')) return 'translateY(100%)';
        return 'translateY(-100%)';
    }

    private getExitTransform(position: ToastPosition): string {
        if (position.startsWith('top')) return 'translateY(-100%)';
        if (position.startsWith('bottom')) return 'translateY(100%)';
        return 'translateY(-100%)';
    }

    close(): void {
        if (this.timerId !== null) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }

        this.bus.overlayEmit(
            EventContextBuilder.create()
                .withEvent(`overlay:${this.overlayKey}:${TOAST_ACTIONS.CLOSE}`)
                .withType(TOAST_ACTIONS.CLOSE)
                .withSource(this.overlayKey)
                .withData({ overlayKey: this.overlayKey })
                .build()
        );

        const animation = this.playExitAnimation(this.el, [
            { opacity: 1, transform: 'translate(0, 0)' },
            { opacity: 0, transform: this.getExitTransform(this.position) },
        ]);

        animation.onfinish = () => {
            this.unmountFromOverlay(this.el);
            this.releaseZIndex();

            this.bus.overlayEmit(
                EventContextBuilder.create()
                    .withEvent(`overlay:${this.overlayKey}:${TOAST_FEEDBACK_EVENTS.CLOSED}`)
                    .withType(TOAST_FEEDBACK_EVENTS.CLOSED)
                    .withSource(this.overlayKey)
                    .withData({ overlayKey: this.overlayKey })
                    .build()
            );

            this.dispose();
            this.handle._doResolve();
            this.onClose();
        };
    }
}
