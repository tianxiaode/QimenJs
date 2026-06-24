/**
 * @file FetchTransport.ts
 * @description
 * 该文件实现了基于Fetch API的数据传输处理器，用于发送HTTP请求和接收响应。
 * 它支持请求超时控制、错误处理和响应数据填充等功能。
 * 注意：仅适用于非上传和下载任务。
 */
import type { RequestContext } from '@orbitjs/context';
export declare const FetchTransportHandler: (context: RequestContext) => Promise<void>;
//# sourceMappingURL=FetchTransport.d.ts.map