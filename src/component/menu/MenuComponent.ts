import { TemplateComponent } from '@qimenjs/component-core';
import { GroupSelectAbility } from '@qimenjs/component-abilities';
import type { Placement } from '@qimenjs/component-core';
import { ItemGroupComponent } from '../itemgroup/ItemGroupComponent';

export interface MenuProps {
    anchor?: HTMLElement;
    placement?: Placement;
    offset?: number;
    itemType?: string;
    items?: Record<string, any>[];
}

const MenuBase = TemplateComponent.withTemplate({
    tpl: {
        tag: 'div',
        children: [{ tag: 'div', name: 'content', className: 'q-menu__content' }],
    },
    body: { type: 'Menu' },
}).with([GroupSelectAbility]);

export class MenuComponent extends MenuBase {
    private _isOpen: boolean = false;
    private _itemGroup: ItemGroupComponent | null = null;

    constructor(props?: MenuProps & Record<string, any>) {
        super();

        this.el.classList.add('q-menu');

        if (props?.anchor) this._anchor = props.anchor;

        this.initGroupSelect({ defaultMode: 'radio' });

        this._itemGroup = new ItemGroupComponent({
            itemType: props?.itemType ?? 'MenuItem',
            direction: 'vertical',
            eventKey: 'item',
            events: ['click', 'select'],
            items: props?.items,
        });

        this.registerGroupItems([...this._itemGroup.items]);

        this._itemGroup.on('item:select', (data: any) => {
            this.notifyGroupSelect(data.item);
        });

        const container = this.nodeMap?.content?.el;
        if (container) {
            container.appendChild(this._itemGroup.el);
        }
    }

    get itemGroup(): ItemGroupComponent | null {
        return this._itemGroup;
    }

    get isOpen(): boolean {
        return this._isOpen;
    }

    open(): void {
        if (this._isOpen) return;
        this.el.style.display = '';
        this._isOpen = true;
    }

    close(): void {
        if (!this._isOpen) return;
        this.el.style.display = 'none';
        this._isOpen = false;
    }

    dispose(): void {
        this.close();
        this.clearGroups();
        if (this._itemGroup) {
            this._itemGroup.dispose();
        }
        super.dispose();
    }
}
