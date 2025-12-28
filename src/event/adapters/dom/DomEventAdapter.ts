import { SemanticEvent } from '../semantic-map';
import { BindOptions, EventAdapter } from '../base';
import { EventScope } from '../../core';
import { detectInputCapabilities, InputCapabilities } from '@orbitjs/runtime-env';
import { mouseEventMap, pointerEventMap, touchEventMap } from './domEventMap';

export class DomEventAdapter implements EventAdapter<HTMLElement> {
    private readonly caps = detectInputCapabilities();
    bind(el: HTMLElement, semantic: SemanticEvent, scope: EventScope, options?: BindOptions) {
        const domEvents = resolveDomEvents(semantic, this.caps);

        domEvents.forEach(type => {
            const handler = (e: Event) => {
                if (options?.preventDefault) e.preventDefault();
                if (options?.stopPropagation) e.stopPropagation();

                scope.emit(semantic, e);
            };

            el.addEventListener(type, handler, {
                capture: options?.capture,
                once: options?.once,
            });

            scope.addCleanup(() => {
                el.removeEventListener(type, handler, {
                    capture: options?.capture,
                });
            });
        });
    }
}

function resolveDomEvents(semantic: SemanticEvent, caps: InputCapabilities): string[] {
    if (caps.pointer) {
        return pointerEventMap[semantic] as any ?? [];
    }

    if (caps.touch) {
        return touchEventMap[semantic] ?? [];
    }

    return mouseEventMap[semantic] ?? [];
}
