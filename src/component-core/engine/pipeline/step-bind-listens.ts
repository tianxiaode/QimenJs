import type { InitContext } from '../../types/init-context';
import { ListensEngine } from '../ListensEngine';

export function bindListens(ctx: InitContext): void {
    const { instance } = ctx;
    const listens = instance.constructor.listens ?? instance.listens;
    if (!listens) return;
    ListensEngine.bindListens(instance, listens);
}