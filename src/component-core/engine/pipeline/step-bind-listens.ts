import type { InitContext } from '../../types/init-context';
import { ListensEngine } from '../ListensEngine';

/** 管线步骤：绑定外部事件订阅 */
export function bindListens(ctx: InitContext): void {
    const { instance } = ctx;
    const listens = instance.constructor.listens ?? instance.listens;
    if (!listens) return;
    ListensEngine.bindListens(instance, listens);
}
