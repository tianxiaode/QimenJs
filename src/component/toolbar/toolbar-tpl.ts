import type { TplEvents } from '@/component-core/types/tpl-events';

export const TOOLBAR_EVENTS: TplEvents = {
    itemContainer: {
        $items: {
            Button: { click: { emits: ['action'] } },
            Input: { input: { emits: ['inputChange'] } },
            NumberInput: { input: { emits: ['inputChange'] } },
            Select: { 'select:change': { emits: ['selectChange'] } },
        },
    },
};
