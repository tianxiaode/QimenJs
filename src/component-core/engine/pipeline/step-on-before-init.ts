import type { InitContext } from '../../types/init-context';

/** 管线步骤：触发 onBeforeInit 生命周期钩子 */
export function onBeforeInit(ctx: InitContext): void {
    const { instance, props } = ctx;
    if (typeof instance.onBeforeInit === 'function') {
        instance.onBeforeInit(props);
    }
}
