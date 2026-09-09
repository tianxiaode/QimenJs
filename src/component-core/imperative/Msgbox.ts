import { MSGBOX_TPL } from './msgbox-tpl';
import { Component } from '../Component';
import type { TemplateDecl, ViewportPosition } from '../types';
import type { Definitions } from '@/composable';
import { ZIndexAbility, ViewportPositionAbility } from '../abilities';
import { t } from '@/i18n';
import './msgbox.css';

export class Msgbox extends Component {
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
        this.el!.style.pointerEvents = 'auto';
        const type = this.msgboxType;
        if (type === 'alert') {
            this.addCls('hidden', 'cancel');
        } else if (type === 'prompt') {
            this.toggleCls('field', 'hidden');
        }

        this.el!.style.zIndex = String(this.acquireZIndex());

        this.initOverlayMask({ color: 'rgba(0,0,0,0.5)' });

        if (this.msgboxType === 'alert') {
            const mask = this.abilityState('OverlayAbility:mask');
            if (mask) {
                this.onCleanup(this.bind(mask.el, 'click'));
                const off = this.on('dom:click', (e: any) => {
                    const target = e?.data?.originalEvent?.target ?? e?.target;
                    if (target === mask.el) {
                        this.close('cancel');
                    }
                });
                this.onCleanup(off);
            }
        }

        this.setViewportPosition('center' as ViewportPosition);

        if (this.confirmText == null) this._onConfirmTextOptionChange(null);
        if (this.cancelText == null) this._onCancelTextOptionChange(null);
    }

    show(): void {
        this.mountToOverlay(this.el!);
        this._bindOverlayHandlers();
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

    _onTitleOptionChange(value: string): void {
        this.setNodeText(value, "title");
    }

    _onContentOptionChange(value: string): void {
        this.setNodeHtml(value, "content");
    }

    _onConfirmTextOptionChange(value: string | null): void {
        this.setNodeText(value ?? t('common:confirm'), "confirm");
    }

    _onCancelTextOptionChange(value: string | null): void {
        this.setNodeText(value ?? t('common:cancel'), "cancel");
    }

    _onValueOptionChange(value: string): void {
        this.setNodeAttr("value", value ?? '', "field");
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

        const mask = this.abilityState('OverlayAbility:mask');
        const maskEl = mask?.el;
        const maskAnim = maskEl?.animate([{ opacity: 1 }, { opacity: 0 }], {
            duration: 200,
            easing: 'ease-in',
        });
        await Promise.all([this.playLeave(), maskAnim?.finished]);

        this.unmountFromOverlay(this.el!);
        this.releaseZIndex();

        this.componentEmit('closed', {}, { source: this.eventKey ?? 'msgbox' });

        this.dispose();
        this.onClose?.();
    }

    onClose?: () => void;
}

const MsgboxDefs: Definitions = {
    options: {
        title: null,
        content: null,
        confirmText: null,
        cancelText: null,
        value: null,
        msgboxType: 'alert',
    },
    fields: {
        callback: null,
    },
};

Msgbox.use([ZIndexAbility, ViewportPositionAbility]);
Msgbox.define(MsgboxDefs);
