import { GestureEventDescriptor, GestureSemantic } from '../semantic-map';
import { GestureProcessor } from './base';
import { GestureEmit } from './types';

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
                if (
                    this.active &&
                    this.duration() <= (this.constraints?.maxDuration ?? 250) &&
                    this.distance() <= (this.constraints?.maxDistance ?? 10)
                ) {
                    this.emitGesture(i.originalEvent);
                }
                this.end();
            },
            cancel: () => this.reset(),
        };
    }
}