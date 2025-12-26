import { EventScope } from '@orbitjs/event-core';
import { defaultInputDomMap, InputDomMap } from './input-map';
import type { InputType } from './types';

export function bridgeInput<Events extends Record<string, any>>(
    scope: EventScope<Events>,
    target: EventTarget,
    input: InputType,
    handler: (event: Event) => void,
    options?: {
        map?: InputDomMap;
    }
) {
    const map = options?.map ?? defaultInputDomMap;
    const descriptors = map[input];

    if (!descriptors || descriptors.length === 0) {
        return;
    }

    descriptors.forEach(({ type, filter, options }) => {
        const listener = (evt: Event) => {
            if (filter && !filter(evt)) return;
            handler(evt);
        };

        target.addEventListener(type as string, listener, options);

        scope.addCleanup(() => {
            target.removeEventListener(type as string, listener, options);
        });
    });
}

