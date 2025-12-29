import { GestureEventDescriptor, GestureSemantic, InputSignal } from '../semantic-map';
import { GestureEmit, GestureInput } from './types';
import { geometry } from '@orbitjs/utils';
import { assert } from '@orbitjs/validation';

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
        const x = assert.finite(input.x);
        const y = assert.finite(input.y);

        this.active = true;
        this.startTime = input.time;

        this.startX = this.lastX = x;
        this.startY = this.lastY = y;
    }

    protected move(input: GestureInput) {
        if (input.x != null) {
            this.lastX = assert.finite(input.x);
        }
        if (input.y != null) {
            this.lastY = assert.finite(input.y);
        }
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
        return geometry.distance(
            { x: this.startX, y: this.startY },
            { x: this.lastX, y: this.lastY }
        );
    }

    protected emitGesture(originalEvent?: Event) {
        this.emit({
            semantic: this.semantic,
            originalEvent,
        });
    }
}
