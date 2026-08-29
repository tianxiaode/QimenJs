import { TOAST_TEMPLATE } from './toast-tpl';
import { FloatingComponent } from '../overlay';
import { EventContextBuilder } from '@/context';
import type { TemplateDecl, ToastType } from '../types';
import type { Definitions } from '@/composable';
import './toast.css';

const DEFAULT_DURATION = 3000;

export class Toast extends FloatingComponent {
    static type = 'toast';
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
    }

    onAfterInit(): void {
        this.setStyle('root', 'pointerEvents', 'auto');
        const toastType: ToastType = this.toastType ?? 'info';
        this.addCls('root', `q-toast--${toastType}`);
        this.addCls('icon', `q-toast__icon--${toastType}`); // 添加样式类

        if (this.title) {
            this.addCls('root', 'q-toast--titled');
        }

        this.setData('zIndex', this.acquireZIndex());
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

        this.componentEmit(
            EventContextBuilder.create()
                .withEvent('closed')
                .withType('closed')
                .withSource(this.eventKey ?? 'toast')
                .withData({})
                .build()
        );

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
        alignment: 'top-right',
        minWidth: 200,
        maxWidth: 300,
        title: { target: 'text', to: 'html', default: null },
        message: { target: 'message', to: 'html', default: null },
    },
};

Toast.define(ToastDefs);
Toast.register();
