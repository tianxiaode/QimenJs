import type { TplEvents } from '@/component-core/types/tpl-events';

export const ENTITY_TOOLBAR_EVENTS: TplEvents = {
    itemContainer: {
        $items: {
            Button: {
                click: {
                    emits: ['action'],
                    entities: true,
                    bridges: ['action'],
                },
            },
            Input: {
                input: {
                    emits: ['inputChange'],
                },
            },
            NumberInput: {
                input: {
                    emits: ['inputChange'],
                },
            },
            Select: {
                'select:change': {
                    emits: ['selectChange'],
                },
            },
        },
    },
};
