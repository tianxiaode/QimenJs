/**
 * PanelComponent 面板组件
 *
 * 通用内容容器，header 内联化（toolsLeft + title + toolsRight + expandAction + closeAction），
 * 不再依赖 HeaderComponent。
 *
 * 模板节点：
 * - toolsLeft     — 左侧工具区（ItemGroupPooledComponent，默认隐藏）
 * - title         — 标题
 * - toolsRight    — 右侧工具区（ItemGroupPooledComponent，默认隐藏）
 * - expandAction  — 折叠/展开按钮（默认隐藏，CSS ::before 内容）
 * - closeAction   — 关闭按钮（默认隐藏，CSS ::before 内容）
 * - body          — 内容区
 *
 * @example
 * ```ts
 * new PanelComponent({ title: '数据面板' })
 * new PanelComponent({ title: '面板', expandable: true, closable: true })
 * new PanelComponent({ title: '工具面板', toolsLeft: { items: [...] } })
 * ```
 */

import { Component } from '@qimenjs/component-core';
import type { DomEventsMap, TemplateDecl } from '@/component-core';
import { ResizeAbility } from '@qimenjs/component-abilities';
import { PANEL_TPL } from './panel-tpl';
import { Definitions } from '@/composable';
import './panel.css';

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

const PanelComponentDefs: Definitions = {
    targetToOptions: {
        title: { target: 'title', to: 'text' },
    },
    options: {
        expandable: false,
        closable: false,
        resizable: false,
        toolsLeft: null,
        toolsRight: null,
    },
} as const;

class PanelComponent extends Component {
    static type = 'panel';
    get tpl(): TemplateDecl {
        return PANEL_TPL;
    }

    domEvents?: DomEventsMap | undefined = {
        click: {
            expandAction: { handler: true },
            closeAction: { handler: true },
        },
    };

    _onTitleOptionChange(value: string, _old: string): void {
        this._setNodeHidden(!value, 'title');
    }

    _onExpandableOptionChange(value: boolean): void {
        this._setNodeHidden(!value, 'expandAction');
    }

    _onClosableOptionChange(value: boolean): void {
        this._setNodeHidden(!value, 'closeAction');
    }

    _onResizableOptionChange(value: boolean): void {
        if (value) this.initResize({ edges: ['e', 's', 'se'] });
    }

    _onToolsLeftOptionChange(value: ToolGroupConfig | null): void {
        this._initTools('toolsLeft', value);
    }

    _onToolsRightOptionChange(value: ToolGroupConfig | null): void {
        this._initTools('toolsRight', value);
    }

    _initTools(nodeName: string, config: ToolGroupConfig | null): void {
        this._setNodeHidden(!config, nodeName);
        if (!config) return;
        const el = this.getNodeEl(nodeName);
        if (el) el.classList.add('q-panel__tools');
        const comp = this.getComponent(nodeName);
        if (comp && typeof (comp as any)._initItemGroupComponent === 'function') {
            (comp as any)._initItemGroupComponent(config);
        }
    }

    onExpandActionClick(): void {
        const collapsed = this.hasCls('q-panel--collapsed');
        if (collapsed) {
            this.removeCls('q-panel--collapsed');
            this._setNodeHidden(false, 'body');
        } else {
            this.addCls('q-panel--collapsed');
            this._setNodeHidden(true, 'body');
        }
    }

    onCloseActionClick(): void {
        this.addCls('q-panel--closed');
        this._setNodeHidden(true, 'body');
    }

    onAfterInit(): void {
        this._initTools('toolsLeft', this.toolsLeft ?? null);
        this._initTools('toolsRight', this.toolsRight ?? null);
    }
}

PanelComponent.define(PanelComponentDefs);
PanelComponent.use(ResizeAbility);

export { PanelComponent };
/** 面板实例类型 */
export type PanelComponentInstance = InstanceType<typeof PanelComponent>;