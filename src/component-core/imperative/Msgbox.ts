import { MSGBOX_TPL } from './msgbox-tpl';
import { FloatingComponent } from '../overlay';
import { EventContextBuilder } from '@/context';
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
        this.setStyle('root', 'pointerEvents', 'auto');
        const type = this.getOption('msgboxType');
        if (type === 'alert') {
            this.addCls('cancel', 'hidden');
        } else if (type === 'prompt') {
            this.toggleCls('field', 'hidden');
        }

        this.setData('zIndex', this.acquireZIndex());

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
        this.mountToOverlay(this.el);

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

        this.unmountFromOverlay(this.el);
        this._removeMask();
        this.releaseZIndex();

        this.componentEmit(
            EventContextBuilder.create()
                .withEvent('closed')
                .withType('closed')
                .withSource(this.eventKey ?? 'msgbox')
                .withData({})
                .build()
        );

        this.dispose();
        this.onClose?.();
    }

    onClose?: () => void;
}

// ─── Definitions ────────────────────────────────────────────

const MsgboxDefs: Definitions = {
    options: {
        msgboxType: 'alert',
        title: { target: 'title', to: 'text', default: null },
        content: { target: 'content', to: 'html', default: null },
        confirmText: { target: 'confirm', to: 'text', default: '确定' },
        cancelText: { target: 'cancel', to: 'text', default: '取消' },
        value: { target: 'field', to: 'value', default: null },
    },
    property: {
        callback: null,
    },
};

Msgbox.define(MsgboxDefs);
Msgbox.register();
