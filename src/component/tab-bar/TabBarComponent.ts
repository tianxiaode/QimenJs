import { ItemGroupComponent } from '../itemgroup/ItemGroupComponent';
import type { ItemGroupProps } from '../itemgroup/ItemGroupComponent';

export interface TabBarProps extends ItemGroupProps {
    selectedIndex?: number;
}

const TabBarBase = ItemGroupComponent.withTemplate({
    tpl: {
        tag: 'div',
        className: 'q-tab-bar',
        children: [{ tag: 'div', name: 'items', className: 'q-tab-bar__items' }],
    },
    body: { type: 'TabBar' },
});

export class TabBarComponent extends TabBarBase {
    private _selectedIndex: number = -1;

    constructor(props?: TabBarProps) {
        super(props);

        this._initItemGroupComponent({
            itemType: 'Toggle',
            eventKey: 'tab',
            events: ['toggle'],
            direction: props?.direction ?? 'horizontal',
            gap: props?.gap ?? '0',
            items: props?.items,
        });

        this.on('tab:toggle', (data: any) => this._onItemToggle(data));

        if (props?.selectedIndex !== undefined && props.selectedIndex >= 0) {
            this.selectAt(props.selectedIndex, true);
        }
    }

    get selectedIndex(): number {
        return this._selectedIndex;
    }

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
    }

    _onItemToggle(data: any): void {
        const index = data?.index;
        if (index === undefined) return;
        const item = this.getAt(index);
        if (!item) return;
        if (item.pressed) this.selectAt(index);
        else item.pressed = true;
    }

    update(props?: Record<string, any>): void {
        super.update(props);
        if (props?.selectedIndex !== undefined) this.selectAt(props.selectedIndex);
    }
}
