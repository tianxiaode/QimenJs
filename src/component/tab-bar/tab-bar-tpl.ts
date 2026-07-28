import type { TplEvents } from '@/component-core/types/tpl-events';

export const TAB_BAR_EVENTS: TplEvents = {
    itemContainer: {
        $items: {
            Toggle: { toggle: { emits: ['toggle'] } },
        },
    },
};
