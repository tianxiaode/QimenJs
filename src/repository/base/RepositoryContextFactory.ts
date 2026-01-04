import { HttpResponseContext } from '@/http';
import { REPO_ACTION, PreRequestContext, DataProcessContext, FlowStatus } from '../types';

export class RepositoryContextFactory {
    /**
     * 创建初始的请求上下文 (PreRequestContext)
     */
    static createPreRequest(
        params: { basePath: string; rowKey: string },
        action: REPO_ACTION,
        payload: any,
        // 将转换逻辑作为函数参数传入
        transformFn: (p: any, a: REPO_ACTION) => any
    ): PreRequestContext {
        return {
            status: FlowStatus.PROCEED,
            method: 'GET',
            url: params.basePath,
            metadata: {
                basePath: params.basePath,
                rowKey: params.rowKey,
                action,
            },
            options: {
                body: payload,
            },
            // 执行传入的逻辑
            payload: transformFn(payload, action),
        };
    }

    /**
     * 创建初始的数据处理上下文 (DataProcessContext)
     * 常用于：初始化结果、创建被中断的结果、创建错误结果
     */
    static createDataProcess(
        httpRes: HttpResponseContext,
        overrides: Partial<DataProcessContext['status']> & {
            message?: string;
            list?: any[];
            detail?: any;
        } = {}
    ): DataProcessContext {
        // 1. 自动判定基础业务成功标志
        // 规则：HTTP 成功 且 没有传输错误 且 没有被中止
        const isInitialSuccess =
            httpRes.metadata.isHttpSuccess &&
            !httpRes.metadata.isTransportFailure &&
            !httpRes.metadata.isAborted;

        return {
            list: overrides.list || [],
            total: 0,
            detail: overrides.detail || null,
            // 优先使用传入的消息，否则使用响应头或错误详情
            message: overrides.message || httpRes.metadata.error?.message || '',
            code: httpRes.status,
            status: {
                // 核心状态：由 HttpResponseContext 的元数据推导
                isBusinessSuccess: isInitialSuccess,
                isAborted: httpRes.metadata.isAborted,
                isCancelled: httpRes.metadata.isAborted, // 通常中止对应取消
                ...overrides, // 允许后续处理器覆盖（例如 HTTP 200 但 code 非 0）
            },
            // 挂载原始数据供后序处理器解析
            raw: httpRes.data,
        };
    }

    /**
     * 将 PreRequestContext 的中止状态转换为 DataProcessContext
     * 用于：FlowRunner 捕获到中止信号后，生成给 UI 的反馈数据
     */
    static handleAborted(preCtx: PreRequestContext): DataProcessContext {
        return {
            list: [],
            total: 0,
            detail: null,
            // 从 preCtx 中提取 abortReason，如果没有则给默认提示
            message: preCtx.abortReason || `Operation ${preCtx.metadata.action} aborted.`,
            // 499 是一个常用的代表“客户端关闭/请求取消”的约定代码
            code: preCtx.abortCode || 499,
            status: {
                isBusinessSuccess: false,
                isAborted: true,
                isCancelled: true,
            },
            raw: null, // 中止流程没有原始网络数据
        };
    }
}
