import { GestureEventDescriptor, GestureSemantic } from '../semantic-map';
import { GestureProcessor } from './GestureProcessor';
import { GestureEmit, GestureInput } from './types';
import { validateLongPress } from '../utils/validation';
import { time } from '@orbitjs/utils';

export class LongPressProcessor extends GestureProcessor<'longpress'> {
    private timer: time.Cancelable | null = null;

    constructor(
        protected readonly semantic: GestureSemantic,
        protected readonly emit: (event: GestureEmit) => void,
        protected readonly constraints?: GestureEventDescriptor<'longpress'>['constraints']
    ) {
        super(semantic, emit, constraints);

        this.handlers = {
            press: this.onPress,
            move: this.onMove,
            release: this.cancel,
            cancel: this.cancel,
        };
    }

    private onPress = (input: GestureInput) => {
        this.start(input);

        const minDuration = this.constraints?.minDuration ?? 500;
        const maxDistance = this.constraints?.maxDistance ?? 10;

        this.timer = time.after(minDuration, () => {
            if (
                this.active &&
                validateLongPress(this.startX, this.startY, this.lastX, this.lastY, maxDistance)
            ) {
                this.emitGesture(input.originalEvent);
                this.reset();
            }
        });

        this.logProcessor('debug', 'longpress_start', {
            minDuration,
            maxDistance,
        });
    };

    private onMove = (input: GestureInput) => {
        if (!this.active) return;

        this.move(input);

        const maxDistance = this.constraints?.maxDistance ?? 10;
        const isValid = validateLongPress(
            this.startX,
            this.startY,
            this.lastX,
            this.lastY,
            maxDistance
        );

        this.logProcessor('debug', 'longpress_move', {
            maxDistance,
            isValid,
        });

        if (!isValid) {
            this.cancel();
        }
    };

    private cancel = () => {
        if (this.timer) {
            this.timer.cancel();
            this.timer = null;
        }
        this.reset();
    };
}
