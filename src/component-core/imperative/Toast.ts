import { TOAST_TEMPLATE } from './toast-tpl';
import { Component } from '../Component';
import type { TemplateDecl, ToastType } from '../types';
import type { Definitions } from '@/composable';
import { ZIndexLevel, zIndexManager } from '../engine';
import './toast.css';

const DEFAULT_DURATION = 3000;

export class Toast extends Component {
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
        this.el!.style.pointerEvents = 'auto';
        const toastType: ToastType = this.toastType ?? 'info';
        this.addCls(`q-toast--${toastType}`);
        this.addCls(`q-toast__icon--${toastType}`, 'icon');

        if (this.title) {
            this.addCls('q-toast--titled');
        }

        this.el!.style.zIndex = String(zIndexManager.acquire(ZIndexLevel.notification));
    }

    show(): void {
        this.mountToOverlay(this.el!);
        this._bindOverlayHandlers();
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

    _onTitleOptionChange(value: string): void {
        this.setNodeHtml(value, "text");
    }

    _onMessageOptionChange(value: string): void {
        this.setNodeHtml(value, "message");
    }

    async close(): Promise<void> {
        if (this._closed) return;
        this._closed = true;

        if (this.timerId !== null) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }

        this.componentEmit('closed', {}, { source: this.eventKey ?? 'toast' });

        await this.playLeave();

        this.unmountFromOverlay(this.el!);
        zIndexManager.release(ZIndexLevel.notification);

        this._resolve?.();
        this._resolve = null;

        this.dispose();
    }

    then<TResult1 = void, TResult2 = never>(
        onfulfilled?: ((value: void) => TResult1 | PromiseLike<TResult1>) | null,
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
    ): Promise<TResult1 | TResult2> {
        return this._promise!.then(onfulfilled, onrejected);
    }
}

const ToastDefs: Definitions = {
    options: {
        title: null,
        message: null,
        toastType: 'info',
        duration: 3000,
        alignment: 'top-right',
        minWidth: 200,
        maxWidth: 300,
    },
};

Toast.define(ToastDefs);
