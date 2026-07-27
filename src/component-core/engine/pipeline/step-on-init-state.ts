import type { InitContext } from '../../types/init-context';

export function onInitState(ctx: InitContext): void {
    const { instance } = ctx;
    if (typeof instance.onInitState === 'function') {
        const state = instance.onInitState();
        if (state && typeof state === 'object') {
            Object.assign(instance, state);
        }
    }
}
