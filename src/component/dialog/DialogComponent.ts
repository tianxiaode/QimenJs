/**
 * DialogComponent 对话框组件
 *
 * 纯内容浮层组件，由 OverlayDispatchCenter 调度显示/隐藏。
 * 支持 header 拖动移动 + ResizeAbility 四边调整大小。
 *
 * 模板节点：
 * - header: 头部（HeaderComponent，可拖动移动对话框）
 * - body: 内容区（DOM 节点）
 *
 * 事件：
 * - toolsLeftClick — 左侧工具区 item 点击
 * - toolsRightClick — 右侧工具区 item 点击
 * - actionClick — 操作按钮点击（通常为 close）
 * - resize — 对话框尺寸变化 ({ width, height, edge })
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
 *         data: { title: '确认删除', icon: '⚠' },
 *     }
 * }
 * ```
 */

import { Component } from '@qimenjs/component-core';
import { HeaderComponent } from '../header/HeaderComponent';
import { ResizeAbility } from '@qimenjs/component-abilities';

export interface DialogProps {
    title?: string;
    icon?: string;
    subtitle?: string;
    toolsLeft?: Record<string, any>;
    toolsRight?: Record<string, any>;
    width?: string;
    resizable?: boolean;
    anchor?: HTMLElement;
}

export let DialogComponent = Component.withTemplate({
    tpl: {
        tag: 'div',
        cls: 'q-dialog',
        children: [
            {
                name: 'header',
                type: HeaderComponent,
                cls: 'q-dialog__header',
            },
            { tag: 'div', name: 'body', cls: 'q-dialog__body' },
        ],
    },

    tplEvents: {
        header: {
            toolsLeftClick: { emits: ['headerToolsLeftClick'] },
            toolsRightClick: { emits: ['headerToolsRightClick'] },
            actionClick: { emits: ['headerActionClick'] },
        },
    },

    body: {
        type: 'Dialog',
        forwards: {
            title: 'header.title',
        },

        onInitState() {
            return {
                _dragOffsetX: 0,
                _dragOffsetY: 0,
            };
        },

        onAfterInit(props?: DialogProps): void {
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
                actionComp.update({ icon: 'close' });
            }

            if (props?.width) {
                this.el.style.setProperty('--q-dialog-width', props.width);
            }

            this._initHeaderDrag();

            if (props?.resizable !== false) {
                this.initResize({ minWidth: 200, minHeight: 120 });
            }
        },

        _initHeaderDrag(): void {
            const headerEl = this.nodeMap?.header?.el;
            if (!headerEl) return;

            headerEl.style.cursor = 'move';

            this.bind(headerEl, 'drag');

            this.on('dom:drag', (ctx: any) => {
                const target = ctx?.originalEvent?.target as HTMLElement | null;
                if (!headerEl.contains(target)) return;

                const phase = ctx?.phase;
                if (phase === 'start') {
                    const rect = this.el.getBoundingClientRect();
                    this._dragOffsetX = rect.left;
                    this._dragOffsetY = rect.top;
                    this.el.style.position = 'fixed';
                    this.el.style.transform = 'none';
                    this.el.style.top = `${rect.top}px`;
                    this.el.style.left = `${rect.left}px`;
                } else if (phase === 'move') {
                    const dx = ctx.dx ?? 0;
                    const dy = ctx.dy ?? 0;
                    this.el.style.top = `${this._dragOffsetY + dy}px`;
                    this.el.style.left = `${this._dragOffsetX + dx}px`;
                }
            });
        },

        onOverlayChange(data: any): void {
            if (!data) return;
            const headerComp = this.nodeMap?.header?.component;
            if (!headerComp) return;

            if (data.title !== undefined) headerComp.title = data.title;
            if (data.icon !== undefined) {
                headerComp.setNodeHidden(false, 'icon');
                headerComp.icon = data.icon;
            }
            if (data.subtitle !== undefined) {
                headerComp.setNodeHidden(false, 'subtitle');
                headerComp.subtitle = data.subtitle;
            }
            if (data.width !== undefined) {
                this.el.style.setProperty('--q-dialog-width', data.width);
            }
        },
    },
}).with([ResizeAbility]);

export type DialogComponent = InstanceType<typeof DialogComponent>;
