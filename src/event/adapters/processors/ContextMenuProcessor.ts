import { GestureEventDescriptor, GestureSemantic } from '../semantic-map';
import { GestureProcessor } from './GestureProcessor';
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

                this.logProcessor('debug', 'contextmenu_press', {
                    buttons: input.buttons,
                    allowedButtons,
                    isAllowed: input.buttons && allowedButtons.includes(input.buttons),
                });

                if (input.buttons && allowedButtons.includes(input.buttons)) {
                    this.emitGesture(input.originalEvent);

                    this.logProcessor('debug', 'contextmenu_emitted', {
                        button: input.buttons,
                        originalEvent: input.originalEvent?.type,
                    });
                }
            },
            // Context menu can also be triggered with keyboard (e.g., context menu key or Shift+F10)
            keydown: input => {
                if (input.originalEvent instanceof KeyboardEvent) {
                    const event = input.originalEvent as KeyboardEvent;
                    const isContextMenuKey =
                        event.key === 'ContextMenu' || (event.key === 'F10' && event.shiftKey);

                    this.logProcessor('debug', 'contextmenu_keydown', {
                        key: event.key,
                        shiftKey: event.shiftKey,
                        isContextMenuKey,
                    });

                    if (isContextMenuKey) {
                        this.emitGesture(input.originalEvent);

                        this.logProcessor('debug', 'contextmenu_emitted', {
                            key: event.key,
                            shiftKey: event.shiftKey,
                            originalEvent: input.originalEvent.type,
                        });
                    }
                }
            },
        };
    }
}
