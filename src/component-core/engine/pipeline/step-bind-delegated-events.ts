import type { InitContext } from '../../types/init-context';
import { DelegatedEventEngine } from '../DelegatedEventEngine';

export function bindDelegatedEvents(ctx: InitContext): void {
    const { instance } = ctx;
    DelegatedEventEngine.bindDelegatedEvents(instance);
}
