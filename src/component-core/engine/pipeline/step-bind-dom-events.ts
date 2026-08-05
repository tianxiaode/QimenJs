import type { InitContext } from '../../types/init-context';
import { DomEventsEngine } from '../DomEventsEngine';

/** 管线步骤：绑定 DOM 委托事件 */
export function bindDomEvents(ctx: InitContext): void {
    const { instance } = ctx;
    DomEventsEngine.bindDomEvents(instance);
}
