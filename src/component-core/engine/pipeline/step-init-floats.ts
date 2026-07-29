/**
 * step-init-floats.ts — FINALIZE 阶段：初始化浮层配置
 *
 * 读取组件实例的 floats 定义，通过组件的 overlayEmit 发送 INIT 事件，
 * 由 OverlayDispatchCenter 注册浮层定义、绑定 trigger 事件、处理 trigger: 'always' 等。
 *
 * floats 在 body 中声明（category: 'init'），编译时挂为类静态属性，
 * 运行时通过此 step 将配置传递给 OverlayDispatchCenter。
 *
 * 此 step 在 onAfterInit 之前执行，确保浮层在组件 onAfterInit 时已可用。
 */

import type { InitContext } from '../../types/init-context';
import { EventContextBuilder } from '@/context';
import { OVERLAY_ACTIONS } from '@/events/overlay-events';
import { getId } from '@/utils/string/id';

export function initFloats(ctx: InitContext): void {
    const { instance } = ctx;

    const floats = (instance.constructor as any).floats ?? instance.floats;
    if (!floats || typeof floats !== 'object') return;

    if (!instance.id) {
        instance.id = instance.props?.id || getId('cmp');
    }

    const componentId = instance.id;

    instance.overlayEmit(
        EventContextBuilder.create()
            .withEvent(`overlay:${componentId}:${OVERLAY_ACTIONS.INIT}`)
            .withType(OVERLAY_ACTIONS.INIT)
            .withSource(componentId)
            .withData({ component: instance, floats })
            .build()
    );
}
