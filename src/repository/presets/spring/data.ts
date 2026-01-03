import { DataProcessor } from '../../types/processor';

/**
 * Spring 业务对齐：只管 code 和 data 结构
 */
export const springData: DataProcessor = async (dataCtx, httpRes) => {
    const { code, data, msg } = httpRes.data;

    // 1. 业务 code 判断 (Spring 约定 200 或 0 为成功)
    if (code !== 200 && code !== 0) {
        dataCtx.status.isBusinessSuccess = false;
        throw new Error(msg || `业务处理失败 (Code: ${code})`);
    }

    // 2. 数据槽位对齐
    if (data) {
        if (data.content && Array.isArray(data.content)) {
            // 对齐 Spring Data JPA 分页
            dataCtx.list = data.content;
            dataCtx.total = data.totalElements || 0;
        } else {
            // 对齐详情对象
            dataCtx.detail = data;
        }
    }

    return dataCtx;
};