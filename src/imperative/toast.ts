/**
 * Toast — toast 实例
 *
 * 独立的能力实例（ComposableBase.with 派生类），
 * 内聚了 el 管理、节点缓存、事件绑定、动画、销毁等全部功能。
 *
 * 通过 ComposableBase.with() 组合能力：
 * - TemplateCacheAbility：模板缓存 + 克隆 + nodeMap
 * - FloatingLayerAbility：OverlayRoot 挂载 + z-index + 动画 + 视口定位 + bindDomEvent
 * - EventAbility：事件作用域（emit 桥接事件）
 */

import { ComposableBase } from '@/composable';
import { TemplateCacheAbility } from '@/component-abilities/render/TemplateCacheAbility';
import { FloatingLayerAbility } from '@/component-abilities/render/FloatingLayerAbility';
import type { ViewportPosition } from '@/component-abilities/render/FloatingLayerAbility';
import { EventAbility } from '@/system-abilities/system/EventAbility';
import { EventSourceRegistrar } from '@qimenjs/events';
import { TOAST_TEMPLATE, TOAST_NOTIFICATION_TEMPLATE } from '@/component-core/template-presets';
import { resolveI18nValue } from '@qimenjs/i18n';
import { ZIndexLevel } from '@qimenjs/component';
import type { ToastOptions, ToastHandle, ToastPosition, ToastType } from './types';

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

export class ToastHandleImpl implements ToastHandle {
    private _closed = false;
    private _resolve: (() => void) | null = null;
    private _promise: Promise<void>;

    constructor(private readonly toast: Toast) {
        this._promise = new Promise<void>((resolve) => {
            this._resolve = resolve;
        });
    }

    close(): void {
        if (this._closed) return;
        this._closed = true;
        this.toast.close();
    }

    then<TResult1 = void, TResult2 = never>(
        onfulfilled?: ((value: void) => TResult1 | PromiseLike<TResult1>) | null,
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
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

const ToastBase = ComposableBase.with([
    TemplateCacheAbility,
    FloatingLayerAbility,
    EventAbility,
]);

export class Toast extends ToastBase {
    /** 根 DOM 元素 */
    el!: HTMLElement;
    /** 节点缓存 */
    nodeMap!: Record<string, HTMLElement>;
    /** z-index 值 */
    zIndex!: number;
    /** 显示位置 */
    position!: ToastPosition;
    /** ToastHandle */
    handle!: ToastHandleImpl;
    /** 自动关闭定时器 */
    timerId: ReturnType<typeof setTimeout> | null = null;
    /** 关闭完成回调（由 Manager 设置） */
    onClose!: () => void;

    constructor(options: ToastOptions) {
        super();

        const type: ToastType = options.type ?? 'info';
        const duration: number = options.duration ?? DEFAULT_DURATION;
        const position: ToastPosition = options.position ?? 'top-right';
        const hasTitle = !!options.title;

        this.position = position;

        // 1. 初始化能力
        this._zIndexLevel = ZIndexLevel.notification;
        this.initTemplateCache('toast', TOAST_TEMPLATE);
        this.initTemplateCache('notification', TOAST_NOTIFICATION_TEMPLATE);

        // 注册 eventKey（在 eventScope 首次创建前设置）
        if (options.eventKey) {
            this.eventKey = options.eventKey;
            EventSourceRegistrar.getInstance().register(options.eventKey, this);
        }

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
                const unbind = this.bindDomEvent(closeBtn, 'tap', () => this.handle.close());
                this.onCleanup(unbind);
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
                if (!this.handle['_closed']) {
                    this.handle['_closed'] = true;
                    this.close();
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

    /**
     * 关闭 toast（播放退出动画后销毁）
     */
    close(): void {
        if (this.timerId !== null) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }

        const animation = this.playExitAnimation(this.el, [
            { opacity: 1, transform: 'translate(0, 0)' },
            { opacity: 0, transform: this.getExitTransform(this.position) },
        ]);

        animation.onfinish = () => {
            this.unmountFromOverlay(this.el);
            this.releaseZIndex();
            this.dispose();
            this.handle._doResolve();
            this.onClose();
        };
    }
}
