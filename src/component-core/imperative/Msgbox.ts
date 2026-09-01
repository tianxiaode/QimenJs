import { MSGBOX_TPL } from './msgbox-tpl';
import { FloatingComponent } from '../overlay';
import type { TemplateDecl, ViewportPosition } from '../types';
import type { Definitions } from '@/composable';
import './msgbox.css';

export class Msgbox extends FloatingComponent {
    static type = 'msgbox';
    get tpl(): TemplateDecl {
        return MSGBOX_TPL;
    }

    private _resolved = false;

    domEvents = {
        click: {
            confirm: {
                handler: '_onConfirmClick',
            },
            cancel: {
                handler: '_onCancelClick',
            },
            close: {
                handler: '_onCancelClick',
            },
        },
    };

    get defaultEventData() {
        const input = this.getNodeEl('field');
        return {
            ...super.defaultEventData,
            eventKey: this.eventKey,
            value: this.msgboxType === 'prompt' && input ? input.value : null,
        };
    }

    onBeforeInit(): void {
        this.animation = {
            leaveKeyframes: [
                { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
                { transform: 'translate(-50%, -50%) scale(0.8)', opacity: 0 },
            ],
            duration: 200,
            easing: 'ease-out',
        };
    }

    onAfterInit(): void {
        this.pointerEvents = 'auto';
        const type = this.msgboxType;
        if (type === 'alert') {
            this.addCls('hidden', 'cancel');
        } else if (type === 'prompt') {
            this.toggleCls('field', 'hidden');
        }

        this.zIndex = this.acquireZIndex();

        this._initMask({ color: 'rgba(0,0,0,0.5)' });

        if (this.msgboxType === 'alert' && this._mask) {
            this.bind(this._mask.el, 'click');
            this.on('dom:click', (e: any) => {
                const target = e?.data?.originalEvent?.target ?? e?.target;
                if (target === this._mask!.el) {
                    this.close('cancel');
                }
            });
        }

        this.setViewportPosition('center' as ViewportPosition);
    }

    show(): void {
        this.mountToOverlay(this.el!);
        this._bindGlobalHandlers();
        this.animation.enterKeyframes = [
            { transform: 'translate(-50%, -50%) scale(0.8)', opacity: 0 },
            { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
        ];
        this.playEnter();
    }

    _onConfirmClick(): void {
        this.logger?.info?.('msgbox confirm click'); // Log the click
        this.close('confirm');
    }

    _onCancelClick(): void {
        this.close('cancel');
    }

    async close(action: 'confirm' | 'cancel' = 'cancel'): Promise<void> {
        if (this._resolved) return;
        this._resolved = true;

        const result: any = this.defaultEventData;
        result.action = action;
        if (action === 'cancel') {
            result.value = '';
        }
        this.callback?.(result);

        const maskEl = this._mask?.el;
        const maskAnim = maskEl?.animate([{ opacity: 1 }, { opacity: 0 }], {
            duration: 200,
            easing: 'ease-in',
        });
        await Promise.all([this.playLeave(), maskAnim?.finished]);

        this.hide();
        this.releaseZIndex();

        this.componentEmit('closed', {}, { source: this.eventKey ?? 'msgbox' });

        this.dispose();
        this.onClose?.();
    }

    onClose?: () => void;
}

// ─── Definitions ────────────────────────────────────────────

const MsgboxDefs: Definitions = {
    targetToOptions: {
        title: { target: 'title', to: 'text' },
        content: { target: 'content', to: 'html' },
        confirmText: { target: 'confirm', to: 'text', i18n: 'common:confirm' },
        cancelText: { target: 'cancel', to: 'text', i18n: 'common:cancel' },
        value: { target: 'field', to: 'value' },
    },
    options: {
        msgboxType: 'alert',
    },
    fields: {
        callback: null,
    },
};

Msgbox.define(MsgboxDefs);
Msgbox.register();
