import type { InitContext } from '../../types/init-context';

/** 管线步骤：触发 onAfterInit 生命周期钩子 */
export function onAfterInit(ctx: InitContext): void {
    const { instance, props } = ctx;
    instance._templateInitialized = true;
    if (typeof instance.onAfterInit === 'function') {
        instance.onAfterInit(props);
    }
}
