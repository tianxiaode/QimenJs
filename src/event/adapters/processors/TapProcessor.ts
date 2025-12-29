import { GestureEventDescriptor, GestureSemantic } from '../semantic-map';
import { GestureProcessor } from './GestureProcessor';
import { GestureEmit } from './types';
import { validateTap } from '../utils/validation';

export class TapProcessor extends GestureProcessor<'tap'> {
    constructor(
        protected readonly semantic: GestureSemantic,
        protected readonly emit: (event: GestureEmit) => void,
        protected readonly constraints?: GestureEventDescriptor<'tap'>['constraints']
    ) {
        super(semantic, emit, constraints);

        this.handlers = {
            press: i => this.start(i),
            release: i => {
                const duration = this.duration();
                const distance = this.distance();
                const maxDistance = this.constraints?.maxDistance ?? 10;
                const maxDuration = this.constraints?.maxDuration ?? 250;
                const isValid = validateTap(duration, distance, maxDuration, maxDistance);
                if (this.active && isValid) {
                    this.emitGesture(i.originalEvent);
                }

                this.logProcessor('debug', 'end', {
                    isValid,
                    maxDuration,
                    maxDistance,
                    duration,
                    distance,
                });
                this.end();
            },
            cancel: () => this.reset(),
        };
    }
}
