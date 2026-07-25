/**
 * PanelComponent 面板组件
 *
 * 使用 HeaderComponent 作为头部，支持左右工具区、折叠和调整大小。
 *
 * 子节点：
 * - header: 头部（HeaderComponent）
 * - body: 内容区（DOM 节点）
 *
 * 事件：
 * - headerToolsLeftClick — 左侧工具区 item 点击
 * - headerToolsRightClick — 右侧工具区 item 点击
 * - headerActionClick — 操作按钮点击
 * - resize — 面板尺寸变化 ({ width, height, edge })
 */

import { Component } from '@qimenjs/component-core';
import { HeaderComponent } from '../header/HeaderComponent';
import { ResizeAbility } from '@qimenjs/component-abilities';

export interface ToolGroupConfig {
    items: Record<string, any>[];
    itemType?: string;
    cls?: string;
    defaultItem?: Record<string, any>;
}

export interface PanelProps {
    title?: string;
    expandable?: boolean;
    resizable?: boolean;
    toolsLeft?: ToolGroupConfig;
    toolsRight?: ToolGroupConfig;
}

const PanelBase = Component.withTemplate({
    tpl: {
        tag: 'div',
        cls: 'q-panel',
        children: [
            {
                name: 'header',
                type: HeaderComponent,
                cls: 'q-panel__header',
            },
            { tag: 'div', name: 'body', cls: 'q-panel__body' },
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
        type: 'Panel',
        forwards: {
            title: 'header.title',
        },

        onAfterInit(props?: PanelProps): void {
            const headerComp = this.nodeMap?.header?.component;
            if (!headerComp) return;

            if (props?.title) {
                headerComp.title = props.title;
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

            if (props?.expandable) {
                headerComp.setNodeHidden(false, 'action');
                const actionComp = headerComp.nodeMap?.action?.component;
                if (actionComp && typeof actionComp.update === 'function') {
                    actionComp.update({ icon: 'expand_more' });
                }

                this.on('headerActionClick', () => {
                    const isCollapsed = this.el.classList.contains('q-panel--collapsed');
                    if (isCollapsed) {
                        this.el.classList.remove('q-panel--collapsed');
                        this.setNodeHidden(false, 'body');
                    } else {
                        this.el.classList.add('q-panel--collapsed');
                        this.setNodeHidden(true, 'body');
                    }
                });
            }

            if (props?.resizable) {
                this.initResize({ edges: ['e', 's', 'se'] });
            }
        },
    },
}).with([ResizeAbility]);

export class PanelComponent extends PanelBase {
    constructor(props?: PanelProps) {
        super();
    }
}
