import type { InitContext } from '../../types/init-context';
import { DomEventsEngine } from '../DomEventsEngine';

export function bindDomEvents(ctx: InitContext): void {
    const { instance } = ctx;
    DomEventsEngine.bindDomEvents(instance);
}