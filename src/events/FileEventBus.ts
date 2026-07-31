/**
 * FileEventBus 文件事件总线
 *
 * 统一管理所有文件操作（上传/下载/校验/哈希）反馈事件的发送和监听，
 * 使用独立的 eventScope，与组件事件、桥接事件、实体事件、浮层事件互不干扰。
 *
 * 设计说明：
 * - 采用"直接 API + 反馈总线"非对称模式：组件命令直接调用 FileDispatchCenter，
 *   中心执行后通过本总线广播反馈事件。
 * - 多个组件可订阅同一 fileKey 的反馈事件，从而感知同一通道的状态变化
 *   （如拖拽上传区 + 文件列表组件共享同一通道）。
 *
 * 事件名编码：file:{fileKey}:{action}
 * 事件数据由 FileDispatchCenter 通过 EventContextBuilder 构建。
 *
 * @example
 * ```ts
 * const bus = FileEventBus.getInstance();
 *
 * // 组件侧订阅反馈（fileKey 标识通道）
 * const off = bus.fileOn('avatars', FILE_FEEDBACK_EVENTS.UPLOADED, (data) => {
 *     console.log('文件上传完成:', data);
 * });
 *
 * // 调度中心侧发送反馈
 * bus.fileEmit(
 *     EventContextBuilder.create()
 *         .withEvent(`file:avatars:uploaded`)
 *         .withType(FILE_FEEDBACK_EVENTS.UPLOADED)
 *         .withSource('avatars')
 *         .withSourceType('FileDispatchCenter')
 *         .withData({ item, result })
 *         .build()
 * );
 * ```
 */

import { globalEventBus } from './GlobalEventBus';
import type { IEventScope } from './types';
import type { EventContext } from '@/context';

import { ILogger, Logger } from '@qimenjs/logger';

function encodeFileEvent(fileKey: string, action: string): string {
    return `file:${fileKey}:${action}`;
}

export class FileEventBus {
    private static instance: FileEventBus;

    private readonly fileScope: IEventScope;
    private readonly logger: ILogger;

    private constructor() {
        this.fileScope = globalEventBus.createEventScope();
        this.logger = Logger.for('file-bus');
        this.logger.debug?.('[FileEventBus] initialized, scopeId =', this.fileScope.getScopeId());
    }

    static getInstance(): FileEventBus {
        if (!FileEventBus.instance) {
            FileEventBus.instance = new FileEventBus();
        }
        return FileEventBus.instance;
    }

    getScopeId(): string {
        return this.fileScope.getScopeId();
    }

    /**
     * 发送文件反馈事件（只接收 EventContext）
     *
     * 事件总线统一约定：只接收 EventContext，由发送方构建。
     * 从 ctx.source 提取 fileKey，从 ctx.type 提取 action。
     *
     * @param ctx - 预构建的 EventContext
     */
    fileEmit(ctx: EventContext): void {
        const fileKey = ctx.source;
        const action = ctx.type!;
        const fileEvent = encodeFileEvent(fileKey, action);
        this.logger.debug?.('[FileEventBus] fileEmit, fileKey =', fileKey, 'action =', action);
        this.fileScope.emit(fileEvent, ctx);
    }

    fileOn(fileKey: string, action: string, handler: (data: any) => void): () => void {
        const fileEvent = encodeFileEvent(fileKey, action);
        this.logger.debug?.('[FileEventBus] fileOn, fileKey =', fileKey, 'action =', action);
        return this.fileScope.on(fileEvent, (ctx: any) => {
            const data = ctx?.data !== undefined ? ctx.data : ctx;
            handler(data);
        });
    }

    fileOnce(fileKey: string, action: string, handler: (data: any) => void): void {
        const fileEvent = encodeFileEvent(fileKey, action);
        this.fileScope.once(fileEvent, (ctx: any) => {
            const data = ctx?.data !== undefined ? ctx.data : ctx;
            handler(data);
        });
    }

    dispose(): void {
        this.fileScope.dispose();
        this.logger.debug?.('[FileEventBus] disposed');
    }
}

export const fileEventBus = FileEventBus.getInstance();
