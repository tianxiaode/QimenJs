import { ActionHandler, FlowContext } from '../../types';

export const CommonParamsEnricherHandler: ActionHandler = async (ctx: FlowContext) => {
    const { commonParams, commonBody } = ctx.config;

    // 1. 合并公共 Query 参数 (如 appId)
    if (commonParams) {
        // 修正：执行函数获取结果，如果没有结果则取原对象
        const common = typeof commonParams === 'function' ? commonParams() : commonParams;
        ctx.http.query = { ...common, ...ctx.http.query };
    }

    // 2. 合并公共 Body 参数
    if (commonBody) {
        // 修正：执行函数获取结果
        const bodyValue = typeof commonBody === 'function' ? commonBody() : commonBody;
        
        // 安全合并：确保当前有 body 且它是对象类型才进行扩展
        if (ctx.http.body && typeof ctx.http.body === 'object') {
            ctx.http.body = { ...bodyValue, ...ctx.http.body };
        } else if (!ctx.http.body) {
            // 如果原本没 Body，直接把公共 Body 塞进去
            ctx.http.body = bodyValue;
        }
    }
};
