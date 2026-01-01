import { IMemoryTicket, MemoryManager } from '@orbitjs/runtime-env';
import { WorkerHandle, WorkerPool } from '../worker';
import { ResourceUnavailableError } from '../errors';
import { ResourceNotAcquiredError } from '../errors/ResourceNotAcquiredError';

/**
 * HashTaskResources 只做 3 件事：
 * - 申请资源
 *   - 内存预算
 *   - Worker槽位
 * - 释放资源
 * - 暴露一个只读视图，给 Runner 用
 *
 * 明确不负责：
 * - 不分块
 * - 不调度任务
 * - 不执行哈希计算
 * - 不处理进度
 * - 不做健康判断（HealthMonitor 的事）
 */

/**
 * 哈希任务资源快照接口
 *
 * 定义了哈希任务资源的快照信息
 */
export interface HashTaskResourceSnapshot {
    /** 已分配的内存字节数（可选） */
    memoryBytes?: number;
    /** 是否拥有Worker */
    hasWorker: boolean;
}

/**
 * 哈希任务资源管理类
 *
 * 负责管理哈希任务所需的资源，包括内存和Worker。
 * 这是一个资源管理器，用于在执行哈希任务时获取和释放必要的计算资源。
 * 设计原则是单一职责，只负责资源的申请和释放，不涉及具体的哈希计算逻辑。
 *
 * 设计原则：
 * - 仅负责资源的申请与释放
 * - 不涉及具体哈希计算逻辑
 * - 保证资源操作的原子性
 * - 提供资源状态快照
 */
export class HashTaskResources {
    private memoryTicket?: IMemoryTicket;  // 存储内存资源票据，用于后续释放
    private worker?: WorkerHandle;         // 存储Worker句柄，用于执行哈希计算
    private acquired = false;              // 标记资源是否已成功获取

    /**
     * 构造函数
     *
     * @param memoryManager 内存管理器，用于申请和释放内存资源
     * @param workerPool Worker池，用于获取和归还Worker线程
     */
    constructor(
        private readonly memoryManager: MemoryManager,
        private readonly workerPool: WorkerPool
    ) {}

    /**
     * 核心：申请计算所需的资源（内存 + 线程）
     *
     * 此方法用于为哈希任务申请必要的计算资源。如果资源已经获取，则直接返回。
     * 方法具有原子性，要么成功获取所有资源，要么在失败时释放已获取的资源。
     *
     * @param scriptSource 经过 Builder 转换后的算法源码字符串，将被注入到Worker中
     * @param memoryBytes 需要锁定的内存预算，以字节为单位
     * @returns 当资源成功获取后解析的Promise
     * @throws 当资源申请失败时，会抛出相应的错误，并确保已申请的资源被释放
     */
    async acquire(scriptSource: string, memoryBytes: number): Promise<void> {
        if (this.acquired) return;  // 防止重复获取资源

        try {
            // 按顺序获取内存和Worker资源
            await this.acquireMemory(memoryBytes);
            await this.acquireWorker(scriptSource);
            this.acquired = true;  // 标记资源已获取
        } catch (err) {
            // 如果获取过程中出现错误，释放已获取的资源
            await this.release();
            throw err;  // 重新抛出原始错误
        }
    }

    /**
     * 专用方法：获取内存资源
     *
     * 尝试从内存管理器获取指定数量的字节，如果失败则抛出内存资源不可用错误
     *
     * @param memoryBytes 需要获取的内存字节数
     * @throws ResourceUnavailableError 如果内存不足或获取失败
     */
    private async acquireMemory(memoryBytes: number) {
        try {
            this.memoryTicket = await this.memoryManager.acquire(memoryBytes);
        } catch (err) {
            throw new ResourceUnavailableError('memory', {
                requestedBytes: memoryBytes,
                originalError: err instanceof Error ? err.message : err,
            });
        }
    }

    /**
     * 专用方法：获取Worker资源
     *
     * 尝试从Worker池获取一个Worker实例，如果失败则抛出Worker资源不可用错误
     *
     * @param scriptSource 要注入到Worker中的脚本源码
     * @throws ResourceUnavailableError 如果Worker池已满或获取失败
     */
    private async acquireWorker(scriptSource: string) {
        try {
            this.worker = await this.workerPool.acquire(scriptSource);
        } catch (err) {
            throw new ResourceUnavailableError('worker', {
                originalError: err instanceof Error ? err.message : err,
            });
        }
    }
    
    /**
     * 释放所有资源（幂等）
     *
     * 释放之前通过acquire方法获取的所有资源。此方法是幂等的，
     * 即可以安全地多次调用而不会产生副作用。
     * 无论资源是否已经被释放，或者从未被获取，调用此方法都是安全的。
     *
     * @returns 当资源成功释放后解析的Promise
     */
    async release(): Promise<void> {
        // 释放Worker资源（如果已获取）
        if (this.worker) {
            try {
                this.workerPool.release(this.worker);
            } catch (error) {
                // 即使释放worker失败，也要继续释放其他资源
                console.error('Failed to release worker:', error);
            }
            this.worker = undefined;
        }

        // 释放内存资源（如果已获取）
        if (this.memoryTicket) {
            try {
                this.memoryTicket.release();
            } catch (error) {
                // 即使释放内存失败，也要继续执行
                console.error('Failed to release memory ticket:', error);
            }
            this.memoryTicket = undefined;
        }

        // 重置获取状态
        this.acquired = false;
    }

    /**
     * 访问 worker（只允许 Runner 用）
     *
     * 获取当前持有的Worker句柄，供Runner使用来执行实际的哈希计算。
     * 如果尚未获取Worker或Worker已被释放，则抛出错误。
     *
     * @returns Worker句柄，可用于向Worker发送消息和接收结果
     * @throws 如果Worker尚未获取则抛出错误，确保使用者意识到资源未就绪
     */
    getWorker(): WorkerHandle {
        if (!this.worker) {
            throw new ResourceNotAcquiredError();
        }
        return this.worker;
    }

    /**
     * 当前资源快照（给 health / debug）
     *
     * 获取当前资源使用情况的快照，主要用于健康检查和调试目的。
     * 返回一个不可变的对象，包含当前内存使用量和Worker状态。
     *
     * @returns 资源快照对象，包含内存字节数（如果有）和Worker存在状态
     */
    snapshot(): HashTaskResourceSnapshot {
        return {
            // ✅ 修正：如果有内存票据，返回具体的字节数
            memoryBytes: this.memoryTicket?.bytes,
            hasWorker: !!this.worker,  // 确保返回布尔值
        };
    }
}