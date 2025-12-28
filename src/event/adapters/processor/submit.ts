import { GestureEventDescriptor, GestureSemantic } from '../semantic-map';
import { GestureProcessor } from './base';
import { GestureEmit } from './types';

export class SubmitProcessor extends GestureProcessor<'submit'> {
    constructor(
        protected readonly semantic: GestureSemantic,
        protected readonly emit: (event: GestureEmit) => void,
        protected readonly constraints?: GestureEventDescriptor<'submit'>['constraints']
    ) {
        super(semantic, emit, constraints);

        this.handlers = {
            keydown: (input) => {
                if (input.originalEvent instanceof KeyboardEvent) {
                    const event = input.originalEvent as KeyboardEvent;
                    if (event.key === 'Enter' && !event.isComposing) {
                        this.emitGesture(input.originalEvent);
                    }
                }
            },
            press: (input) => {
                // For form elements like buttons, the submit gesture can also be triggered by clicking
                if (input.originalEvent instanceof MouseEvent) {
                    this.emitGesture(input.originalEvent);
                }
            }
        };
    }
}