import { IHttpRequest } from './request';
import { IHttpResponse, IHttpTransportFailure } from './response';

/**
 * HTTP 传输接口
 * 
 * 职责：只解决"怎么发请求"
 * 禁止：
 * ❌ 不抛业务错误
 * ❌ 不解析 body
 * ❌ 不 retry
 */
export interface IHttpTransport {
    /**
     * 发送请求方法
     * 注意：这里依然不抛业务异常，只返回"发生了什么"
     * 
     * @param req - HTTP 请求对象
     * @returns Promise，解析为 IHttpResponse 或 IHttpTransportFailure
     */
    send(req: IHttpRequest): Promise<IHttpResponse | IHttpTransportFailure>;
}