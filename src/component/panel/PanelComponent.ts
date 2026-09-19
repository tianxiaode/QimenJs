import { Component } from '@qimenjs/component-core';
import type { DomEventsMap, TemplateDecl } from '@/component-core';
import { ResizeAbility } from '@qimenjs/component-abilities';
import { PANEL_TPL } from './panel-tpl';
import { Definitions } from '@/composable';
import type { PanelContent } from './types';
import './panel.css';

const PanelComponentDefs: Definitions = {
    options: {
        title: null,
        header: null,
        body: null,
        expandable: false,
        closable: false,
        resizable: false,
    },
} as const;

class PanelComponent extends Component {
    static type = 'panel';
    get tpl(): TemplateDecl {
        return PANEL_TPL;
    }

    domEvents?: DomEventsMap | undefined = {
        click: [
            {
                path: 'header.[items]',
                handler: { expand: 'onExpandActionClick', close: 'onCloseActionClick' },
                emits: ['[action]'],
                bridges: ['[action]'],
            },
        ],
    };

    _onTitleOptionChange(value: string): void {
        const headerComp = this.getComponent('header') as any;
        if (headerComp) headerComp.title = value;
    }

    _onHeaderOptionChange(value: Record<string, any>): void {
        const headerComp = this.getComponent('header') as any;
        if (!headerComp) return;
        if (value) headerComp.update(value);
    }

    _onBodyOptionChange(value: PanelContent, _old: PanelContent): void {
        this.renderSlot(value, 'body');
    }

    _onExpandableOptionChange(value: boolean): void {
        const headerComp = this.getComponent('header') as any;
        if (headerComp) headerComp.setData('expandable', value);
    }

    _onClosableOptionChange(value: boolean): void {
        const headerComp = this.getComponent('header') as any;
        if (headerComp) headerComp.setData('closable', value);
    }

    _onResizableOptionChange(value: boolean): void {
        if (value) this.initResize({ edges: ['e', 's', 'se'] });
    }

    onExpandActionClick(): void {
        const collapsed = this.hasCls('q-panel--collapsed');
        if (collapsed) {
            this.removeCls('q-panel--collapsed');
            this.setNodeHidden(false, 'body');
        } else {
            this.addCls('q-panel--collapsed');
            this.setNodeHidden(true, 'body');
        }
        const headerComp = this.getComponent('header') as any;
        if (headerComp?.setExpandState) {
            headerComp.setExpandState(collapsed);
        }
    }

    onCloseActionClick(): void {
        this.addCls('q-panel--closed');
        this.setNodeHidden(true, 'body');
    }

    onAfterInit(): void {
        const headerComp = this.getComponent('header') as any;
        if (headerComp && this.title) {
            headerComp.title = this.title;
        }
    }
}

PanelComponent.define(PanelComponentDefs);
PanelComponent.use(ResizeAbility);

export { PanelComponent };
