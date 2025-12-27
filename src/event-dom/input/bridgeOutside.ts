import type { EventScope } from '@/event';

export function bridgeOutside<Events extends Record<string, any>, E extends keyof Events>(
    scope: EventScope<Events>,
    target: HTMLElement,
    busEvent: E
) {
    const listener = (e: MouseEvent) => {
        if (!target.contains(e.target as Node)) {
            scope.emit(busEvent, e as Events[E]);
        }
    };

    document.addEventListener('mousedown', listener);

    scope.addCleanup(() => {
        document.removeEventListener('mousedown', listener);
    });
}
