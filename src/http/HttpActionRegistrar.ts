/**
 * HTTP Action 注册表
 *
 * 纯粹的 HTTP 处理器注册表
 */

import { RegistrarBase } from '@qimenjs/registry';

/**
 * HTTP Action 类别
 */
export enum HttpActionCategory {
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
    ALIGN = 400,
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
export class HttpActionRegistrar extends RegistrarBase<Map<string, HttpActionEntry>> {
    public readonly name = 'http-action';

    /**
     * 存储数据
     */
    protected storage = new Map<string, HttpActionEntry>();

    /**
     * 管道缓存
     */
    private pipelineCache: HttpActionEntry[] | null = null;

    /**
     * 注册 HTTP Action
     */
    register(entry: HttpActionEntry): void {
        this.checkLock();
        this.storage.set(entry.name, entry);
        this.clearCache();
    }

    /**
     * 批量注册
     */
    registerAll(entries: HttpActionEntry[]): void {
        this.checkLock();
        entries.forEach(entry => {
            this.storage.set(entry.name, entry);
        });
        this.clearCache();
    }

    /**
     * 获取 HTTP Action
     */
    get(name: string): HttpActionEntry | undefined {
        return this.storage.get(name);
    }

    /**
     * 获取完整的 HTTP 管道（按优先级排序）
     */
    getPipeline(): HttpActionEntry[] {
        if (this.pipelineCache) {
            return this.pipelineCache;
        }

        const entries = Array.from(this.storage.values());

        // 按类别和偏移量排序
        const sorted = entries.sort((a, b) => {
            const weightA = a.category + a.offset;
            const weightB = b.category + b.offset;
            return weightA - weightB;
        });

        this.pipelineCache = sorted;
        return sorted;
    }

    /**
     * 清除缓存
     */
    private clearCache(): void {
        this.pipelineCache = null;
    }

    /**
     * 覆写 clear 方法
     */
    clear(): void {
        super.clear();
        this.clearCache();
    }

    /**
     * 注销处理器
     */
    unregister(name: string): void {
        this.checkLock();
        this.storage.delete(name);
        this.clearCache();
    }

    /**
     * 检查是否存在
     */
    has(name: string): boolean {
        return this.storage.has(name);
    }

    /**
     * 获取所有名称
     */
    getNames(): string[] {
        return Array.from(this.storage.keys());
    }

    /**
     * 实现抽象方法：输出注册器状态
     */
    protected doInspect(): void {
        const entries = Array.from(this.storage.entries());
        if (entries.length === 0) {
            console.log('  (empty)');
            return;
        }

        entries.forEach(([name, entry]) => {
            console.log(`  ${name}: ${entry.description || 'no description'}`);
        });
    }
}
