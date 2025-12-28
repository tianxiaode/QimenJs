import { GestureEventDescriptor, GestureSemantic, InputSignal } from '../semantic-map';
import { GestureEmit, GestureInput } from './types';

export abstract class GestureProcessor<S extends GestureSemantic = GestureSemantic> {
    protected handlers: Partial<Record<InputSignal, (input: GestureInput) => void>> = {};

    protected active = false;
    protected startTime = 0;
    protected lastTime = 0;

    protected startX = 0;
    protected startY = 0;
    protected lastX = 0;
    protected lastY = 0;

    constructor(
        protected readonly semantic: GestureSemantic,
        protected readonly emit: (event: GestureEmit) => void,
        protected readonly constraints?: GestureEventDescriptor<S>['constraints']
    ) {}

    handle(input: GestureInput): void {
        this.lastTime = input.time;
        this.handlers[input.signal]?.(input);
    }

    protected start(input: GestureInput) {
        this.active = true;
        this.startTime = input.time;
        this.startX = this.lastX = input.x ?? 0;
        this.startY = this.lastY = input.y ?? 0;
    }

    protected move(input: GestureInput) {
        this.lastX = input.x ?? this.lastX;
        this.lastY = input.y ?? this.lastY;
    }

    protected end() {
        this.reset();
    }

    protected reset() {
        this.active = false;
        this.startTime = 0;
    }

    protected duration(): number {
        return this.lastTime - this.startTime;
    }

    protected distance(): number {
        const dx = this.lastX - this.startX;
        const dy = this.lastY - this.startY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    protected emitGesture(originalEvent?: Event) {
        this.emit({
            semantic: this.semantic,
            originalEvent,
        });
    }
}
