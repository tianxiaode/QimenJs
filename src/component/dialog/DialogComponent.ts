import { Component, DomEventsMap } from '@qimenjs/component-core';
import type { TemplateDecl, DragOptions } from '@qimenjs/component-core';
import { ResizeAbility } from '@qimenjs/component-abilities';
import { resolveI18nValue } from '@qimenjs/i18n';
import { Definitions } from '@/composable';
import { DIALOG_TPL } from './dialog-tpl';
import { ButtonComponent } from '../button/ButtonComponent';
import './dialog.css';

type DialogActionKey = 'confirm' | 'cancel' | 'ok' | 'save' | 'close' | 'apply' | 'reset';

interface DialogActionDef {
    text: string;
    action: string;
    order: number;
    cls?: string;
}

const DIALOG_ACTION_DEFS: Record<DialogActionKey, DialogActionDef> = {
    cancel: { text: 'i18n:dialog.cancel', action: 'cancel', order: 100 },
    reset: { text: 'i18n:dialog.reset', action: 'reset', order: 150 },
    apply: { text: 'i18n:dialog.apply', action: 'apply', order: 180 },
    ok: { text: 'i18n:dialog.ok', action: 'ok', order: 200, cls: 'q-button--primary' },
    confirm: {
        text: 'i18n:dialog.confirm',
        action: 'confirm',
        order: 200,
        cls: 'q-button--primary',
    },
    save: { text: 'i18n:dialog.save', action: 'save', order: 200, cls: 'q-button--primary' },
    close: { text: 'i18n:dialog.close', action: 'close', order: 300 },
};

export interface DialogProps {
    title?: string;
    icon?: string;
    subtitle?: string;
    toolsLeft?: Record<string, any>;
    toolsRight?: Record<string, any>;
    confirm?: boolean | { order?: number; text?: string };
    cancel?: boolean | { order?: number; text?: string };
    ok?: boolean | { order?: number; text?: string };
    save?: boolean | { order?: number; text?: string };
    close?: boolean | { order?: number; text?: string };
    apply?: boolean | { order?: number; text?: string };
    reset?: boolean | { order?: number; text?: string };
    footerItems?: Record<string, any>[];
    width?: string;
    resizable?: boolean;
    anchor?: HTMLElement;
}

const DialogComponentDefs: Definitions = {
    options: {
        title: null,
        icon: null,
        subtitle: null,
        width: null,
        toolsLeft: null,
        toolsRight: null,
    },
    fields: {
        confirm: undefined,
        cancel: undefined,
        ok: undefined,
        save: undefined,
        close: undefined,
        apply: undefined,
        reset: undefined,
        footerItems: undefined,
        resizable: true,
        anchor: undefined,
    },
} as const;

class DialogComponent extends Component {
    static type = 'dialog';

    get tpl(): TemplateDecl {
        return DIALOG_TPL;
    }

    domEvents?: DomEventsMap | undefined = {
        click: {
            'header.action': {
                handler: true,
                emits: ['[action]'],
            },
            'header.toolsLeft,header.toolsRight': {
                handler: true,
                emits: ['[action]'],
            },
            footer: {
                handler: true,
                emits: ['[action]'],
            },
        },
    };

    drag?: boolean | DragOptions = { axis: 'both', handle: 'header' };

    _dragOffsetX: number = 0;
    _dragOffsetY: number = 0;

    _onTitleOptionChange(value: string): void {
        const headerComp = this.getComponent('header') as any;
        if (headerComp) headerComp.title = value;
    }

    _onIconOptionChange(value: string): void {
        if (!value) return;
        const headerComp = this.getComponent('header') as any;
        if (headerComp) headerComp.icon = value;
    }

    _onSubtitleOptionChange(value: string): void {
        if (!value) return;
        const headerComp = this.getComponent('header') as any;
        if (headerComp) headerComp.subtitle = value;
    }

    _onWidthOptionChange(value: string): void {
        if (value) this.el?.style.setProperty('--q-dialog-width', value);
    }

    _onToolsLeftOptionChange(value: Record<string, any>): void {
        if (!value) return;
        const headerComp = this.getComponent('header') as any;
        if (headerComp) headerComp.toolsLeft = value;
    }

    _onToolsRightOptionChange(value: Record<string, any>): void {
        if (!value) return;
        const headerComp = this.getComponent('header') as any;
        if (headerComp) headerComp.toolsRight = value;
    }

    onHeaderActionCloseClick(): void {
        this.addCls('q-dialog--closed');
        this._setNodeHidden(true, 'body');
    }

    onAfterInit(): void {
        const headerComp = this.getComponent('header') as any;
        if (headerComp) {
            headerComp._setNodeHidden(false, 'action');
            const actionComp = headerComp.getComponent('action');
            if (actionComp && typeof actionComp.update === 'function') {
                actionComp.update({ icon: 'close', action: 'close' });
            }
        }

        this._initFooter();

        this.setStyles({ cursor: 'move' }, 'header');

        if (this.resizable !== false) {
            this.initResize({ minWidth: 200, minHeight: 120 });
        }
    }

    _initFooter(props?: any): void {
        const data = props ?? this;
        const actionKeys: DialogActionKey[] = [
            'confirm',
            'cancel',
            'ok',
            'save',
            'close',
            'apply',
            'reset',
        ];
        const hasFooter = actionKeys.some(k => (data as any)?.[k]) || data?.footerItems;
        if (!hasFooter) return;

        this._setNodeHidden(false, 'footer');
        const footerComp = this.getComponent('footer') as any;
        if (!footerComp) return;

        const items: Record<string, any>[] = [];

        for (const key of actionKeys) {
            const val = (data as any)?.[key];
            if (!val) continue;

            const def = DIALOG_ACTION_DEFS[key];
            const cfg = val === true ? {} : val;
            items.push({
                type: ButtonComponent,
                text: resolveI18nValue(cfg.text ?? def.text),
                action: def.action,
                cls: def.cls,
                order: cfg.order ?? def.order,
            });
        }

        if (data?.footerItems) {
            for (const item of data.footerItems) {
                items.push({
                    ...item,
                    text: item.text ? resolveI18nValue(item.text) : item.text,
                });
            }
        }

        footerComp.setItems(items);
    }

    onDragStart(_ctx: any): void {
        const rect = this.el!.getBoundingClientRect();
        this._dragOffsetX = rect.left;
        this._dragOffsetY = rect.top;
        this.setStyles({
            position: 'fixed',
            transform: 'none',
            top: `${rect.top}px`,
            left: `${rect.left}px`,
        });
    }

    onDragMove(ctx: any): void {
        const dx = ctx.dx ?? 0;
        const dy = ctx.dy ?? 0;
        this.el!.style.top = `${this._dragOffsetY + dy}px`;
        this.el!.style.left = `${this._dragOffsetX + dx}px`;
    }

    onOverlayChange(data: any): void {
        if (!data) return;
        this._applyOptions(data);
        this._initFooter(data);
    }
}

DialogComponent.use([ResizeAbility]);
DialogComponent.define(DialogComponentDefs);

export { DialogComponent };
export type DialogComponentInstance = InstanceType<typeof DialogComponent>;
