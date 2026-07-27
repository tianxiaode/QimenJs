import type { InitContext } from '../../types/init-context';

export function onAfterInit(ctx: InitContext): void {
    const { instance, props } = ctx;
    instance._templateInitialized = true;
    if (typeof instance.onAfterInit === 'function') {
        instance.onAfterInit(props);
    }
}
