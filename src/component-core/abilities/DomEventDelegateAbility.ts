/**
 * DomEventDelegateAbility — DOM 事件委托能力
 *
 * 在初始化阶段调用 DomEventsEngine.bindDomEvents，将组件的 domEvents 配置
 * 编译为委托规则并绑定到组件 el 上。
 *
 * 支持全委托模式（三层嵌套）和隐式 root 简写，
 * 详见 DomEventsEngine 的文档。
 *
 * @see DomEventsEngine DOM 事件委托引擎实现
 * @see EventForwarder 事件转发公共逻辑
 */

import type { AbilityDefinition } from '@/composable';
import { DomEventsEngine } from '../engine/DomEventsEngine';

/** DOM 事件委托能力，在初始化阶段绑定 domEvents 委托事件 */
export const DomEventDelegateAbility: AbilityDefinition = {
    /**
     * 初始化 DOM 事件委托
     *
     * 编译 domEvents 配置为委托规则，在组件 el 上绑定事件。
     * 支持动态构建：若组件定义了 buildDomEvents(props) 方法，
     * 则将其返回的配置与静态 domEvents 深度合并。
     */
    _initDomEvents(): void {
        DomEventsEngine.bindDomEvents(this);
    },
};
