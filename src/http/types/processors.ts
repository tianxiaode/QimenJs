import { IHttpRequest } from './request';
import { RequestResult } from './response';

export type UrlProcessor = (url: string, params?: any) => string;

// 注意：这里引用的是接口 IHttpRequest
export type HeaderProcessor = (headers: Headers, req: IHttpRequest) => void | Promise<void>;

export type HttpResponseHandler = (res: RequestResult, req: IHttpRequest) => boolean | Promise<boolean>;