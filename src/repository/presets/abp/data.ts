import { DataProcessor } from '../../types/processor';

/**
 * ABP 业务对齐：只管 success 和 result 结构
 */
export const abpData: DataProcessor = async (dataCtx, httpRes) => {
    const { success, result, error } = httpRes.data;

    // 1. 业务成功判断
    if (!success) {
        dataCtx.status.isBusinessSuccess = false;
        throw new Error(error?.message || 'ABP 业务系统执行异常');
    }

    // 2. 数据槽位对齐
    if (result) {
        if (Array.isArray(result.items)) {
            // 对齐 ABP 分页
            dataCtx.list = result.items;
            dataCtx.total = result.totalCount || 0;
        } else {
            // 对齐详情对象
            dataCtx.detail = result;
        }
    }

    return dataCtx;
};