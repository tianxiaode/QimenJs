import { GestureEventDescriptor, GestureSemantic } from '../semantic-map';
import { GestureProcessor } from './GestureProcessor';
import { GestureEmit, GestureInput } from './types';

export class LongPressProcessor extends GestureProcessor<'longpress'> {
    private timer: any = null;

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

        this.timer = setTimeout(() => {
            if (this.active && this.distance() <= maxDistance) {
                this.emitGesture(input.originalEvent);
                this.reset();
            }
        }, minDuration);
    };

    private onMove = (input: GestureInput) => {
        if (!this.active) return;

        this.move(input);

        const maxDistance = this.constraints?.maxDistance ?? 10;
        if (this.distance() > maxDistance) {
            this.cancel();
        }
    };

    private cancel = () => {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        this.reset();
    };
}
