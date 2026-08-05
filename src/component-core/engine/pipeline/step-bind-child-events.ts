import type { InitContext } from '../../types/init-context';
import { ListensEngine } from '../ListensEngine';

/** 管线步骤：绑定子组件事件订阅 */
export function bindChildEvents(ctx: InitContext): void {
    const { instance } = ctx;
    const listens = instance.constructor.listens ?? instance.listens;
    if (!listens) return;

    ListensEngine.bindNodeEvents(instance, listens);
}
