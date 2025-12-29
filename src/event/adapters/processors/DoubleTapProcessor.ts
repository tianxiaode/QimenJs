import { GestureEventDescriptor, GestureSemantic } from '../semantic-map';
import { GestureProcessor } from './GestureProcessor';
import { GestureEmit, GestureInput } from './types';
import { validateDoubleTap } from '../utils/validation';

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

                this.logProcessor('debug', 'doubletap_check', {
                    currentTime: now,
                    lastTapTime: this.lastTapTime,
                    currentX: input.x ?? 0,
                    currentY: input.y ?? 0,
                    lastTapX: this.lastTapX,
                    lastTapY: this.lastTapY,
                    maxInterval,
                    maxDistance,
                    timeDiff: now - this.lastTapTime,
                });

                if (
                    validateDoubleTap(
                        now,
                        this.lastTapTime,
                        input.x ?? 0,
                        input.y ?? 0,
                        this.lastTapX,
                        this.lastTapY,
                        maxInterval,
                        maxDistance
                    )
                ) {
                    // Double tap detected
                    this.emitGesture(input.originalEvent);
                    this.resetDoubleTap();

                    this.logProcessor('debug', 'doubletap_detected', {
                        timeDiff: now - this.lastTapTime,
                        distance: Math.sqrt(
                            Math.pow((input.x ?? 0) - this.lastTapX, 2) +
                                Math.pow((input.y ?? 0) - this.lastTapY, 2)
                        ),
                    });
                }

                // Record this tap
                this.lastTapTime = now;
                this.lastTapX = input.x ?? 0;
                this.lastTapY = input.y ?? 0;

                this.logProcessor('debug', 'doubletap_recorded', {
                    recordedTime: now,
                    recordedX: this.lastTapX,
                    recordedY: this.lastTapY,
                });
            },
        };
    }

    private resetDoubleTap() {
        // Reset double tap state
        this.lastTapTime = 0;

        this.logProcessor('debug', 'doubletap_reset', {
            message: 'Double tap state has been reset',
        });
    }
}
