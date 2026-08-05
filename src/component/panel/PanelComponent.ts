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
import { PANEL_TPL } from './panel-tpl';

/** 工具组配置 */
export interface ToolGroupConfig {
    items: Record<string, any>[];
    itemType?: string;
    cls?: string;
    defaultItem?: Record<string, any>;
}

/** 面板属性接口 */
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
        const isCollapsed = this.containsCls('q-panel--collapsed');
        if (isCollapsed) {
            this.removeCls('q-panel--collapsed');
            this.setNodeHidden(false, 'body');
        } else {
            this.addCls('q-panel--collapsed');
            this.setNodeHidden(true, 'body');
        }
    }

    onHeaderActionCloseClick(): void {
        this.addCls('q-panel--closed');
        this.setNodeHidden(true, 'body');
    }

    onAfterInit(props?: PanelProps): void {
        const headerComp = this.getNode('header');
        if (!headerComp) return;

        if (props?.title) {
            headerComp.title = props.title;
        }

        if (props?.toolsLeft) {
            headerComp.setNodeHidden(false, 'toolsLeft');
            const toolsLeftComp = headerComp.getNode('toolsLeft');
            if (toolsLeftComp) {
                toolsLeftComp._initItemGroupComponent(props.toolsLeft);
            }
        }

        if (props?.toolsRight) {
            headerComp.setNodeHidden(false, 'toolsRight');
            const toolsRightComp = headerComp.getNode('toolsRight');
            if (toolsRightComp) {
                toolsRightComp._initItemGroupComponent(props.toolsRight);
            }
        }

        if (props?.expandable) {
            headerComp.setNodeHidden(false, 'action');
            const actionComp = headerComp.getNode('action');
            if (actionComp && typeof actionComp.update === 'function') {
                actionComp.update({ icon: 'expand_more', action: 'collapse' });
            }
        }

        if (props?.closable) {
            headerComp.setNodeHidden(false, 'action');
            const actionComp = headerComp.getNode('action');
            if (actionComp && typeof actionComp.update === 'function') {
                actionComp.update({ icon: 'close', action: 'close' });
            }
        }

        if (props?.resizable) {
            this.initResize({ edges: ['e', 's', 'se'] });
        }
    }
}

PanelComponent.use(ResizeAbility);
PanelComponent.useTemplate(PANEL_TPL);

export { PanelComponent };
/** 面板实例类型 */
export type PanelComponentInstance = InstanceType<typeof PanelComponent>;
