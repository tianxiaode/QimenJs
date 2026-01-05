import { FlowContext } from '../types';

export class ProcessorExecutor {
    /**
     * 执行一组处理器
     * 保持纯粹，不进行任何 try-catch，让错误自然冒泡
     */
    static async run(ctx: FlowContext, handlers: Function[]): Promise<void> {
        for (const handler of handlers) {
            // 中止位检查：如果流程被之前的任务标记为中止，则停止后续执行
            if (ctx.isAborted) break;

            // 直接 await，错误会自动冒泡到 FlowRunner
            await handler(ctx);
        }
    }
}
