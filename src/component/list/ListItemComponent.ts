import { Component } from '@qimenjs/component-core';
import type { TemplateDecl } from '@/component-core';
import { LIST_ITEM_TPL } from './list-item-tpl';
import { Definitions } from '@/composable';
import './list-item.css';

export type ListStatus = 'default' | 'primary' | 'success' | 'warning' | 'error';
export type MarkForm = 'dot' | 'dash' | 'ring';

export interface ListItemProps {
    label?: string;
    description?: string;
    status?: ListStatus;
    markForm?: MarkForm;
}

const ListItemComponentDefs: Definitions = {
    targetToOptions: {
        label: { target: 'label', to: 'text' },
    },
    options: {
        status: 'default',
        markForm: 'dot',
        description: null,
    },
} as const;

class ListItemComponent extends Component {
    static type = 'list-item';
    get tpl(): TemplateDecl {
        return LIST_ITEM_TPL;
    }

    _onStatusOptionChange(value: string, old: string): void {
        this._toggleOptionCls('q-list__item--', value, old);
    }

    _onMarkFormOptionChange(value: string, old: string): void {
        this._toggleOptionCls('q-list__mark--', value, old, 'mark');
    }

    _onDescriptionOptionChange(value: string): void {
        const el = this.getNodeEl('desc');
        if (el) el.textContent = value ?? '';
        value ? this.removeCls('hidden', 'desc') : this.addCls('hidden', 'desc');
    }
}

ListItemComponent.define(ListItemComponentDefs);

export { ListItemComponent };
export type ListItemComponentInstance = InstanceType<typeof ListItemComponent>;
