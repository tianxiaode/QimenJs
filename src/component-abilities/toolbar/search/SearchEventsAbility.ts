/**
 * SearchEventsAbility 搜索事件分发能力
 *
 * 提供搜索事件发射方法，是搜索能力的核心基础层。
 * SearchInputAbility 和 SearchButtonAbility 委托调用此能力发射事件。
 *
 * 事件：
 * - SEARCH_EVENTS.CHANGE: 搜索变更，数据格式 { keyword?, search? }
 * - SEARCH_EVENTS.SUBMIT: 搜索提交，数据格式 { keyword?, search? }
 *
 * 方法：
 * - emitSearchChange(data): 发射搜索变更事件
 * - emitSearchSubmit(data): 发射搜索提交事件
 * - emitSearch(params): 复杂搜索手动触发入口
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import { SEARCH_EVENTS } from '@qimenjs/events';

export const SearchEventsAbility: AbilityDefinition = {
    /**
     * 发射搜索变更事件
     *
     * data 可同时携带 keyword 和 search，实现组合查询
     */
    emitSearchChange(data: { keyword?: string; search?: Record<string, any> }): void {
        this.emit?.(SEARCH_EVENTS.CHANGE, data);
    },

    /**
     * 发射搜索提交事件
     *
     * data 可同时携带 keyword 和 search，实现组合查询
     */
    emitSearchSubmit(data: { keyword?: string; search?: Record<string, any> }): void {
        this.emit?.(SEARCH_EVENTS.SUBMIT, data);
    },

    /**
     * 复杂搜索手动触发入口
     *
     * params 为空时静默返回，非空时发射 searchchange 事件。
     *
     * @param params - 搜索参数对象
     */
    emitSearch(params: Record<string, any>): void {
        if (!params || Object.keys(params).length === 0) return;
        this.emitSearchChange({ search: params });
    },
};
