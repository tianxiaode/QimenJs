import { ContainerComponent } from '../container/ContainerComponent';
import type { DomEventsMap, TemplateDecl } from '@qimenjs/component-core';
import { Definitions } from '@/composable';
import './select-panel.css';

const SelectPanelComponentDefs: Definitions = {
    options: {
        items: null,
    },
} as const;

class SelectPanelComponent extends ContainerComponent {
    static type = 'select-panel';

    domEvents?: DomEventsMap | undefined = {
        click: {
            path: '[items]',
            handler: '_onItemClick',
            emits: ['select'],
        },
    };

    onAfterInit(): void {
        super.onAfterInit();
        this.addCls('q-select-panel');
    }

    show(): void {
        const anchor = this.anchor ?? this.rawOptions?.anchor ?? this.el!;
        const placement = this.placement ?? this.rawOptions?.placement;
        this._showOverlay({ anchor, placement });
    }

    hide(): void {
        this._hideOverlay();
    }

    _onItemClick(domEvt: any): void {
        const item = domEvt.targetComponent;
        if (!item?.el) return;

        const action = item.el.dataset.action;
        if (action === 'select-option') {
            const value = item.el.dataset.value;
            this.emit('select', { action, value });
        }
    }
}

SelectPanelComponent.define(SelectPanelComponentDefs);

export { SelectPanelComponent };
export type SelectPanelComponentInstance = InstanceType<typeof SelectPanelComponent>;
