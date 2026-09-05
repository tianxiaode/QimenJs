import { Component } from '@qimenjs/component-core';
import type { DomEventsMap, TemplateDecl } from '@/component-core';
import { TAB_TPL } from './tab-tpl';
import { Definitions } from '@/composable';
import './tab.css';

export interface TabProps {
    label?: string;
    icon?: string;
    closable?: boolean;
    disabled?: boolean;
    index?: number;
}

const TabComponentDefs: Definitions = {
    options: {
        label: null,
        icon: null,
        closable: false,
        pressed: false,
    },
    fields: {
        index: 0,
    },
} as const;

class TabComponent extends Component {
    static type = 'tab';
    get tpl(): TemplateDecl {
        return TAB_TPL;
    }

    domEvents?: DomEventsMap | undefined = {
        click: {
            close: { handler: '_onCloseClick', emits: ['close'] },
        },
    };

    _onLabelOptionChange(value: string): void {
        this._setNodeText('label', value);
    }

    _onIconOptionChange(value: string): void {
        const el = this.getNodeEl('icon');
        if (el) el.textContent = value ?? '';
        value ? this.removeCls('hidden', 'icon') : this.addCls('hidden', 'icon');
    }

    _onClosableOptionChange(value: boolean): void {
        value ? this.removeCls('hidden', 'close') : this.addCls('hidden', 'close');
    }

    _onPressedOptionChange(value: boolean): void {
        this.toggleCls('q-tab--pressed', value);
    }

    _onCloseClick(): void {
        if (this.disable) return;
    }

    get defaultEventData(): Record<string, any> {
        return {
            ...super.defaultEventData,
            index: this.index,
            label: this.label,
            closable: this.closable,
            disabled: this.disable,
        };
    }
}

TabComponent.define(TabComponentDefs);

export { TabComponent };
export type TabComponentInstance = InstanceType<typeof TabComponent>;
