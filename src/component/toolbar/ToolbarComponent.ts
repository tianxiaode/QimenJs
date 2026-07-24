import { ItemGroupStaticComponent } from '../itemgroup/ItemGroupStaticComponent';
import type { ItemGroupProps } from '../itemgroup/ItemGroupBaseComponent';

export interface ToolbarProps extends ItemGroupProps {}

export let ToolbarComponent = ItemGroupStaticComponent.replace({
    type: 'Toolbar',
    config: { direction: 'horizontal', gap: '4px' },
    body: {
        nodes: {
            root: { addCls: 'q-toolbar' },
            itemContainer: { addCls: 'q-toolbar__items' },
        },
    },
});
