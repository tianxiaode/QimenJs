export type CRUD_ACTION = 'list' | 'get-all' | 'get' | 'create' | 'update' | 'delete' | 'batchDelete' | 'toggle';
export type ENTITY_ACTION = CRUD_ACTION | string;
/**
 * 处理器类别：定义处理器的核心职责
 */
export declare enum ActionCategory {
    /** 01-PREPARE: 请求构建阶段 (参数对齐、URL拼接、Header注入) */
    PREPARE = 4000,
    /** 02-EXCHANGE: 物理交换阶段 (Fetch/XHR 发送、Failure Guard) */
    EXCHANGE = 3000,
    /** 03-PROCESS: 内容识别阶段 (状态码分析、数据反序列化/Parse) */
    PROCESS = 2000,
    /** 04-ALIGN: 业务对齐阶段 (数据提取、错误拦截、全局结算) */
    ALIGN = 1000
}
//# sourceMappingURL=base.d.ts.map