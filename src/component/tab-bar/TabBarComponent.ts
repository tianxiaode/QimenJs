import { ItemGroupComponent } from '../itemgroup/ItemGroupComponent';
import type { ItemGroupProps } from '../itemgroup/ItemGroupComponent';

export interface TabBarProps extends ItemGroupProps {
    selectedIndex?: number;
}

export let TabBarComponent = ItemGroupComponent.replace({
    type: 'TabBar',
    cls: 'q-tab-bar',
    itemsCls: 'q-tab-bar__items',
    config: {
        direction: 'horizontal',
        gap: '0',
        itemType: 'Toggle',
        eventKey: 'tab',
        events: ['toggle'],
    },
    body: {
        _selectedIndex: -1,

        onAfterInit(props?: TabBarProps): void {
            this.on('tab:toggle', (data: any) => this._onItemToggle(data));

            if (props?.selectedIndex !== undefined && props.selectedIndex >= 0) {
                this.selectAt(props.selectedIndex, true);
            }
        },

        get selectedIndex(): number {
            return this._selectedIndex;
        },

        selectAt(index: number, silent: boolean = false): void {
            if (index < 0 || index >= this.count) return;
            if (index === this._selectedIndex) return;

            if (this._selectedIndex >= 0 && this._selectedIndex < this.count) {
                const prevItem = this.getAt(this._selectedIndex);
                if (prevItem) prevItem.pressed = false;
            }

            const newItem = this.getAt(index);
            if (newItem) newItem.pressed = true;
            this._selectedIndex = index;

            if (!silent) this.emit('select', { index }, { source: 'tab' });
        },

        _onItemToggle(data: any): void {
            const index = data?.index;
            if (index === undefined) return;
            const item = this.getAt(index);
            if (!item) return;
            if (item.pressed) this.selectAt(index);
            else item.pressed = true;
        },

        onUpdated(props?: Record<string, any>): void {
            if (props?.selectedIndex !== undefined) this.selectAt(props.selectedIndex);
        },
    },
});
