import { GestureEventDescriptor, GestureSemantic } from '../semantic-map';
import { GestureProcessor } from './GestureProcessor';
import { GestureEmit } from './types';
import { geometry } from '@orbitjs/utils';

export class DoubleTapProcessor extends GestureProcessor<'dblclick'> {
    private lastTapTime = 0;
    private lastTapX = 0;
    private lastTapY = 0;

    constructor(
        protected readonly semantic: GestureSemantic,
        protected readonly emit: (event: GestureEmit) => void,
        protected readonly constraints?: GestureEventDescriptor<'dblclick'>['constraints']
    ) {
        super(semantic, emit, constraints);

        this.handlers = {
            press: input => {
                const now = input.time;
                const maxInterval = this.constraints?.maxInterval ?? 300;
                const maxDistance = this.constraints?.maxDistance ?? 10;

                if (now - this.lastTapTime < maxInterval) {
                    const currentPoint = { x: input.x ?? 0, y: input.y ?? 0 };
                    const lastPoint = { x: this.lastTapX, y: this.lastTapY };
                    if (geometry.isWithinSquare(currentPoint, lastPoint, maxDistance)) {
                        // Double tap detected
                        this.emitGesture(input.originalEvent);
                        this.resetDoubleTap();
                    }
                }

                // Record this tap
                this.lastTapTime = now;
                this.lastTapX = input.x ?? 0;
                this.lastTapY = input.y ?? 0;
            },
        };
    }

    private resetDoubleTap() {
        // Reset double tap state
        this.lastTapTime = 0;
    }
}
