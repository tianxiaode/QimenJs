import { PreProcessor } from '../../types';

/** Spring 分页通常从 0 开始，且参数名为 page/size */
export const springPre: PreProcessor = async (ctx, payload) => {
    if (ctx.metadata.action === 'list' && payload?.page) {
        ctx.options.queryParams = {
            ...ctx.options.queryParams,
            page: payload.page - 1, // 关键：1 变 0
            size: payload.pageSize || 10,
        };
    }
    return ctx;
};
