import { IHeaderProcessor } from '../../types';

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
