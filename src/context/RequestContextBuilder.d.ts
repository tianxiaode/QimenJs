/**
 * 请求上下文构建器
 *
 * 用于构建 RequestContext 对象
 * 主要在实体管理中使用，将实体动作转换为请求上下文
 *
 * @module context/RequestContextBuilder
 */
import type { RequestContext, ExecutionStep, HttpMethod } from './types/request-context';
/**
 * 请求上下文构建器
 *
 * 使用构建器模式创建 RequestContext 对象
 *
 * @example
 * ```typescript
 * // 实体管理中使用
 * const context = RequestContextBuilder
 *     .create()
 *     .withIdentity({ domain: 'user', entityName: 'User', action: 'list' })
 *     .withParams({ page: 1, size: 10 })
 *     .withRequest({
 *         url: '/api/users',
 *         method: 'GET'
 *     })
 *     .build();
 * ```
 */
export declare class RequestContextBuilder {
    private context;
    private constructor();
    /**
     * 创建新的构建器实例
     */
    static create(): RequestContextBuilder;
    /**
     * 设置标识信息
     */
    withIdentity(identity: Partial<RequestContext['identity']>): this;
    /**
     * 设置域
     */
    withDomain(domain: string): this;
    /**
     * 设置实体名称
     */
    withEntityName(entityName: string): this;
    /**
     * 设置动作
     */
    withAction(action: string): this;
    /**
     * 设置请求信息
     */
    withRequest(request: Partial<RequestContext['request']>): this;
    /**
     * 设置 URL
     */
    withUrl(url: string): this;
    /**
     * 设置 HTTP 方法
     */
    withMethod(method: HttpMethod): this;
    /**
     * 设置请求头
     */
    withHeaders(headers: Record<string, string>): this;
    /**
     * 设置请求体
     */
    withBody(body: any): this;
    /**
     * 设置查询参数
     */
    withQueryParams(queryParams: Record<string, any>): this;
    /**
     * 设置响应信息
     */
    withResponse(response: Partial<RequestContext['response']>): this;
    /**
     * 设置数据载体
     */
    withData(data: Partial<RequestContext['data']>): this;
    /**
     * 设置请求参数
     */
    withParams(params: any): this;
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
    withMetadataMap(metadata: Partial<RequestContext['metadata']>): this;
    /**
     * 设置 Schema
     */
    withSchema(schema: any): this;
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
     * 设置对齐方法
     */
    withAlignToFrontend(alignToFrontend: (target: any) => any): this;
    /**
     * 构建最终上下文
     *
     * @throws Error 如果上下文不完整
     * @returns 完整的 RequestContext 对象
     */
    build(): RequestContext;
    /**
     * 克隆当前构建器
     */
    clone(): RequestContextBuilder;
}
//# sourceMappingURL=RequestContextBuilder.d.ts.map