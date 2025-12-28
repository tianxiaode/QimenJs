// input/maps/resolve.ts
import { detectInputCapabilities } from '@orbitjs/runtime-env';
import { InputEventMap } from './types';

export function resolveInputEventMap(maps: {
    base: InputEventMap;
    pointer?: InputEventMap;
    touch?: InputEventMap;
    mouse?: InputEventMap;
    keyboard?: InputEventMap;
}): InputEventMap {
    const cap = detectInputCapabilities();

    const result: InputEventMap = {
        ...maps.base,
    };

    if (cap.pointer && maps.pointer) {
        Object.assign(result, maps.pointer);
    } else if (cap.touch && maps.touch) {
        Object.assign(result, maps.touch);
    } else if (maps.mouse) {
        Object.assign(result, maps.mouse);
    }

    if (maps.keyboard) {
        Object.assign(result, maps.keyboard);
    }

    return result;
}
