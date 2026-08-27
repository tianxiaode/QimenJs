import { MSGBOX_FEEDBACK_EVENTS } from '../constants';
import { MSGBOX_TPL } from './msgbox-tpl';
import { FloatingComponent } from '../overlay';
import { EventForwarder } from '../engine';
import type { TemplateDecl, ViewportPosition } from '../types';
import type { Definitions } from '@/composable';
import './msgbox.css';

export class Msgbox extends FloatingComponent {
    get tpl(): TemplateDecl {
        return MSGBOX_TPL;
    }

    maskEl!: HTMLElement;
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

    onMsgTypeChange(value: string) {
        if (value === 'alert') {
            this.addCls('cancel', 'hidden');
        } else if (value === 'prompt') {
            this.toggleCls('field', 'hidden');
        }
    }

    _setupMask(): void {
        this.maskEl = document.createElement('div');
        this.maskEl.classList.add('q-msgbox-mask');
        this.maskEl.style.position = 'fixed';
        this.maskEl.style.inset = '0';
        this.maskEl.style.background = 'rgba(0,0,0,0.5)';
        this.maskEl.style.zIndex = String(this.zIndex);

        this.mountToOverlay(this.maskEl);

        if (this.msgboxType === 'alert') {
            this.bind(this.maskEl, 'click');
            this.on('dom:click', (e: any) => {
                if (e.target === this.maskEl) {
                    this.close('cancel');
                }
            });
        }
    }

    onAfterInit(): void {
        this.setStyle('pointerEvents', 'auto');

        this.zIndex = this.acquireZIndex();

        this._setupMask();

        this.setViewportPosition('center' as ViewportPosition);
        this.mountToOverlay(this.el);

        this.animation.enterKeyframes = [
            { transform: 'translate(-50%, -50%) scale(0.8)', opacity: 0 },
            { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
        ];
        this.playEnter();
    }

    _onConfirmClick(): void {
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

        const maskAnim = this.maskEl.animate([{ opacity: 1 }, { opacity: 0 }], {
            duration: 150,
            easing: 'ease-in',
        });
        await Promise.all([this.playLeave(), maskAnim.finished]);

        this.unmountFromOverlay(this.el);
        this.unmountFromOverlay(this.maskEl);
        this.releaseZIndex();

        EventForwarder.forward(this, { system: [MSGBOX_FEEDBACK_EVENTS.CLOSED] });

        this.dispose();
        this.onClose?.();
    }

    onClose?: () => void;
}

// ─── Definitions ────────────────────────────────────────────

const MsgboxDefs: Definitions = {
    options: {
        msgboxType: 'alert',
        title: { target: 'text', to: 'text', default: null },
        content: { target: 'content', to: 'html', default: null },
    },
    property: {
        callback: null,
    },
};

Msgbox.define(MsgboxDefs);
