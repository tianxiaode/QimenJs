import { IHeaderProcessor, RequestOptions } from '../../types';

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
