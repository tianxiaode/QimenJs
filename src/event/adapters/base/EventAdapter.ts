import { SemanticEvent } from '../../semantic';
import { EventScope } from '../../core/EventScope';
import { BindOptions } from './types';

export interface EventAdapter<TTarget = any> {
    bind(target: TTarget, semantic: SemanticEvent, scope: EventScope, options?: BindOptions): void;
}
