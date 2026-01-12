import { ActionHandler, FlowContext } from '../../types';

export const BodyParserHandler: ActionHandler = async (ctx: FlowContext) => {
    // 只有物理彻底崩了才跳过，500/400 依然要解析 Body
    if (ctx.metadata.isTransportFailure || !ctx.http.rawResponse) return;

    const response = ctx.http.rawResponse as Response;
    
    try {
        // 尝试解析，把结果塞进 data.raw
        const data = await response.json();
        ctx.data.raw = data;
        ctx.data.source = data;

        // 根据状态码初步定性 hasError
        if (response.status >= 400) {
            ctx.metadata.hasError = true;
        }
    } catch (e) {
        // 如果 500 错误还没回 JSON (比如反向代理报错)，则转为文本处理
        ctx.data.raw = await response.text();
        ctx.metadata.hasError = true;
    }
};