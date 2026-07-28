import type { TplEvents } from '@/component-core/types/tpl-events';

export const MENU_EVENTS: TplEvents = {
    itemContainer: {
        $items: {
            MenuItem: { click: { emits: ['click'] }, select: { emits: ['select'] } },
        },
    },
};
