import { HttpMethod, RequestOptions } from '@orbitjs/http';
import { REPO_ACTION } from './action';

export interface PreRequestContext {
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
