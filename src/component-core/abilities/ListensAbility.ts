/**
 * ListensAbility — 事件订阅能力
 *
 * 在初始化阶段调用 ListensEngine 绑定组件的 listens 配置。
 * 支持两种订阅：
 * - 外部事件（source/entity/system/route/file）— 不依赖子组件实例
 * - 子组件节点事件（node）— 依赖 nodeMap 已实例化
 *
 * 统一支持本地监听 + EventForwarder 六路转发。
 *
 * @see ListensEngine 统一事件订阅引擎实现
 * @see EventForwarder 事件转发公共逻辑
 */

import type { AbilityDefinition } from '@/composable';
import { ListensEngine } from '../engine/ListensEngine';

/** 事件订阅能力，在初始化阶段绑定 listens 事件订阅 */
export const ListensAbility: AbilityDefinition = {
    /**
     * 初始化事件订阅
     *
     * 绑定外部事件订阅（source/entity/system/route/file）和子组件节点事件（node）。
     * 外部事件绑定不依赖子组件实例，节点事件绑定依赖 nodeMap 已就绪。
     */
    _initListens(): void {
        const listens = this.listens;
        if (!listens?.length) return;

        ListensEngine.bindListens(this, listens);
        ListensEngine.bindNodeEvents(this, listens);
    },
};
