import { InitContext } from '../../types';

// steps/mount.ts

/**
 * 管道步骤：挂载组件
 *
 * 智能挂载：
 * - 有父组件 → 挂载到父组件插槽
 * - 无父组件 → 挂载到容器
 */
export function mount(ctx: InitContext): void {
    const instance = ctx.instance;
    const { el, options, logger } = instance;
    const { container, parent, slotName } = options;

    logger.debug(`[mount][${instance.id}]`, '挂载中...');

    if (!el) {
        logger.warn(`[mount][${instance.id}]`, '没有 DOM 元素');
        return;
    }

    // 1. 有父组件 → 挂载到插槽
    if (parent) {
        if (!slotName) {
            logger.warn(`[mount][${instance.id}]`, '没有指定插槽名称');
            return;
        }

        parent.mountChild(el, slotName);
        logger.debug(`[mount][${instance.id}]`, `挂载到父组件插槽: ${slotName}`);
        return;
    }

    // 2. 无父组件 → 挂载到容器
    if (!container) {
        logger.warn(`[mount][${instance.id}]`, '没有容器，无法挂载');
        return;
    }
    container.appendChild(el);
    logger.debug(`[mount][${instance.id}]`, '挂载到容器');
}
