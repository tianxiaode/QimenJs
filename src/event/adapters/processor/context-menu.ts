import { GestureEventDescriptor, GestureSemantic } from '../semantic-map';
import { GestureProcessor } from './base';
import { GestureEmit } from './types';

export class ContextMenuProcessor extends GestureProcessor<'contextmenu'> {
    constructor(
        protected readonly semantic: GestureSemantic,
        protected readonly emit: (event: GestureEmit) => void,
        protected readonly constraints?: GestureEventDescriptor<'contextmenu'>['constraints']
    ) {
        super(semantic, emit, constraints);

        this.handlers = {
            press: input => {
                const allowedButtons = this.constraints?.buttons ?? [2]; // Right mouse button

                if (input.buttons && allowedButtons.includes(input.buttons)) {
                    this.emitGesture(input.originalEvent);
                }
            },
            // Context menu can also be triggered with keyboard (e.g., context menu key or Shift+F10)
            keydown: input => {
                if (input.originalEvent instanceof KeyboardEvent) {
                    const event = input.originalEvent as KeyboardEvent;
                    if (event.key === 'ContextMenu' || (event.key === 'F10' && event.shiftKey)) {
                        this.emitGesture(input.originalEvent);
                    }
                }
            },
        };
    }
}
