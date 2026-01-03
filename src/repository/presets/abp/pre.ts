import { PreProcessor } from "../../types";

/** ABP 使用 SkipCount 和 MaxResultCount 处理分页 */
export const abpPre: PreProcessor = async (ctx, payload) => {
    if (ctx.metadata.action === 'list' && payload?.page) {
        ctx.options.queryParams = {
            ...ctx.options.queryParams,
            skipCount: (payload.page - 1) * (payload.pageSize || 10),
            maxResultCount: payload.pageSize || 10
        };
    }
    return ctx;
};