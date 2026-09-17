import { Component } from '@qimenjs/component-core';
import type { DomEventsMap, TemplateDecl } from '@/component-core';
import { TAB_TPL } from './tab-tpl';
import { Definitions } from '@/composable';
import './tab.css';

const TabComponentDefs: Definitions = {
    options: {
        label: null,
        iconCls: null,
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
        click: { path: 'close', handler: '_onCloseClick', emits: ['close'], bridges: ['close'] },
    };

    _onLabelOptionChange(value: string): void {
        this.setNodeText(value, 'label');
    }

    _onIconClsOptionChange(value: string, old: string): void {
        const nodeName = 'icon';
        if (old) this.removeCls(old, nodeName);
        if (value) {
            this.addCls(value, nodeName);
            this.removeCls('hidden', nodeName);
        } else {
            this.addCls('hidden', nodeName);
        }
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
