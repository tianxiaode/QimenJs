import { FlowContext } from "../types";

class FlowRunner {
    static async run(ctx: FlowContext, options?: { feedback?: ErrorFeedbackHandler }) {
        try {
            const pipeline = Registry.getPipeline(ctx.tag, ctx);
            for (const processor of pipeline) {
                if (ctx.control.signal.aborted || ctx.control.isHandled) break;
                await processor.handler(ctx);
            }
        } catch (err) {
            // 记录中断状态
            ctx.control.isAborted = true;
            ctx.error = err;

            // 检查是否有“反馈处理器”对接
            if (options?.feedback) {
                // 由反馈处理器决定返回给 UI 什么数据
                // 比如把异常转化为：{ success: false, errors: [...] }
                ctx.data.result = await options.feedback(err, ctx);
                return ctx.data.result; 
            }

            // 如果没有反馈对接，依然保持抛出，让外部兜底
            throw err;
        }

        return ctx.data.result;
    }
}