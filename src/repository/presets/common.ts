import { DataProcessor } from '../types';

/**
 * 物理层校验器：只管 HTTP 通不通
 */
export const commonHttpValidator: DataProcessor = async (dataCtx, httpRes) => {
    // 处理物理连接失败
    if (httpRes.metadata.isTransportFailure) {
        throw new Error('网络连接异常，请检查您的网络环境');
    }

    // 处理 HTTP 状态码失败 (4xx, 5xx)
    if (!httpRes.metadata.isHttpSuccess) {
        // 这里可以根据状态码做精细化描述
        const statusMap: Record<number, string> = {
            401: '登录失效，请重新登录',
            403: '拒绝访问：您没有操作权限',
            404: '请求的资源不存在',
            500: '服务器内部错误，请稍后再试',
        };
        throw new Error(statusMap[httpRes.status] || `系统响应异常 (HTTP ${httpRes.status})`);
    }

    // 物理校验通过，进入下一个处理器
    return dataCtx;
};