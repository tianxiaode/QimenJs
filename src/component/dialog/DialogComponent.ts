/**
 * DialogComponent 对话框组件
 *
 * 纯内容浮层组件，由 OverlayDispatchCenter 调度显示/隐藏。
 * 支持 header 拖动移动 + ResizeAbility 四边调整大小。
 *
 * 模板节点：
 * - header: 头部（HeaderComponent，可拖动移动对话框）
 * - body: 内容区（DOM 节点）
 * - footer: 底部工具栏（ItemGroupStaticComponent，order 控制位置）
 *
 * footer order 分区约定：
 *   0–99    左区（状态按钮等）
 *   100–199 中区（默认确认/取消位置）
 *   200–299 右区
 *
 * domEvents 两层模式（[action] 占位符自动匹配）：
 * - 'header.action' + button.action='close' → emit 'close'，调用 onHeaderActionCloseClick
 * - 'header.toolsLeft,header.toolsRight' + any action → emit '[action]'（动态转发）
 * - 'footer' + any action → emit '[action]'（动态转发）
 *
 * 使用方式（在父组件 floats 中声明）：
 * ```ts
 * floats: {
 *     dialog: {
 *         type: 'Dialog',
 *         trigger: 'manual',
 *         placement: 'center',
 *         mask: true,
 *         closeOnEscape: true,
 *         closeOnClickOutside: false,
 *         data: {
 *             title: '确认删除',
 *             confirm: true,
 *             cancel: true,
 *         },
 *     }
 * }
 * // save + cancel
 * data: { save: true, cancel: true }
 * // 自定义位置
 * data: { confirm: { order: 200 }, cancel: { order: 150 } }
 * // 自定义 footer items（支持任意组件：Input、Select 等）
 * data: { footerItems: [
 *     { type: 'Button', text: 'i18n:dialog.cancel', action: 'cancel', order: 100 },
 *     { type: 'Button', text: 'i18n:dialog.confirm', action: 'confirm', order: 200 },
 * ] }
 * ```
 */

import { Component, DomEventsMap } from '@qimenjs/component-core';
import { ResizeAbility } from '@qimenjs/component-abilities';
import { resolveI18nValue } from '@qimenjs/i18n';

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

class DialogComponent extends Component {
    forwards = {
        title: 'header.title',
    };

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

    _dragOffsetX: number = 0;
    _dragOffsetY: number = 0;

    onHeaderActionCloseClick(): void {
        this.addCls('q-dialog--closed');
        this.setNodeHidden(true, 'body');
    }

    onAfterInit(props?: DialogProps): void {
        this.attachDrag('header', { axis: 'both' as const });

        const headerComp = this.nodeMap?.header?.component;
        if (!headerComp) return;

        if (props?.icon !== undefined) {
            headerComp.setNodeHidden(false, 'icon');
            headerComp.icon = props.icon;
        }
        if (props?.title) {
            headerComp.title = props.title;
        }
        if (props?.subtitle !== undefined) {
            headerComp.setNodeHidden(false, 'subtitle');
            headerComp.subtitle = props.subtitle;
        }
        if (props?.toolsLeft) {
            headerComp.setNodeHidden(false, 'toolsLeft');
            const toolsLeftComp = headerComp.nodeMap?.toolsLeft?.component;
            if (toolsLeftComp) {
                toolsLeftComp._initItemGroupComponent(props.toolsLeft);
            }
        }
        if (props?.toolsRight) {
            headerComp.setNodeHidden(false, 'toolsRight');
            const toolsRightComp = headerComp.nodeMap?.toolsRight?.component;
            if (toolsRightComp) {
                toolsRightComp._initItemGroupComponent(props.toolsRight);
            }
        }

        headerComp.setNodeHidden(false, 'action');
        const actionComp = headerComp.nodeMap?.action?.component;
        if (actionComp && typeof actionComp.update === 'function') {
            actionComp.update({ icon: 'close', action: 'close' });
        }

        if (props?.width) {
            this.setNodeStyle({ '--q-dialog-width': props.width });
        }

        this._initFooter(props);

        this.setNodeCursor('move', 'header');

        if (props?.resizable !== false) {
            this.initResize({ minWidth: 200, minHeight: 120 });
        }
    }

    _initFooter(props?: DialogProps): void {
        const actionKeys: DialogActionKey[] = [
            'confirm',
            'cancel',
            'ok',
            'save',
            'close',
            'apply',
            'reset',
        ];
        const hasFooter = actionKeys.some(k => (props as any)?.[k]) || props?.footerItems;
        if (!hasFooter) return;

        this.setNodeHidden(false, 'footer');
        const footerComp = this.nodeMap?.footer?.component;
        if (!footerComp) return;

        const items: Record<string, any>[] = [];

        for (const key of actionKeys) {
            const val = (props as any)?.[key];
            if (!val) continue;

            const def = DIALOG_ACTION_DEFS[key];
            const cfg = val === true ? {} : val;
            items.push({
                type: 'Button',
                text: resolveI18nValue(cfg.text ?? def.text),
                action: def.action,
                cls: def.cls,
                order: cfg.order ?? def.order,
            });
        }

        if (props?.footerItems) {
            for (const item of props.footerItems) {
                items.push({
                    ...item,
                    text: item.text ? resolveI18nValue(item.text) : item.text,
                });
            }
        }

        footerComp.setItems(items);
    }

    onHeaderDragStart(ctx: any): void {
        const rect = this.el.getBoundingClientRect();
        this._dragOffsetX = rect.left;
        this._dragOffsetY = rect.top;
        this.setNodeStyle({
            position: 'fixed',
            transform: 'none',
            top: `${rect.top}px`,
            left: `${rect.left}px`,
        });
    }

    onHeaderDragMove(ctx: any): void {
        const dx = ctx.dx ?? 0;
        const dy = ctx.dy ?? 0;
        this.el.style.top = `${this._dragOffsetY + dy}px`;
        this.el.style.left = `${this._dragOffsetX + dx}px`;
    }

    onOverlayChange(data: any): void {
        if (!data) return;
        const headerComp = this.nodeMap?.header?.component;

        if (headerComp) {
            if (data.title !== undefined) headerComp.title = data.title;
            if (data.icon !== undefined) {
                headerComp.setNodeHidden(false, 'icon');
                headerComp.icon = data.icon;
            }
            if (data.subtitle !== undefined) {
                headerComp.setNodeHidden(false, 'subtitle');
                headerComp.subtitle = data.subtitle;
            }
        }

        if (data.width !== undefined) {
            this.setNodeStyle({ '--q-dialog-width': data.width });
        }

        if (
            data.confirm ||
            data.cancel ||
            data.ok ||
            data.save ||
            data.close ||
            data.apply ||
            data.reset ||
            data.footerItems
        ) {
            this._initFooter(data);
        }
    }
}

DialogComponent.use([ResizeAbility]);

export { DialogComponent };
export type DialogComponentInstance = InstanceType<typeof DialogComponent>;
