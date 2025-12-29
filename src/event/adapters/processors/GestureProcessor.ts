import { GestureEventDescriptor, GestureSemantic, InputSignal } from '../semantic-map';
import { GestureEmit, GestureInput } from './types';
import { geometry } from '@orbitjs/utils';
import { assert } from '@orbitjs/validation';
import { ILogger, LogLevel, Logger } from '@orbitjs/logger';
import { string } from '@orbitjs/utils';

export abstract class GestureProcessor<S extends GestureSemantic = GestureSemantic> {
    protected handlers: Partial<Record<InputSignal, (input: GestureInput) => void>> = {};

    protected active = false;

    protected startTime = 0;
    protected lastTime = 0;

    protected startX = 0;
    protected startY = 0;
    protected lastX = 0;
    protected lastY = 0;
    
    private readonly processorId = string.getId('gesture-processor');
    private readonly logger: ILogger;

    constructor(
        protected readonly semantic: GestureSemantic,
        protected readonly emit: (event: GestureEmit) => void,
        protected readonly constraints?: GestureEventDescriptor<S>['constraints']
    ) {
        this.logger = Logger.for(`gesture.${this.semantic}`);
    }

    // --- 内置日志方法 ---
    protected logProcessor(level: LogLevel, action: string, data?: Record<string, any>) {
        this.logger[level](`[gesture.processor] ${action}`, {
            processorId: this.processorId,
            semantic: this.semantic,
            ...data,
        });
    }

    handle(input: GestureInput): void {
        this.logProcessor('debug', 'input_received', {
            signal: input.signal,
            x: input.x,
            y: input.y,
            time: input.time
        });
        
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
        
        this.logProcessor('debug', 'gesture_started', {
            x,
            y,
            time: input.time
        });
    }

    protected move(input: GestureInput) {
        if (input.x != null) {
            this.lastX = assert.finite(input.x);
        }
        if (input.y != null) {
            this.lastY = assert.finite(input.y);
        }
        
        this.logProcessor('debug', 'gesture_moved', {
            lastX: this.lastX,
            lastY: this.lastY
        });
    }

    protected end() {
        this.logProcessor('debug', 'gesture_ended', {
            duration: this.duration(),
            distance: this.distance()
        });
        
        this.reset();
    }

    protected reset() {
        this.active = false;
        this.startTime = 0;
        
        this.logProcessor('debug', 'gesture_reset');
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
        this.logProcessor('info', 'gesture_emitted', { semantic: this.semantic });
        this.emit({
            semantic: this.semantic,
            originalEvent,
        });
    }
}