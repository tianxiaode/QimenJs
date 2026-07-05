/**
 * TaskStateError 是一个自定义错误类，
 * 用于在任务状态不正确或不一致时抛出错误。
 * 这种错误通常发生在任务执行过程中，当尝试对任务执行不适当的操作时触发，
 * 例如尝试取消已完成的任务，或在任务未初始化时开始执行。
 */
import { ErrorBase } from '@qimenjs/error';

/**
 * 任务状态错误类
 * 当任务状态不正确或不一致时抛出此错误
 */
export class TaskStateError extends ErrorBase {
    /**
     * 构造函数
     * @param message - 错误消息，描述导致错误的具体情况
     * @param context - 可选的上下文信息，包含与错误相关的额外数据
     */
    constructor(message: string, context?: Record<string, any>) {
        super(message, 'TASK_STATE_ERROR', context);
    }
}
