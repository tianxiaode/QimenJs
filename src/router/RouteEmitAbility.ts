/**
 * RouteEmitAbility — 路由发送能力
 *
 * 提供路由导航方法，组件声明此能力后可通过 navigate(path) 切换路由。
 * 路由切换由 Router.navigate() 完成，Router 内部通过 emit 发布路由变化事件。
 *
 * 适用于：路由导航组件（RouteNavComponent）等需要触发路由切换的发送方
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import { Router } from './Router';

export const RouteEmitAbility: AbilityDefinition = {
    /**
     * 导航到指定路径
     *
     * 简单调用 Router.navigate() 切换路由，
     * Router 内部会通过 emit 发布路由变化事件。
     *
     * @param path - 目标路径
     * @param replace - 是否替换当前历史记录
     */
    navigate(path: string, replace?: boolean): void {
        this.logger?.debug?.('[RouteEmit] navigate, path =', path, 'replace =', replace);
        Router.getInstance().navigate(path, replace);
    },
};
