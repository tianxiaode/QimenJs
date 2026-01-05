import { IUrlProcessor, RequestOptions } from '../../../types/http';

/**
 * 路径参数处理器
 * 职责：将路径参数拼接到 URL 路径中
 * 
 * 处理逻辑：
 * 1. 检查是否提供了路径参数
 * 2. 如果提供了路径参数，则将它们拼接到 URL 末尾
 * 3. 确保 URL 和路径参数之间只有一个斜杠
 * 
 * @param url - 原始 URL 字符串
 * @param options - 请求选项，包含 pathParams 字段
 * @returns 处理后的 URL 字符串
 */
export const PathParamsProcessor: IUrlProcessor = (url: string, options: RequestOptions) => {
    const { pathParams } = options;

    // 只做最基础的判空
    if (!pathParams || pathParams.length === 0) return url;

    // 确保连接处只有一个斜杠，然后把用户给的东西全部 join 起来
    const baseUrl = url.endsWith('/') ? url : `${url}/`;

    // 这里的 (url += ...) 是个小瑕疵，reduce 应该返回新值而不改变原 url 引用
    // 遵循纯函数原则：
    return baseUrl + pathParams.join('/');
};