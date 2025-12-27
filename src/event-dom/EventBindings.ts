import type { EventScope } from '@/event';
import { createEventScope, AppEvents } from '@/event'
import type { InputType } from './';
import { on as baseOn } from './events';

type BindOptions<Events> = {
    emit?: boolean | keyof Events;
};

export class EventBindings<Events extends Record<string, any> = any> {
    private readonly scope: EventScope<AppEvents>;

    constructor(scope?: EventScope<AppEvents>) {
        this.scope = scope ?? createEventScope();
    }

    on(
        target: EventTarget,
        input: InputType,
        handler: ((evt: Event) => void) | null,
        options?: BindOptions<Events>
    ): void {
        baseOn<Events>(target, input, handler, {
            scope: this.scope,
            emit: options?.emit,
        });
    }

    once(
        target: EventTarget,
        input: InputType,
        handler: (evt: Event) => void,
        options?: BindOptions<Events>
    ): void {
        let called = false;

        this.on(
            target,
            input,
            evt => {
                if (called) return;
                called = true;
                handler(evt);
                // 交给 scope 自动清理
            },
            options
        );
    }

    dispose(): void {
        this.scope.dispose();
    }
}
