import { Component } from '@qimenjs/component-core';
import type { DomEventsMap, TemplateDecl } from '@/component-core';
import { ResizeAbility } from '@qimenjs/component-abilities';
import { IconComponent } from '../icon/IconComponent';
import { PANEL_TPL } from './panel-tpl';
import { Definitions } from '@/composable';
import './panel.css';

const EXPAND_ORDER = 10600;
const CLOSE_ORDER = 10700;

const PanelComponentDefs: Definitions = {
    options: {
        title: null,
        header: null,
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
            { path: 'header.[items]', handler: true, emits: ['[action]'] },
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

    _onExpandableOptionChange(value: boolean): void {
        const headerComp = this.getComponent('header') as any;
        if (!headerComp) return;
        if (value) {
            headerComp.add({
                type: IconComponent,
                iconCls: 'q-chevron-down',
                action: 'expand',
                order: EXPAND_ORDER,
                clickable: true,
            });
        } else {
            const items = headerComp.items ?? [];
            for (let i = items.length - 1; i >= 0; i--) {
                if (items[i]?.action === 'expand') {
                    headerComp.removeAt(i);
                    break;
                }
            }
        }
    }

    _onClosableOptionChange(value: boolean): void {
        const headerComp = this.getComponent('header') as any;
        if (!headerComp) return;
        if (value) {
            headerComp.add({
                type: IconComponent,
                iconCls: 'q-close',
                action: 'close',
                order: CLOSE_ORDER,
                clickable: true,
            });
        } else {
            const items = headerComp.items ?? [];
            for (let i = items.length - 1; i >= 0; i--) {
                if (items[i]?.action === 'close') {
                    headerComp.removeAt(i);
                    break;
                }
            }
        }
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
    }

    onCloseActionClick(): void {
        this.addCls('q-panel--closed');
        this.setNodeHidden(true, 'body');
    }

    onAfterInit(): void {
        const headerComp = this.getComponent('header') as any;
        if (headerComp) {
            if (this.header) headerComp.update(this.header);
            if (this.title) headerComp.title = this.title;
        }
        if (this.expandable) {
            this._onExpandableOptionChange(true);
        }
        if (this.closable) {
            this._onClosableOptionChange(true);
        }
    }
}

PanelComponent.define(PanelComponentDefs);
PanelComponent.use(ResizeAbility);

export { PanelComponent };
export type PanelComponentInstance = InstanceType<typeof PanelComponent>;
