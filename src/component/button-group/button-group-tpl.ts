import type { TplEvents } from '@/component-core/types/tpl-events';

export const BUTTON_GROUP_EVENTS: TplEvents = {
    itemContainer: {
        $items: {
            Toggle: { toggle: { emits: ['toggle'] } },
        },
    },
};
