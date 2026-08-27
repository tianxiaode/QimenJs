import { TOAST_FEEDBACK_EVENTS } from '../constants';
import { TOAST_TEMPLATE } from './toast-tpl';
import { FloatingComponent } from '../overlay';
import { EventForwarder } from '../engine';
import type { TemplateDecl, ViewportPosition, ToastType } from '../types';
import type { Definitions } from '@/composable';
import './toast.css';

const DEFAULT_DURATION = 3000;

export class Toast extends FloatingComponent {
    get tpl(): TemplateDecl {
        return TOAST_TEMPLATE;
    }

    timerId: ReturnType<typeof setTimeout> | null = null;
    private _closed = false;
    private _resolve: (() => void) | null = null;
    private _promise: Promise<void> | null = null;

    domEvents = {
        click: {
            closeBtn: {
                handler: '_onCloseClick',
            },
        },
    };

    get isClosed(): boolean {
        return this._closed;
    }

    onBeforeInit(): void {
        this._promise = new Promise<void>(resolve => {
            this._resolve = resolve;
        });
        this.animation = {
            enterKeyframes: [{ opacity: 0 }, { opacity: 1 }],
            leaveKeyframes: [{ opacity: 1 }, { opacity: 0 }],
            duration: 200,
            easing: 'ease-out',
        };
        this.el.style.pointerEvents = 'auto';
    }

    onAfterInit(): void {
        const toastType: ToastType = this.toastType ?? 'info';
        this.addCls('root', `q-toast--${toastType}`);
        this.addCls('icon', `q-toast__icon--${toastType}`); // 添加样式类

        if (this.title) {
            this.addCls('root', 'q-toast--titled');
        }

        this.zIndex = this.acquireZIndex();
        this.setViewportPosition(this.position as ViewportPosition, 0, 16);
        this.mountToOverlay(this.el);

        this.playEnter();

        const duration = this.duration ?? DEFAULT_DURATION;
        if (duration > 0) {
            this.timerId = setTimeout(() => {
                if (!this._closed) {
                    this.close();
                }
            }, duration);
        }
    }

    _onCloseClick(): void {
        this.close();
    }

    async close(): Promise<void> {
        if (this._closed) return;
        this._closed = true;

        if (this.timerId !== null) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }

        EventForwarder.forward(this, { system: [TOAST_FEEDBACK_EVENTS.CLOSED] });

        await this.playLeave();

        this.unmountFromOverlay(this.el);
        this.releaseZIndex();

        this._resolve?.();
        this._resolve = null;

        this.dispose();
        this.onClose?.();
    }

    then<TResult1 = void, TResult2 = never>(
        onfulfilled?: ((value: void) => TResult1 | PromiseLike<TResult1>) | null,
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
    ): Promise<TResult1 | TResult2> {
        return this._promise!.then(onfulfilled, onrejected);
    }

    onClose?: () => void;
}

const ToastDefs: Definitions = {
    options: {
        toastType: 'info',
        duration: 3000,
        position: 'top-right',
        title: { target: 'text', to: 'html', default: null },
        message: { target: 'message', to: 'html', default: null },
    },
};

Toast.define(ToastDefs);
