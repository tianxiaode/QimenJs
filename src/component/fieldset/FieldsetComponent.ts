import { Component } from '@qimenjs/component-core';
import type { DomEventsMap, TemplateDecl } from '@/component-core';
import { FIELDSET_TPL } from './fieldset-tpl';
import { Definitions } from '@/composable';
import './fieldset.css';

const FieldsetComponentDefs: Definitions = {
    options: {
        legend: null,
        collapsible: false,
        collapsed: false,
    },
} as const;

class FieldsetComponent extends Component {
    static type = 'fieldset';
    get tpl(): TemplateDecl {
        return FIELDSET_TPL;
    }

    domEvents?: DomEventsMap | undefined = {
        click: {
            legend: {
                handler: 'onLegendToggleClick',
                emits: ['toggle'],
            },
        },
    };

    _onLegendOptionChange(value: string): void {
        this._setNodeText('legendText', value);
    }

    _onCollapsibleOptionChange(value: boolean): void {
        value ? this.removeCls('hidden', 'toggleIcon') : this.addCls('hidden', 'toggleIcon');
        if (!value && this.getData('collapsed')) {
            this.setData('collapsed', false);
        }
    }

    _onCollapsedOptionChange(value: boolean): void {
        if (!this.getData('collapsible') && value) return;
        this.toggleCls('q-fieldset--collapsed', value);
        value ? this.addCls('hidden', 'content') : this.removeCls('hidden', 'content');
        const iconEl = this.getNodeEl('toggleIcon');
        if (iconEl) iconEl.textContent = value ? '▶' : '▼';
    }

    onLegendToggleClick(): void {
        if (!this.collapsible) return;
        this.collapsed = !this.collapsed;
    }

    get defaultEventData(): Record<string, any> {
        return {
            ...super.defaultEventData,
            collapsed: this.collapsed,
        };
    }
}

FieldsetComponent.define(FieldsetComponentDefs);

export { FieldsetComponent };
export type FieldsetComponentInstance = InstanceType<typeof FieldsetComponent>;
