import { NoProgressOptions, StreamTask } from '../types';
/**
 * StreamClient 类
 *
 * 专门用于处理流式数据请求，特别是 AI 相关的流式 API
 * 使用 Async Generator 模式，支持 for await 消费
 */
export declare class StreamClient {
    protected domain: string;
    /**
     * 构造函数
     * @param domain 域名，默认为 'default'
     */
    constructor(domain?: string);
    /**
     * 修改后的 chatStream：不再直接 yield，而是返回一个 Task
     *
     * @param url 请求 URL
     * @param body 请求体
     * @param options 请求选项
     * @returns StreamTask 对象，包含异步生成器、取消方法和上下文
     */
    chatStream<T>(url: string, body: any, options: NoProgressOptions): StreamTask<T>;
}
//# sourceMappingURL=StreamClient.d.ts.map