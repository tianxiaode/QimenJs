import type { InitContext } from '../../types/init-context';

export function onBeforeInit(ctx: InitContext): void {
    const { instance, props } = ctx;
    if (typeof instance.onBeforeInit === 'function') {
        instance.onBeforeInit(props);
    }
}
