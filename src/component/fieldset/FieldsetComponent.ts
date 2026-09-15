import { Component } from '@qimenjs/component-core';
import type { DomEventsMap, TemplateDecl } from '@/component-core';
import { FIELDSET_TPL } from './fieldset-tpl';
import { Definitions } from '@/composable';
import { ColorAbility } from '@/component-abilities';
import type { FieldsetContent } from './types';
import './fieldset.css';

const FieldsetComponentDefs: Definitions = {
    options: {
        legend: null,
        collapsible: false,
        collapsed: false,
        toggleIconCls: null,
        color: null,
        content: null,
    },
} as const;

class FieldsetComponent extends Component {
    static type = 'fieldset';
    get tpl(): TemplateDecl {
        return FIELDSET_TPL;
    }

    domEvents?: DomEventsMap | undefined = {
        click: { path: 'legend', handler: 'onLegendToggleClick', emits: ['toggle'] },
    };

    _onLegendOptionChange(value: string): void {
        this.setNodeText(value, "legendText");
        this.setNodeHidden(!value, 'legend');
    }

    _onCollapsibleOptionChange(value: boolean): void {
        this.toggleCls('q-fieldset--collapsible', value);
        value ? this.removeCls('hidden', 'toggleIcon') : this.addCls('hidden', 'toggleIcon');
        if (!value && this.getData('collapsed')) {
            this.setData('collapsed', false);
        }
    }

    _onCollapsedOptionChange(value: boolean): void {
        if (!this.getData('collapsible') && value) return;
        this.toggleCls('q-fieldset--collapsed', value);
        value ? this.addCls('hidden', 'content') : this.removeCls('hidden', 'content');
    }

    _onToggleIconClsOptionChange(value: string, old: string): void {
        if (value) {
            this.addCls('q-fieldset__toggle-icon--custom', 'toggleIcon');
            this.addCls(value, 'toggleIcon');
        } else {
            this.removeCls('q-fieldset__toggle-icon--custom', 'toggleIcon');
        }
        if (old) this.removeCls(old, 'toggleIcon');
    }

    _onContentOptionChange(value: FieldsetContent, _old: FieldsetContent): void {
        this.renderSlot(value, 'content');
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
FieldsetComponent.use(ColorAbility);
export { FieldsetComponent };
export type FieldsetComponentInstance = InstanceType<typeof FieldsetComponent>;
