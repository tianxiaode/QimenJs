import { DomainConfig } from '@orbitjs/registry';
import { ENTITY_ACTION, FlowContext, HttpMethod, RequestOptions, Schema } from '../types';
/**
 * 创建流上下文对象
 *
 * 此函数用于创建一个完整的流上下文对象，包含了执行请求所需的所有信息，
 * 如域配置、HTTP 请求参数、数据容器、元数据以及处理步骤等。
 *
 * @param method - HTTP 方法 (GET, POST, PUT, DELETE 等)
 * @param url - 请求的目标 URL
 * @param domain - 操作的域名称
 * @param domainConfig - 域的配置信息
 * @param requestOptions - 请求选项，包括参数、头信息、请求体等
 * @param entityName - 实体名称 (可选)
 * @param action - 实体动作类型 (可选)
 * @param schema - 数据模式定义 (可选)
 * @returns FlowContext - 包含所有请求相关信息的上下文对象
 */
export declare const createFlowContext: (method: HttpMethod, url: string, domain: string, domainConfig: DomainConfig, requestOptions: RequestOptions, entityName?: string, action?: ENTITY_ACTION, schema?: Schema) => FlowContext;
//# sourceMappingURL=context.d.ts.map