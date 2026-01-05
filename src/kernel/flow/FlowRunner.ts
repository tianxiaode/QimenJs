import { FlowContext } from "../types";

// kernel/FlowRunner.ts
export class FlowRunner {
    static async run(ctx: FlowContext, tasks: Array<(ctx: FlowContext) => Promise<void>>) {
        try {
            for (const task of tasks) {
                if (ctx.isAborted) break;
                await task(ctx);
            }
            // 流程顺利完成，返回最终对齐的数据
            return ctx;
        } catch (error) {
            // 仅仅记录错误状态，不做任何包装，然后原样抛出
            ctx.error = error; 
            throw error; 
        }
    }
}