import { ItemGroupStaticComponent } from '../itemgroup/ItemGroupStaticComponent';
import type { ItemGroupProps } from '../itemgroup/ItemGroupBaseComponent';
import { GroupSelectAbility } from '@qimenjs/component-abilities';

export interface MenuProps extends ItemGroupProps {
    anchor?: HTMLElement;
    placement?: string;
    offset?: number;
}

export let MenuComponent = ItemGroupStaticComponent.replace({
    type: 'Menu',

    config: {
        direction: 'vertical',
        defaultItemType: 'MenuItem',
    },

    tplEvents: {
        itemContainer: {
            $items: {
                MenuItem: { click: { emits: ['click'] }, select: { emits: ['select'] } },
            },
        },
    },
    body: {
        nodes: {
            root: { addCls: 'q-menu' },
            itemContainer: { addCls: 'q-menu__content' },
        },

        onInitState() {
            return {
                _anchor: null as HTMLElement | null,
                _isOpen: false,
            };
        },

        onAfterInit(props?: MenuProps & Record<string, any>): void {
            const self = this as any;
            if (props?.anchor) self._anchor = props.anchor;

            self.initGroupSelect({ defaultMode: 'radio' });
            self.registerGroupItems([...self.items]);

            self.on('select', (data: any) => {
                self.notifyGroupSelect(data.item);
            });
        },

        get itemGroup(): any {
            return this;
        },

        get isOpen(): boolean {
            const self = this as any;
            return self._isOpen;
        },

        open(): void {
            const self = this as any;
            if (self._isOpen) return;
            self.el.style.display = '';
            self._isOpen = true;
        },

        close(): void {
            const self = this as any;
            if (!self._isOpen) return;
            self.el.style.display = 'none';
            self._isOpen = false;
        },

        onBeforeDispose(): void {
            const self = this as any;
            self.close();
            self.clearGroups();
        },
    },
}).with([GroupSelectAbility]);
