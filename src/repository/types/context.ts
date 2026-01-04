import { HttpMethod, HttpResponseContext, RequestOptions } from '@orbitjs/http';
import { REPO_ACTION } from './action';

export enum FlowStatus {
    PENDING = 'pending', // 准备中
    PROCEED = 'proceed', // 正常进行，可以发送网络请求
    ABORTED = 'aborted', // 已拦截/中止，持有“中止结果”
}

export interface PreRequestContext {
    status: FlowStatus;
    method: HttpMethod;
    url: string;
    // 资源元数据（新增）
    metadata: {
        basePath: string;
        rowKey: string;
        action: REPO_ACTION;
    };
    // 请求具体参数
    options: RequestOptions;
    payload: any;
    abortReason?: string;
    abortCode?: number;
}

export interface DataProcessContext<T = any> {
    /**
     * 列表数据：分页查询、全量查询的统一出口
     */
    list: T[];
    /**
     * 总条数：分页逻辑的核心依据
     */
    total: number;
    /**
     * 单体详情：detail、update、create 等动作的返回对象
     */
    detail: T | null;

    /**
     * 业务状态信息
     */
    code: number | string;
    message: string;

    /**
     * 处理器状态快照
     */
    status: {
        isBusinessSuccess: boolean; // 只有后端返回成功且通过所有 DataProcessor 才为 true
        isAborted: boolean; // 用户在 PreProcessor 阶段点取消 (例如 Confirm 框)
        isCancelled: boolean; // 请求发送后被物理取消 (例如 竞态条件、页面销毁)
        [key: string]: any;
    };
    raw: any; // 原始数据，方便后续处理器处理
}

/**
 * 运行流程所需的静态资源和配置
 */
export interface FlowOptions {
    repoName: string;
    basePath: string;
    rowKey: string;
    httpClient: any; // 具体类型按你的项目而定
    activeTasks: Map<REPO_ACTION, any>;
    prePipelines: { global: any; local: any };
    dataPipelines: { global: any; local: any };
    accessController?: (
        path: string,
        action: REPO_ACTION,
        payload: any
    ) => Promise<boolean | string>;
    transformFn: (p: any, a: REPO_ACTION) => any;
    // 生命周期钩子
    onLoading: (isLoading: boolean) => void;
    onSuccess: (result: DataProcessContext) => void;
    onError: (err: any) => void;
}

/**
 * 流程流转中的动态数据载体
 */
export interface FlowContext {
    action: REPO_ACTION;
    payload: any;
    preCtx: PreRequestContext | null;
    httpRes: HttpResponseContext | null;
    result: DataProcessContext | null;
}

export interface FlowContext {
    action: REPO_ACTION;
    payload: any;
    result: DataProcessContext | null; // 任何阶段填入 result，后续物理请求将跳过
    preCtx: PreRequestContext | null; // 物理请求前生成的上下文
    httpRes: HttpResponseContext | null; // HTTP 响应原件
}

/**
 * 管道任务定义
 */
export interface PipelineTask {
    name: string;
    // 返回 true 则执行 run
    when: (flow: FlowContext) => boolean | Promise<boolean>;
    // 具体的逻辑执行
    run: (flow: FlowContext) => Promise<void>;
}
