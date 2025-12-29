import { GestureEventDescriptor, GestureSemantic } from '../semantic-map';
import { GestureProcessor } from './GestureProcessor';
import { GestureEmit } from './types';

export class HoverProcessor extends GestureProcessor<'hover'> {
    constructor(
        protected readonly semantic: GestureSemantic,
        protected readonly emit: (event: GestureEmit) => void,
        protected readonly constraints?: GestureEventDescriptor<'hover'>['constraints']
    ) {
        super(semantic, emit, constraints);

        this.handlers = {
            enter: i => {
                this.emitGesture(i.originalEvent);
            },
            leave: i => {
                this.emitGesture(i.originalEvent);
            },
        };
    }
}
