import { ItemGroupStaticComponent } from '../itemgroup/ItemGroupStaticComponent';
import type { ItemGroupProps } from '../itemgroup/ItemGroupBaseComponent';
import { GroupSelectAbility } from '@qimenjs/component-abilities';
import type { Placement } from '@qimenjs/component-core';

export interface MenuProps extends ItemGroupProps {
    anchor?: HTMLElement;
    placement?: Placement;
    offset?: number;
}

export let MenuComponent = ItemGroupStaticComponent.replace({
    type: 'Menu',
    cls: 'q-menu',
    itemsCls: 'q-menu__content',
    config: {
        direction: 'vertical',
        defaultItemType: 'MenuItem',
        defaultItem: {
            MenuItem: {
                events: { click: { bridges: ['click'] }, select: { bridges: ['select'] } },
            },
        },
    },
    body: {
        onInitState() {
            return {
                _anchor: null as HTMLElement | null,
                _isOpen: false,
            };
        },

        onAfterInit(props?: MenuProps & Record<string, any>): void {
            if (props?.anchor) this._anchor = props.anchor;

            this.initGroupSelect({ defaultMode: 'radio' });
            this.registerGroupItems([...this.items]);

            this.on('select', (data: any) => {
                this.notifyGroupSelect(data.item);
            });
        },

        get itemGroup(): any {
            return this;
        },

        get isOpen(): boolean {
            return this._isOpen;
        },

        open(): void {
            if (this._isOpen) return;
            this.el.style.display = '';
            this._isOpen = true;
        },

        close(): void {
            if (!this._isOpen) return;
            this.el.style.display = 'none';
            this._isOpen = false;
        },

        onBeforeDispose(): void {
            this.close();
            this.clearGroups();
        },
    },
}).with([GroupSelectAbility]);
