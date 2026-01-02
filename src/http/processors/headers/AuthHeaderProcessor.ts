import { IHeaderProcessor } from '../../types';

/**
 * 认证头处理器
 * 负责在请求头中自动添加 Authorization 字段
 * 
 * 处理逻辑：
 * 1. 如果请求头中已存在 Authorization 字段，则不覆盖（尊重用户手动设置）
 * 2. 如果不存在，则从 localStorage 中获取 token 并设置为 Bearer 认证格式
 * 
 * @param headers - 当前请求头对象
 * @param _url - 请求 URL（未使用，保留参数兼容性）
 * @param _method - 请求方法（未使用，保留参数兼容性）
 * @param _options - 请求选项（未使用，保留参数兼容性）
 * @returns 处理后的请求头对象
 */
export const AuthHeaderProcessor: IHeaderProcessor = (headers, _url, _method, _options) => {
    // 1. 如果用户手动传了，我们不覆盖（尊重调用者的特例）
    if (headers['Authorization'] || headers['authorization']) {
        return headers;
    }

    // 2. 默认从 localStorage 获取（最标准做法）
    const token = localStorage.getItem('token');

    if (token) {
        return {
            ...headers,
            Authorization: `Bearer ${token}`.trim(),
        };
    }

    return headers;
};