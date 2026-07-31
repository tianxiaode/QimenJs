/**
 * PanelComponent 面板组件
 *
 * 使用 HeaderComponent 作为头部，支持左右工具区、折叠、关闭和调整大小。
 *
 * 子节点：
 * - header: 头部（HeaderComponent）
 * - body: 内容区（DOM 节点）
 *
 * domEvents 两层模式（[action] 占位符自动匹配）：
 * - 'header.action' + button.action='collapse' → emit 'collapse'，调用 onHeaderActionCollapseClick
 * - 'header.action' + button.action='close'    → emit 'close'，调用 onHeaderActionCloseClick
 * - 'header.toolsLeft,header.toolsRight' + any action → emit '[action]'（动态转发）
 *
 * CSS 行为：
 * - .q-panel--collapsed → body 隐藏
 * - .q-panel--closed → 整个面板隐藏
 */

import { Component, DomEventsMap } from '@qimenjs/component-core';
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
    closable?: boolean;
    resizable?: boolean;
    toolsLeft?: ToolGroupConfig;
    toolsRight?: ToolGroupConfig;
}

class PanelComponent extends Component {
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
        },
    };

    onHeaderActionCollapseClick(): void {
        const isCollapsed = this.el.classList.contains('q-panel--collapsed');
        if (isCollapsed) {
            this.el.classList.remove('q-panel--collapsed');
            this.setNodeHidden(false, 'body');
        } else {
            this.el.classList.add('q-panel--collapsed');
            this.setNodeHidden(true, 'body');
        }
    }

    onHeaderActionCloseClick(): void {
        this.el.classList.add('q-panel--closed');
        this.setNodeHidden(true, 'body');
    }

    onAfterInit(props?: PanelProps): void {
        const headerComp = this.getComponent('header');
        if (!headerComp) return;

        if (props?.title) {
            headerComp.title = props.title;
        }

        if (props?.toolsLeft) {
            headerComp.setNodeHidden(false, 'toolsLeft');
            const toolsLeftComp = headerComp.getComponent('toolsLeft');
            if (toolsLeftComp) {
                toolsLeftComp._initItemGroupComponent(props.toolsLeft);
            }
        }

        if (props?.toolsRight) {
            headerComp.setNodeHidden(false, 'toolsRight');
            const toolsRightComp = headerComp.getComponent('toolsRight');
            if (toolsRightComp) {
                toolsRightComp._initItemGroupComponent(props.toolsRight);
            }
        }

        if (props?.expandable) {
            headerComp.setNodeHidden(false, 'action');
            const actionComp = headerComp.getComponent('action');
            if (actionComp && typeof actionComp.update === 'function') {
                actionComp.update({ icon: 'expand_more', action: 'collapse' });
            }
        }

        if (props?.closable) {
            headerComp.setNodeHidden(false, 'action');
            const actionComp = headerComp.getComponent('action');
            if (actionComp && typeof actionComp.update === 'function') {
                actionComp.update({ icon: 'close', action: 'close' });
            }
        }

        if (props?.resizable) {
            this.initResize({ edges: ['e', 's', 'se'] });
        }
    }
}

PanelComponent.use([ResizeAbility]);
PanelComponent.useTemplate(PANEL_TPL);

export { PanelComponent };
export type PanelComponentInstance = InstanceType<typeof PanelComponent>;
