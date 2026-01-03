import { RequestOptions } from './request';
import { HttpResponseContext } from './response';

/**
 * URL 处理器接口
 * 定义如何处理 URL 的转换和修改
 * @param url - 原始 URL
 * @param options - 请求配置选项
 * @returns 处理后的 URL
 */
export type IUrlProcessor = (url: string, options: RequestOptions) => string;

/**
 * 请求头处理器接口
 * 定义如何处理请求头的转换和修改
 * @param headers - 原始请求头
 * @param url - 请求 URL
 * @param method - HTTP 方法
 * @param options - 请求配置选项
 * @returns 处理后的请求头
 */
export type IHeaderProcessor = (
    headers: Record<string, string>,
    url: string,
    method: string,
    options: RequestOptions
) => Record<string, string>;

/**
 * 响应处理流水线节点类型
 * 定义了响应处理器的接口规范
 *
 * @param context - 当前流水线中的响应上下文
 * @param options - 原始请求配置（只读语义，不应被修改）
 * @returns Promise<HttpResponseContext>
 *
 * @remarks
 * - IResponseProcessor 不要求同时处理成功与失败场景
 * - 是否抛错、何时抛错、错误形态如何，完全由实现者决定
 * - HttpClient 不会捕获或包装 rejected 的结果
 * - 返回一个 resolved Promise：表示处理成功，结果将传递给下一个处理器
 * - 返回一个 rejected Promise：表示处理失败，流水线立即中断
 */
export type IResponseProcessor = (
    context: HttpResponseContext,
    options: RequestOptions
) => Promise<HttpResponseContext>;
