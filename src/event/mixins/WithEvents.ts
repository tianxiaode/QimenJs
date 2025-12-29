import { Constructor } from '@orbitjs/utils';
import { globalEventBus } from '../core/GlobalEventBus';
import { EventHandler } from '../core/types';
import { BindOptions, createEventAdapter, EventAdapter, GestureSemantic } from '../adapters';
import { EventScope } from '../core';

export interface WithEventsPublic {
    on(event: string, handler: EventHandler): () => void;
    once(event: string, handler: EventHandler): void;
    emit(event: string, payload?: any): void;
    bind(target: any, semantic: GestureSemantic, options?: BindOptions): void;
}

// NOTE: TypeScript mixin typing intentionally loosened here
// to avoid TS4094 / TS2322 / TS2797 issues.
// Internal fields are implementation details.
export function WithEvents<TBase extends Constructor>(
    Base: TBase
): abstract new (...args: ConstructorParameters<TBase>) => InstanceType<TBase> & WithEventsPublic {
    return class extends Base {
        private _eventScope: EventScope | undefined;
        private _adapter: EventAdapter | undefined;

        private get eventScope() {
            if (this._eventScope === undefined) {
                this._eventScope = globalEventBus.createEventScope();
            }
            return this._eventScope;
        }

        private get adapter() {
            if (this._adapter === undefined) {
                this._adapter = createEventAdapter();
            }
            return this._adapter;
        }

        on(event: string, handler: EventHandler): () => void {
            return this.eventScope.on(event, handler);
        }

        once(event: string, handler: EventHandler) {
            return this.eventScope.once(event, handler);
        }

        emit(event: string, payload?: any) {
            this.eventScope.emit(event, payload);
        }

        bind(target: any, semantic: GestureSemantic, options?: BindOptions): void {
            this.adapter.bind(target, semantic, this.eventScope, options);
        }

        dispose() {
            super.dispose?.();
            this._eventScope?.dispose();
        }
    } as unknown as Constructor<InstanceType<TBase> & WithEventsPublic>;
}