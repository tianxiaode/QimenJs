/**
 * UI 事件上下文
 *
 * 继承 BaseContext，为 UI 组件事件系统提供专用的上下文结构。
 * 包含事件标识、来源追踪、数据载荷、事件链等字段。
 *
 * @module events/EventContext
 */

import type { BaseContext } from '@/context';

/**
 * 事件链链接
 *
 * 记录事件传播路径中的单个节点，用于追踪事件的来源链
 */
export interface EventChainLink {
    /** 完整事件名（eventKey:type 格式） */
    event: string;
    /** 事件类型（如 selectionChange） */
    type: string;
    /** 事件源标识（组件 eventKey） */
    source: string;
    /** 事件源类型（组件类名） */
    sourceType: string;
}

/**
 * UI 事件上下文接口
 *
 * 继承 BaseContext 的 steps/metadata/error 结构，
 * 增加事件系统专用字段：事件标识、来源追踪、数据载荷、事件链、引用计数。
 *
 * 生命周期：
 * 1. emitUI() 创建 EventContext，设置 _refCount = handlers.size
 * 2. 每个 handler 执行完毕后 _refCount--
 * 3. _refCount 归零时触发自动清理（deepNullify data）
 *
 * @example
 * ```typescript
 * const ctx: EventContext = {
 *     // BaseContext 字段
 *     steps: [],
 *     metadata: {},
 *     // EventContext 专用字段
 *     event: 'userTable:selectionChange',
 *     type: 'selectionChange',
 *     source: 'userTable',
 *     sourceType: 'UserTable',
 *     data: { rows: [], selectedCount: 0 },
 *     chain: undefined,
 *     _refCount: 2,
 * };
 * ```
 */
export interface EventContext extends BaseContext {
    /** 完整事件名（eventKey:type 格式，如 userTable:selectionChange） */
    event: string;
    /** 事件类型（如 selectionChange），标识"发生了什么" */
    type: string;
    /** 事件源标识（组件 eventKey），标识"谁发出的" */
    source: string;
    /** 事件源类型（组件类名），标识"什么类型的组件发出的" */
    sourceType: string;
    /** 事件数据载荷（深拷贝后的结构化数据） */
    data: any;
    /** 原始 DOM 事件（可选，仅 DOM 事件场景） */
    domEvent?: Event;
    /** 事件传播链（记录事件从源头到当前的传播路径） */
    chain?: EventChainLink[];
    /**
     * 引用计数（框架内部使用）
     *
     * 初始值 = handlers.size，每个 handler 完成后递减，
     * 归零时触发自动清理。异步 handler 通过 Promise 检测延迟递减。
     */
    _refCount?: number;
}
