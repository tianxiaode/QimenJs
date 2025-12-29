import { GestureEventDescriptor, GestureSemantic } from '../semantic-map';
import { GestureProcessor } from './GestureProcessor';
import { GestureEmit } from './types';

export class SubmitProcessor extends GestureProcessor<'submit'> {
    constructor(
        protected readonly semantic: GestureSemantic,
        protected readonly emit: (event: GestureEmit) => void,
        protected readonly constraints?: GestureEventDescriptor<'submit'>['constraints']
    ) {
        super(semantic, emit, constraints);

        this.handlers = {
            submit: i => {
                this.emitGesture(i.originalEvent);
            },
        };
    }
}