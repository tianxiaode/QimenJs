import { GestureEventDescriptor, GestureSemantic } from '../semantic-map';
import { GestureProcessor } from './base';
import { GestureEmit, GestureInput } from './types';

export class HoverProcessor extends GestureProcessor<'hover'> {
    private hoverTimer: any = null;

    constructor(
        protected readonly semantic: GestureSemantic,
        protected readonly emit: (event: GestureEmit) => void,
        protected readonly constraints?: GestureEventDescriptor<'hover'>['constraints']
    ) {
        super(semantic, emit, constraints);

        this.handlers = {
            enter: input => {
                const delay = this.constraints?.delay ?? 0;

                this.hoverTimer = setTimeout(() => {
                    this.emitGesture(input.originalEvent);
                }, delay);
            },
            leave: input => {
                this.cleanup();
            },
        };
    }

    private cleanup() {
        if (this.hoverTimer) {
            clearTimeout(this.hoverTimer);
            this.hoverTimer = null;
        }
    }
}
