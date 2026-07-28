import { ItemGroupStaticComponent } from '../itemgroup/ItemGroupStaticComponent';
import type { ItemGroupProps } from '../itemgroup/ItemGroupBaseComponent';
import { GroupSelectAbility } from '@qimenjs/component-abilities';

export interface MenuProps extends ItemGroupProps {
    anchor?: HTMLElement;
    placement?: string;
    offset?: number;
}

class MenuComponent extends ItemGroupStaticComponent {
    static type = 'Menu';

    type = 'Menu';

    onInitState() {
        return {
            ...super.onInitState?.(),
            _anchor: null as HTMLElement | null,
            _isOpen: false,
        };
    }

    onAfterInit(props?: MenuProps & Record<string, any>): void {
        const self = this as any;
        if (props?.anchor) self._anchor = props.anchor;

        super.onAfterInit(props);

        self.initGroupSelect({ defaultMode: 'radio' });
        self.registerGroupItems([...self.items]);

        self.on('select', (data: any) => {
            self.notifyGroupSelect(data.item);
        });
    }

    get itemGroup(): any {
        return this;
    }

    get isOpen(): boolean {
        const self = this as any;
        return self._isOpen;
    }

    open(): void {
        const self = this as any;
        if (self._isOpen) return;
        self.el.style.display = '';
        self._isOpen = true;
    }

    close(): void {
        const self = this as any;
        if (!self._isOpen) return;
        self.el.style.display = 'none';
        self._isOpen = false;
    }

    onBeforeDispose(): void {
        const self = this as any;
        self.close();
        self.clearGroups();
    }
}

MenuComponent.use([GroupSelectAbility]);

export { MenuComponent };
export type MenuComponentInstance = InstanceType<typeof MenuComponent>;
