/**
 * Toast — toast 实例
 *
 * 独立的能力实例（ComposableBase.with 派生类），
 * 内聚了 el 管理、节点缓存、事件绑定、动画、销毁等全部功能。
 *
 * 通过 ComposableBase.use() 组合能力：
 * - FloatingLayerAbility：OverlayRoot 挂载 + z-index + 动画 + 视口定位 + bindDomEvent
 * - SystemEventBusAbility：系统事件收发（仅在 eventKey 存在时发送）
 *
 * 模板通过 ComponentRegistrar 注册，节点通过 NodeMapManager 管理。
 *
 * 事件通过 SystemEventBus 发送，编码：{eventKey}:{action}
 * 仅当 ToastOptions.eventKey 已定义时才发送，否则跳过。
 *
 * 图标通过 CSS 自定义：
 * - .q-toast__icon--info / --success / --warning / --error 控制各类型图标
 * - 默认用 CSS ::before content 渲染，覆盖 ::before 可替换为字体图标
 * - CSS 变量：--q-toast-icon-info / --q-toast-icon-success / --q-toast-icon-warning / --q-toast-icon-error
 */

import { AbilityDefinition, ComposableBase, InferAbilities } from '@/composable';
import { FloatingLayerAbility, type ViewportPosition } from '@/overlay';
import { EventContextBuilder } from '@/context';
import { ComponentRegistrar } from '@/component-core/engine/ComponentRegistrar';
import type { INodeMapManager } from '@/component-core/types/node-map-manager';
import { TOAST_ACTIONS, TOAST_FEEDBACK_EVENTS } from './imperative-events';
import { TOAST_TEMPLATE, TOAST_NOTIFICATION_TEMPLATE } from './toast-tpl';
import { resolveI18nValue } from '@qimenjs/i18n';
import { ZIndexLevel } from '@qimenjs/component';
import type { ToastOptions, ToastHandle, ToastPosition, ToastType } from './types';
import { SystemEventBusAbility } from '@/system-abilities';
import './toast.css';

const DEFAULT_DURATION = 3000;
const TOAST_ABILITIES = [
    FloatingLayerAbility,
    SystemEventBusAbility,
] as const satisfies readonly AbilityDefinition[];

export interface IToast extends InferAbilities<typeof TOAST_ABILITIES> {
    el: HTMLElement;
    nodeMapMgr: INodeMapManager;
    zIndex: number;
    position: ToastPosition;
    eventKey?: string;
    handle: ToastHandleImpl;
    onClose: () => void;
    close(): void;
}

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
    static type = 'Toast';

    el!: HTMLElement;
    nodeMapMgr!: INodeMapManager;
    zIndex!: number;
    position!: ToastPosition;
    eventKey?: string;
    handle!: ToastHandleImpl;
    timerId: ReturnType<typeof setTimeout> | null = null;
    onClose!: () => void;

    constructor(options: ToastOptions) {
        super();

        const type: ToastType = options.type ?? 'info';
        const duration: number = options.duration ?? DEFAULT_DURATION;
        const position: ToastPosition = options.position ?? 'top-right';
        const hasTitle = !!options.title;

        this.position = position;
        this.eventKey = options.eventKey;

        // 1. 初始化能力
        this._zIndexLevel = ZIndexLevel.notification;

        // 2. 通过 ComponentRegistrar 获取 NodeMapManager + 构建 DOM
        const registry = ComponentRegistrar.getInstance();
        const tplType = hasTitle ? 'ToastNotification' : 'Toast';
        this.nodeMapMgr = registry.createNodeMapManager(tplType, this)!;
        this.el = this.nodeMapMgr.buildDOM();

        // 3. 设置样式类
        this.el.classList.add('q-toast', `q-toast--${type}`);
        if (hasTitle) {
            this.el.classList.add('q-toast--titled');
        }
        this.el.style.pointerEvents = 'auto';

        // 4. 设置内容
        const msgEl = this.nodeMapMgr.get('toast:message')?.el;
        if (msgEl) msgEl.textContent = resolveI18nValue(options.message);
        this._applyIconType(this.nodeMapMgr.get('toast:icon')?.el, type);
        if (hasTitle) {
            const titleEl = this.nodeMapMgr.get('toast:text')?.el;
            if (titleEl) titleEl.textContent = resolveI18nValue(options.title!);
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
            const closeBtn = this.nodeMapMgr.get('toast:close')?.el;
            if (closeBtn) {
                this.bindDomEvent(closeBtn, 'tap', () => this.handle.close());
            }
        }

        // 10. 播放进入动画
        this.playEnterAnimation(this.el, [
            { opacity: 0, transform: this._getEnterTransform(position) },
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

    close(): void {
        if (this.timerId !== null) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }

        this._emitToastEvent(TOAST_ACTIONS.CLOSE, { eventKey: this.eventKey });

        const animation = this.playExitAnimation(this.el, [
            { opacity: 1, transform: 'translate(0, 0)' },
            { opacity: 0, transform: this._getExitTransform(this.position) },
        ]);

        animation.onfinish = () => {
            this.unmountFromOverlay(this.el);
            this.releaseZIndex();

            this._emitToastEvent(TOAST_FEEDBACK_EVENTS.CLOSED, { eventKey: this.eventKey });

            this.nodeMapMgr.disposeAll();
            this.dispose();
            this.handle._doResolve();
            this.onClose();
        };
    }

    _getEnterTransform(position: ToastPosition): string {
        if (position.startsWith('top')) return 'translateY(-100%)';
        if (position.startsWith('bottom')) return 'translateY(100%)';
        return 'translateY(-100%)';
    }

    _getExitTransform(position: ToastPosition): string {
        if (position.startsWith('top')) return 'translateY(-100%)';
        if (position.startsWith('bottom')) return 'translateY(100%)';
        return 'translateY(-100%)';
    }

    _applyIconType(el: HTMLElement | undefined, type: ToastType): void {
        if (!el) return;
        const prefix = el.classList.contains('q-notification__icon')
            ? 'q-notification__icon'
            : 'q-toast__icon';
        el.classList.add(`${prefix}--${type}`);
    }

    _emitToastEvent(action: string, data: Record<string, any>): void {
        if (!this.eventKey) return;
        const event = `${this.eventKey}:${action}`;
        this.systemEmit(
            event,
            EventContextBuilder.create()
                .withEvent(event)
                .withType(action)
                .withSource(this.eventKey)
                .withData(data)
                .build()
        );
    }
}

// ─── 模板注册 ──────────────────────────────────────────────

const registry = ComponentRegistrar.getInstance();
registry.register(Toast as any, TOAST_TEMPLATE);

Toast.use(TOAST_ABILITIES);

export interface Toast extends IToast {}

class ToastNotification {
    static type = 'ToastNotification';
}
registry.register(ToastNotification, TOAST_NOTIFICATION_TEMPLATE);
