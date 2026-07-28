import type { TplEvents } from '@/component-core/types/tpl-events';

export const ACCORDION_EVENTS: TplEvents = {
    itemContainer: {
        $items: {
            Panel: { click: { emits: ['click'] } },
        },
    },
};
