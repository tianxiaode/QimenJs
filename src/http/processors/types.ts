import { HttpRequest, HttpResponse } from '../core';
import { HttpTransportFailure } from '../transport';

// URL 处理：接收当前的 URL 和参数，返回处理后的新 URL
export type UrlProcessor = (url: string, params?: any) => string;

// Header 处理：原地修改 Headers 对象
export type HeaderProcessor = (headers: Headers, req: HttpRequest) => void | Promise<void>;

// 响应处理：返回 true 截断，返回 false 继续
export type HttpResponseHandler = (
    res: HttpResponse | HttpTransportFailure,
    req: HttpRequest
) => boolean | Promise<boolean>;
