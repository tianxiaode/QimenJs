import { ItemGroupComponent } from '../itemgroup/ItemGroupComponent';
import type { ItemGroupProps } from '../itemgroup/ItemGroupComponent';

export interface ToolbarProps extends ItemGroupProps {}

export let ToolbarComponent = ItemGroupComponent.replace({
    type: 'Toolbar',
    cls: 'q-toolbar',
    itemsCls: 'q-toolbar__items',
    config: { direction: 'horizontal', gap: '4px' },
    body: {},
});
