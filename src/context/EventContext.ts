/**
 * 事件上下文
 *
 * 融合了 IEventContext 和 UI EventContext 的统一事件上下文接口。
 * 同时满足传统事件系统（EventBus）和 UI 组件事件系统的需求。
 *
 * @module context/EventContext
 */

import type { BaseMetadata, ExecutionStep } from './base';

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
 * 事件上下文元数据
 */
export interface EventMetadata extends BaseMetadata {
    [key: string]: any;
}

/**
 * 统一事件上下文接口
 *
 * 融合了原 IEventContext（timestamp/busId/scopeId）和
 * UI EventContext（type/sourceType/chain/_refCount/steps/metadata）的所有字段。
 *
 * 字段分为三层：
 * 1. 核心字段（必填）：event/data/source/timestamp/busId/scopeId
 * 2. UI 扩展字段（可选）：type/sourceType/domEvent/chain/_refCount
 * 3. BaseContext 字段（可选）：steps/metadata/error
 *
 * @example
 * ```typescript
 * // 传统 EventBus.emit 自动构建
 * const ctx: EventContext = {
 *     event: 'user:login',
 *     data: { userId: '123' },
 *     source: 'UNKNOWN',
 *     timestamp: Date.now(),
 *     busId: 'bus-001',
 *     scopeId: 'NO_SCOPE',
 * };
 *
 * // UI 组件 emitUI 构建
 * const ctx: EventContext = {
 *     event: 'userTable:selectionChange',
 *     type: 'selectionChange',
 *     source: 'userTable',
 *     sourceType: 'UserTable',
 *     data: { rows: [], selectedCount: 0 },
 *     timestamp: Date.now(),
 *     busId: 'bus-001',
 *     scopeId: 'NO_SCOPE',
 *     chain: undefined,
 *     _refCount: 2,
 *     steps: [],
 *     metadata: {},
 * };
 * ```
 */
export interface EventContext {
    // === 核心字段（IEventContext 原有） ===

    /** 事件名（完整名，如 userTable:selectionChange） */
    event: string;
    /** 事件数据载荷 */
    data: any;
    /** 事件源（谁触发的，传统场景为 Host/EntityManager，UI 场景为 eventKey） */
    source: any;
    /** 事件发生时间 */
    timestamp: number;
    /** 发出事件的总线 ID */
    busId: string;
    /** 发出事件的作用域 ID */
    scopeId: string;

    // === UI 扩展字段（可选） ===

    /** 事件类型（如 selectionChange），标识"发生了什么" */
    type?: string;
    /** 事件源类型（组件类名），标识"什么类型的组件发出的" */
    sourceType?: string;
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

    // === BaseContext 字段（可选） ===

    /** 执行步骤记录 */
    steps?: ExecutionStep[];
    /** 错误信息 */
    error?: any;
    /** 元数据 */
    metadata?: EventMetadata;

    // === 扩展 ===

    /** 允许扩展其他属性 */
    [key: string]: any;
}
