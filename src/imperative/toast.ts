/**
 * Toast — toast 实例
 *
 * 独立的能力实例（ComposableBase.with 派生类），
 * 内聚了 el 管理、节点缓存、事件绑定、动画、销毁等全部功能。
 *
 * 通过 ComposableBase.with() 组合能力：
 * - TemplateCacheAbility：模板缓存 + 克隆 + nodeMap
 * - FloatingLayerAbility：OverlayRoot 挂载 + z-index + 动画 + 视口定位 + bindDomEvent
 * - SystemEventBusAbility：系统事件收发（仅在 eventKey 存在时发送）
 *
 * 事件通过 SystemEventBus 发送，编码：{eventKey}:{action}
 * 仅当 ToastOptions.eventKey 已定义时才发送，否则跳过。
 *
 * 图标通过 CSS 自定义：
 * - .q-toast__icon--info / --success / --warning / --error 控制各类型图标
 * - 默认用 CSS ::before content 渲染，覆盖 ::before 可替换为字体图标
 * - CSS 变量：--q-toast-icon-info / --q-toast-icon-success / --q-toast-icon-warning / --q-toast-icon-error
 */

import { ComposableBase } from '@/composable';
import { TemplateCacheAbility } from '@/component-abilities';
import { FloatingLayerAbility, type ViewportPosition } from '@/overlay';
import { EventContextBuilder } from '@/context';
import { TOAST_ACTIONS, TOAST_FEEDBACK_EVENTS } from './imperative-events';
import { TOAST_TEMPLATE, TOAST_NOTIFICATION_TEMPLATE } from './toast-tpl';
import { resolveI18nValue } from '@qimenjs/i18n';
import { ZIndexLevel } from '@qimenjs/component';
import type { ToastOptions, ToastHandle, ToastPosition, ToastType } from './types';
import { SystemEventBusAbility } from '@/system-abilities';

const DEFAULT_DURATION = 3000;

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

export class Toast extends ComposableBase {
    el!: HTMLElement;
    nodeMap!: Record<string, HTMLElement>;
    zIndex!: number;
    position!: ToastPosition;
    eventKey?: string;
    handle!: ToastHandleImpl;
    timerId: ReturnType<typeof setTimeout> | null = null;
    onClose!: () => void;

    constructor(options: ToastOptions) {
        super();
        const self = this as any;

        const type: ToastType = options.type ?? 'info';
        const duration: number = options.duration ?? DEFAULT_DURATION;
        const position: ToastPosition = options.position ?? 'top-right';
        const hasTitle = !!options.title;

        self.position = position;
        self.eventKey = options.eventKey;

        // 1. 初始化能力
        self._zIndexLevel = ZIndexLevel.notification;
        self.initTemplateCache('toast', { tpl: TOAST_TEMPLATE });
        self.initTemplateCache('notification', { tpl: TOAST_NOTIFICATION_TEMPLATE });

        // 2. 从缓存克隆 DOM + 构建 nodeMap
        const { root, nodeMap } = self.cloneFromCache(hasTitle ? 'notification' : 'toast');
        self.el = root;
        self.nodeMap = nodeMap;

        // 3. 设置样式类
        self.el.classList.add('q-toast', `q-toast--${type}`);
        if (hasTitle) {
            self.el.classList.add('q-toast--titled');
        }
        self.el.style.pointerEvents = 'auto';

        // 4. 设置内容
        self.setText('toast:message', resolveI18nValue(options.message));
        self.setIconType('toast:icon', type);
        if (hasTitle) {
            self.setText('toast:text', resolveI18nValue(options.title!));
        }

        // 5. z-index
        self.zIndex = self.acquireZIndex();
        self.el.style.zIndex = String(self.zIndex);

        // 6. 初始定位（offset=0，Manager 会重新计算堆叠）
        self.setViewportPosition(self.el, position as ViewportPosition, 0, 16);

        // 7. 挂载到 OverlayRoot
        self.mountToOverlay(self.el);

        // 8. 创建 handle
        self.handle = new ToastHandleImpl(self);

        // 9. 绑定 closeBtn 事件
        if (hasTitle) {
            const closeBtn = self.nodeMap['toast:close'];
            if (closeBtn) {
                self.bindDomEvent(closeBtn, 'tap', () => self.handle.close());
            }
        }

        // 10. 播放进入动画
        self.playEnterAnimation(self.el, [
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
        const el = (this as any).nodeMap[key];
        if (el) el.textContent = text;
    }

    private setIconType(key: string, type: ToastType): void {
        const el = (this as any).nodeMap[key];
        if (!el) return;
        const prefix = el.classList.contains('q-notification__icon')
            ? 'q-notification__icon'
            : 'q-toast__icon';
        el.classList.add(`${prefix}--${type}`);
    }

    private _emitEvent(action: string, data: Record<string, any>): void {
        if (!this.eventKey) return;
        const self = this as any;
        const event = `${this.eventKey}:${action}`;
        self.systemEmit(
            event,
            EventContextBuilder.create()
                .withEvent(event)
                .withType(action)
                .withSource(this.eventKey)
                .withData(data)
                .build()
        );
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
        const self = this as any;

        if (this.timerId !== null) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }

        this._emitEvent(TOAST_ACTIONS.CLOSE, { eventKey: this.eventKey });

        const animation = self.playExitAnimation(self.el, [
            { opacity: 1, transform: 'translate(0, 0)' },
            { opacity: 0, transform: this.getExitTransform(self.position) },
        ]);

        animation.onfinish = () => {
            self.unmountFromOverlay(self.el);
            self.releaseZIndex();

            this._emitEvent(TOAST_FEEDBACK_EVENTS.CLOSED, { eventKey: this.eventKey });

            self.dispose();
            self.handle._doResolve();
            self.onClose();
        };
    }
}

Toast.use([TemplateCacheAbility, FloatingLayerAbility, SystemEventBusAbility]);
export type ToastInstance = InstanceType<typeof Toast>;
