import type { InitContext } from '../../types/init-context';
import { ChildEventsEngine } from '../ChildEventsEngine';

export function bindChildEvents(ctx: InitContext): void {
    const { instance } = ctx;
    const listens = instance.constructor.listens ?? instance.listens;
    if (!listens) return;

    const childEvents = ChildEventsEngine.extractChildEvents(listens);
    if (!childEvents) return;

    ChildEventsEngine.bindChildEvents(instance, childEvents);
}
