import { PreRequestContext, DataProcessContext } from './context';
import { REPO_ACTION } from './action';
import { HttpResponseContext } from '@/http';
/**
 * 访问控制处理器
 * @param basePath - 资源路径 (如: /api/v1/user)
 * @param action - 动作名称 (如: delete)
 * @param payload - 可选的原始数据 (用于数据级权限判断)
 */
export type AccessControlHandler = (
    basePath: string, 
    action: REPO_ACTION,
    payload?: any 
) => Promise<boolean>;


/** 预处理器：强制异步，支持熔断 */
export type PreProcessor = (
    context: PreRequestContext, 
    payload: any
) => Promise<PreRequestContext | null | undefined>;

/** 数据处理器：强制异步，链式加工 */
export type DataProcessor = (
    context: DataProcessContext,
    httpRes: HttpResponseContext, // 原始 http 响应对象
    reqCtx: PreRequestContext
) => Promise<DataProcessContext>;

/** 处理器集合：支持 common 和特定 action */
export type PreProcessorPipelines = {
    [K in REPO_ACTION]?: PreProcessor[];
};

export type DataProcessorPipelines = {
    [K in REPO_ACTION]?: DataProcessor[];
};