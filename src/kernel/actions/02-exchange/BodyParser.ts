import { ActionHandler, FlowContext } from '../../types';

export const BodyParserHandler: ActionHandler = async (ctx: FlowContext) => {
    // 卫语句：如果有物理错误，跳过解析
    if (ctx.metadata.isTransportFailure || !ctx.http.rawResponse) return;

    const response = ctx.http.rawResponse as Response;
    const contentType = response.headers.get('Content-Type') || '';

    try {
        // 根据响应类型进行解析 (参考你 handleRawBody 的逻辑)
        if (contentType.includes('application/json')) {
            ctx.data.raw = await response.json();
            ctx.data.source = ctx.data.raw; // 存一份物理备份
        } else if (contentType.includes('text/')) {
            ctx.data.raw = await response.text();
        } else {
            ctx.data.raw = await response.arrayBuffer();
        }
    } catch (e) {
        ctx.metadata.hasError = true;
        ctx.metadata.errorReason = 'parse_error';
    }
};
