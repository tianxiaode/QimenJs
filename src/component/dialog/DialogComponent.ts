import { Component, DomEventsMap } from '@qimenjs/component-core';
import type { TemplateDecl, DragOptions } from '@qimenjs/component-core';
import { ResizeAbility } from '@qimenjs/component-abilities';
import { resolveI18nValue } from '@qimenjs/i18n';
import { Definitions } from '@/composable';
import { DIALOG_TPL } from './dialog-tpl';
import { ButtonComponent } from '../button/ButtonComponent';
import { IconComponent } from '../icon/IconComponent';
import './dialog.css';

type DialogActionKey = 'confirm' | 'cancel' | 'ok' | 'save' | 'close' | 'apply' | 'reset';

interface DialogActionDef {
    text: string;
    action: string;
    order: number;
    cls?: string;
}

const DIALOG_ACTION_DEFS: Record<DialogActionKey, DialogActionDef> = {
    cancel: { text: '@dialog.cancel', action: 'cancel', order: 100 },
    reset: { text: '@dialog.reset', action: 'reset', order: 150 },
    apply: { text: '@dialog.apply', action: 'apply', order: 180 },
    ok: { text: '@dialog.ok', action: 'ok', order: 200, cls: 'q-button--primary' },
    confirm: {
        text: '@dialog.confirm',
        action: 'confirm',
        order: 200,
        cls: 'q-button--primary',
    },
    save: { text: '@dialog.save', action: 'save', order: 200, cls: 'q-button--primary' },
    close: { text: '@dialog.close', action: 'close', order: 300 },
};

const ICON_ORDER = 0;
const CLOSE_ORDER = 20000;

const DialogComponentDefs: Definitions = {
    options: {
        title: null,
        icon: null,
        subtitle: null,
        width: null,
        closable: true,
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
        click: [
            { path: 'header.[items]', handler: true, emits: ['[action]'] },
            { path: 'footer', handler: true, emits: ['[action]'] },
        ],
    };

    drag?: boolean | DragOptions = { axis: 'both', handle: 'header' };

    _dragOffsetX: number = 0;
    _dragOffsetY: number = 0;

    _onTitleOptionChange(value: string): void {
        const headerComp = this.getComponent('header') as any;
        if (headerComp) headerComp.title = value;
    }

    _onSubtitleOptionChange(value: string): void {
        const headerComp = this.getComponent('header') as any;
        if (headerComp) headerComp.subtitle = value;
    }

    _onWidthOptionChange(value: string): void {
        if (value) this.el?.style.setProperty('--q-dialog-width', value);
    }

    onHeaderActionCloseClick(): void {
        this.addCls('q-dialog--closed');
        this.setNodeHidden(true, 'body');
    }

    onAfterInit(): void {
        const headerComp = this.getComponent('header') as any;
        if (headerComp) {
            if (this.icon) {
                headerComp.add({
                    type: IconComponent,
                    iconCls: this.icon,
                    order: ICON_ORDER,
                });
            }
            if (this.closable) {
                headerComp.add({
                    type: IconComponent,
                    iconCls: 'q-icon-close',
                    action: 'close',
                    order: CLOSE_ORDER,
                    clickable: true,
                });
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

        this.setNodeHidden(false, 'footer');
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
