import { ItemGroupStaticComponent } from '../itemgroup/ItemGroupStaticComponent';
import type { ItemGroupProps } from '../itemgroup/ItemGroupBaseComponent';

export interface ToolbarProps extends ItemGroupProps {}

export let ToolbarComponent = ItemGroupStaticComponent.replace({
    type: 'Toolbar',
    cls: 'q-toolbar',
    itemsCls: 'q-toolbar__items',
    config: { direction: 'horizontal', gap: '4px' },
    body: {},
});
