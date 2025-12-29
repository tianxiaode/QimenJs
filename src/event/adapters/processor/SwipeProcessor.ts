import { GestureEventDescriptor, GestureSemantic } from '../semantic-map';
import { GestureProcessor } from './GestureProcessor';
import { GestureEmit, GestureInput } from './types';

export class SwipeProcessor extends GestureProcessor<'swipe'> {
    constructor(
        protected readonly semantic: GestureSemantic,
        protected readonly emit: (event: GestureEmit) => void,
        protected readonly constraints?: GestureEventDescriptor<'swipe'>['constraints']
    ) {
        super(semantic, emit, constraints);

        this.handlers = {
            press: input => {
                this.start(input);
            },
            move: input => {
                if (!this.active) return;

                this.move(input);
            },
            release: input => {
                if (!this.active) return;

                const minDistance = this.constraints?.minDistance ?? 30;
                const maxDuration = this.constraints?.maxDuration ?? 1000;
                const minVelocity = this.constraints?.minVelocity ?? 0.5;

                const duration = this.duration();
                const distance = this.distance();

                if (duration < maxDuration && distance >= minDistance) {
                    const velocity = distance / duration;
                    if (velocity >= minVelocity) {
                        this.emitGesture(input.originalEvent);
                    }
                }

                this.reset();
            },
            cancel: () => {
                this.reset();
            },
        };
    }
}
