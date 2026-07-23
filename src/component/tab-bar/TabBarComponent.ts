import { ItemGroupPooledComponent } from '../itemgroup/ItemGroupPooledComponent';
import type { ItemGroupProps } from '../itemgroup/ItemGroupBaseComponent';

export interface TabBarProps extends ItemGroupProps {
    selectedIndex?: number;
}

export let TabBarComponent = ItemGroupPooledComponent.replace({
    type: 'TabBar',
    cls: 'q-tab-bar',
    itemsCls: 'q-tab-bar__items',
    config: {
        direction: 'horizontal',
        gap: '0',
        defaultItemType: 'Toggle',
        defaultItem: {
            Toggle: { events: { toggle: { bridges: ['toggle'] } } },
        },
    },
    body: {
        onInitState() {
            return {
                _selectedIndex: -1,
            };
        },

        onAfterInit(props?: TabBarProps): void {
            const self = this as any;
            self.on('toggle', (data: any) => self._onItemToggle(data));

            if (props?.selectedIndex !== undefined && props.selectedIndex >= 0) {
                self.selectAt(props.selectedIndex, true);
            }
        },

        get selectedIndex(): number {
            const self = this as any;
            return self._selectedIndex;
        },

        selectAt(index: number, silent: boolean = false): void {
            const self = this as any;
            if (index < 0 || index >= self.count) return;
            if (index === self._selectedIndex) return;

            if (self._selectedIndex >= 0 && self._selectedIndex < self.count) {
                const prevItem = self.getAt(self._selectedIndex);
                if (prevItem) prevItem.pressed = false;
            }

            const newItem = self.getAt(index);
            if (newItem) newItem.pressed = true;
            self._selectedIndex = index;

            if (!silent) self.emit('select', { index });
        },

        _onItemToggle(data: any): void {
            const self = this as any;
            const index = data?.index;
            if (index === undefined) return;
            const item = self.getAt(index);
            if (!item) return;
            if (item.pressed) self.selectAt(index);
            else item.pressed = true;
        },

        onUpdated(props?: Record<string, any>): void {
            const self = this as any;
            if (props?.selectedIndex !== undefined) self.selectAt(props.selectedIndex);
        },
    },
});
