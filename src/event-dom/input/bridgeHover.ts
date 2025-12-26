import type { EventScope } from '@orbitjs/event-core';
import { bridgeInputToBus } from './bridgeInputToBus';

export function bridgeHover<Events extends Record<string, any>, E extends keyof Events>(
    scope: EventScope<Events>,
    target: EventTarget,
    busEvent: E
) {
    bridgeInputToBus(scope, target, 'hover', busEvent);
}
