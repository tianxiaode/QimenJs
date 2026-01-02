import { IUrlProcessor, RequestOptions } from '../../types';

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
