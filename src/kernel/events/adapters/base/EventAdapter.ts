import { EventScope } from '../../core/EventScope';
import { GestureSemantic } from '../semantic-map';
import { BindOptions } from './types';

export interface EventAdapter<TTarget = any> {
    bind(target: TTarget, semantic: GestureSemantic, scope: EventScope, options?: BindOptions, source?: any): void;
}
