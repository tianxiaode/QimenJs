import { ItemGroupStaticComponent } from '../itemgroup/ItemGroupStaticComponent';
import type { ItemGroupProps } from '../itemgroup/ItemGroupBaseComponent';

export interface ToolbarProps extends ItemGroupProps {}

export let ToolbarComponent = ItemGroupStaticComponent.replace({
    type: 'Toolbar',
    config: { direction: 'horizontal', gap: '4px' },
    tplEvents: {
        itemContainer: {
            $items: {
                Button: { click: { emits: ['action'], keyProp: 'name' } },
                Input: {
                    input: { emits: ['inputChange'], keyProp: 'name', data: ['getFormValue'] },
                },
                NumberInput: {
                    input: { emits: ['inputChange'], keyProp: 'name', data: ['getFormValue'] },
                },
                Select: {
                    'select:change': {
                        emits: ['selectChange'],
                        keyProp: 'name',
                        data: ['getFormValue'],
                    },
                },
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
