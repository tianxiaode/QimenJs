/**
 * HTTP 上下文构建器
 *
 * 用于构建 HttpContext 对象
 *
 * @module http/HttpContextBuilder
 */
import type { ExecutionStep } from '@orbitjs/context';
import type { HttpContext, HttpRequestOptions } from './types/http-context';
/**
 * HTTP 上下文构建器
 *
 * 使用构建器模式创建 HttpContext 对象
 *
 * @example
 * ```typescript
 * const context = HttpContextBuilder
 *     .fromOptions({
 *         url: '/api/users',
 *         method: 'GET',
 *         queryParams: { page: 1 }
 *     })
 *     .withMetadata('domain', 'user')
 *     .build();
 * ```
 */
export declare class HttpContextBuilder {
    private context;
    private constructor();
    /**
     * 创建新的构建器实例
     */
    static create(): HttpContextBuilder;
    /**
     * 从请求选项构建
     *
     * @param options - HTTP 请求选项
     * @returns 构建器实例
     */
    static fromOptions(options: HttpRequestOptions): HttpContextBuilder;
    /**
     * 设置请求信息
     */
    withRequest(request: Partial<HttpContext['request']>): this;
    /**
     * 设置响应信息
     */
    withResponse(response: Partial<HttpContext['response']>): this;
    /**
     * 设置错误
     */
    withError(error: any): this;
    /**
     * 设置元数据
     */
    withMetadata(key: string, value: any): this;
    /**
     * 批量设置元数据
     */
    withMetadataMap(metadata: Record<string, any>): this;
    /**
     * 中止请求
     */
    abort(): this;
    /**
     * 添加执行步骤
     */
    addStep(step: ExecutionStep): this;
    /**
     * 批量添加执行步骤
     */
    addSteps(steps: ExecutionStep[]): this;
    /**
     * 构建最终上下文
     *
     * @throws Error 如果上下文不完整
     * @returns 完整的 HttpContext 对象
     */
    build(): HttpContext;
    /**
     * 克隆当前构建器
     */
    clone(): HttpContextBuilder;
}
//# sourceMappingURL=HttpContextBuilder.d.ts.map