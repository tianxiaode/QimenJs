import { IHttpRequest } from './request';
import { IHttpResponse, IHttpTransportFailure } from './response';


/**
 * 职责：只解决“怎么发请求
 * 禁止：
 * ❌ 不抛业务错误
 * ❌ 不解析 body
 * ❌ 不 retry
 */
export interface IHttpTransport {
    // 注意：这里依然不抛业务异常，只返回“发生了什么”
    send(req: IHttpRequest): Promise<IHttpResponse | IHttpTransportFailure>;
}
