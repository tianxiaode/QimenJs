import { ItemGroupStaticComponent } from '../itemgroup/ItemGroupStaticComponent';
import type { ItemGroupProps } from '../itemgroup/ItemGroupBaseComponent';

export interface ToolbarProps extends ItemGroupProps {}

export let ToolbarComponent = ItemGroupStaticComponent.replace({
    type: 'Toolbar',
    config: { direction: 'horizontal', gap: '4px' },
    tplEvents: {
        itemContainer: {
            $items: {
                Button: { click: { emits: ['action'] } },
                Input: { input: { emits: ['inputChange'] } },
                NumberInput: { input: { emits: ['inputChange'] } },
                Select: { 'select:change': { emits: ['selectChange'] } },
            },
        },
    },
    body: {
        nodes: {
            root: { addCls: 'q-toolbar' },
            itemContainer: { addCls: 'q-toolbar__items' },
        },
    },
});

export type ToolbarComponent = InstanceType<typeof ToolbarComponent>;
