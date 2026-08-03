import type { InitContext } from '../../types/init-context';
import { ListensEngine } from '../ListensEngine';

export function bindChildEvents(ctx: InitContext): void {
    const { instance } = ctx;
    const listens = instance.constructor.listens ?? instance.listens;
    if (!listens) return;

    ListensEngine.bindNodeEvents(instance, listens);
}
