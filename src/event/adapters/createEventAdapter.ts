// event-adapter/createEventAdapter.ts

import {
    baseMap,
    pointerMap,
    touchMap,
    mouseMap,
    keyboardMap,
    resolveInputEventMap,
    gestureEventMap,
} from './semantic-map';
import { EventAdapter } from './base';
import { DomEventAdapter } from './dom';

export function createEventAdapter(): EventAdapter {
    const inputEventMap = resolveInputEventMap({
        base: baseMap,
        pointer: pointerMap,
        touch: touchMap,
        mouse: mouseMap,
        keyboard: keyboardMap,
    });

    return new DomEventAdapter(inputEventMap, gestureEventMap);
}
