import { IHeaderProcessor, RequestOptions } from '../../types';

/**
 * Content-Type 头处理器
 * 负责根据请求体类型自动设置合适的 Content-Type 头
 * 
 * 处理逻辑：
 * 1. 如果用户已经手动设置了 Content-Type，则不覆盖
 * 2. 如果请求没有 body（如 GET 请求），则不设置 Content-Type
 * 3. 根据 body 类型自动判断并设置相应的 Content-Type：
 *    - FormData: 浏览器自动设置（带 boundary 的 multipart/form-data）
 *    - URLSearchParams: application/x-www-form-urlencoded;charset=UTF-8
 *    - Blob/File: 使用其类型或 application/octet-stream
 *    - 普通对象: application/json;charset=UTF-8
 *    - 字符串: text/plain;charset=UTF-8
 * 
 * @param headers - 当前请求头对象
 * @param _url - 请求 URL（未使用，保留参数兼容性）
 * @param _method - 请求方法（未使用，保留参数兼容性）
 * @param options - 请求选项，包含 body 字段
 * @returns 处理后的请求头对象
 */
export const HeaderContentTypeProcessor: IHeaderProcessor = (
    headers: Record<string, string>,
    _url: string,
    _method: string,
    options: RequestOptions
) => {
    const { body } = options;

    // 1. 如果用户已经手动设置了 Content-Type，直接返回，不做干扰
    if (headers['Content-Type'] || headers['content-type']) {
        return headers;
    }

    // 2. 如果没有 body (如 GET 请求)，不需要设置 Content-Type
    if (!body) {
        return headers;
    }

    const newHeaders = { ...headers };

    // 3. 根据 body 的类型自动判断
    if (body instanceof FormData) {
        // 注意：FormData 不需要手动设置 Content-Type，
        // 浏览器会自动生成带 boundary 的 multipart/form-data
    } else if (body instanceof URLSearchParams) {
        newHeaders['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
    } else if (body instanceof Blob || body instanceof File) {
        newHeaders['Content-Type'] = body.type || 'application/octet-stream';
    } else if (body !== null && typeof body === 'object') {
        // 最常用的：如果是普通对象，自动设为 JSON
        newHeaders['Content-Type'] = 'application/json;charset=UTF-8';
    } else if (typeof body === 'string') {
        newHeaders['Content-Type'] = 'text/plain;charset=UTF-8';
    }

    return newHeaders;
};