/**
 * HTTP Action 注册表
 *
 * 纯粹的 HTTP 处理器注册表
 */
import { RegistrarBase } from '@orbitjs/registry';
/**
 * HTTP Action 类别
 */
export declare enum HttpActionCategory {
    /**
     * 准备阶段 - 构建请求
     */
    PREPARE = 100,
    /**
     * 交换阶段 - 发送请求
     */
    EXCHANGE = 200,
    /**
     * 处理阶段 - 处理响应
     */
    PROCESS = 300,
    /**
     * 对齐阶段 - 后处理
     */
    ALIGN = 400
}
/**
 * HTTP Action 条目
 */
export interface HttpActionEntry {
    /**
     * 处理器名称
     */
    name: string;
    /**
     * 类别
     */
    category: HttpActionCategory;
    /**
     * 偏移量（用于同类别内排序）
     */
    offset: number;
    /**
     * 处理函数
     */
    handler: (context: any) => Promise<void> | void;
    /**
     * 描述
     */
    description?: string;
}
/**
 * HttpActionRegistrar 类
 *
 * 管理 HTTP 处理器的注册和检索
 */
export declare class HttpActionRegistrar extends RegistrarBase<Map<string, HttpActionEntry>> {
    readonly name = "http-action";
    /**
     * 存储数据
     */
    protected storage: Map<string, HttpActionEntry>;
    /**
     * 管道缓存
     */
    private pipelineCache;
    /**
     * 注册 HTTP Action
     */
    register(entry: HttpActionEntry): void;
    /**
     * 批量注册
     */
    registerAll(entries: HttpActionEntry[]): void;
    /**
     * 获取 HTTP Action
     */
    get(name: string): HttpActionEntry | undefined;
    /**
     * 获取完整的 HTTP 管道（按优先级排序）
     */
    getPipeline(): HttpActionEntry[];
    /**
     * 清除缓存
     */
    private clearCache;
    /**
     * 覆写 clear 方法
     */
    clear(): void;
    /**
     * 注销处理器
     */
    unregister(name: string): void;
    /**
     * 检查是否存在
     */
    has(name: string): boolean;
    /**
     * 获取所有名称
     */
    getNames(): string[];
    /**
     * 实现抽象方法：输出注册器状态
     */
    protected doInspect(): void;
}
//# sourceMappingURL=HttpActionRegistrar.d.ts.map