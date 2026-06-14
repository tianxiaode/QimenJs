import { MemoryManager } from '@orbitjs/runtime-env';
import { WorkerHandle, WorkerPool } from '../worker';
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
export declare class HashTaskResources {
    private readonly memoryManager;
    private readonly workerPool;
    private memoryTicket?;
    private worker?;
    private acquired;
    /**
     * 构造函数
     *
     * @param memoryManager 内存管理器，用于申请和释放内存资源
     * @param workerPool Worker池，用于获取和归还Worker线程
     */
    constructor(memoryManager: MemoryManager, workerPool: WorkerPool);
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
    acquire(scriptSource: string, memoryBytes: number): Promise<void>;
    /**
     * 专用方法：获取内存资源
     *
     * 尝试从内存管理器获取指定数量的字节，如果失败则抛出内存资源不可用错误
     *
     * @param memoryBytes 需要获取的内存字节数
     * @throws ResourceUnavailableError 如果内存不足或获取失败
     */
    private acquireMemory;
    /**
     * 专用方法：获取Worker资源
     *
     * 尝试从Worker池获取一个Worker实例，如果失败则抛出Worker资源不可用错误
     *
     * @param scriptSource 要注入到Worker中的脚本源码
     * @throws ResourceUnavailableError 如果Worker池已满或获取失败
     */
    private acquireWorker;
    /**
     * 释放所有资源（幂等）
     *
     * 释放之前通过acquire方法获取的所有资源。此方法是幂等的，
     * 即可以安全地多次调用而不会产生副作用。
     * 无论资源是否已经被释放，或者从未被获取，调用此方法都是安全的。
     *
     * @returns 当资源成功释放后解析的Promise
     */
    release(): Promise<void>;
    /**
     * 访问 worker（只允许 Runner 用）
     *
     * 获取当前持有的Worker句柄，供Runner使用来执行实际的哈希计算。
     * 如果尚未获取Worker或Worker已被释放，则抛出错误。
     *
     * @returns Worker句柄，可用于向Worker发送消息和接收结果
     * @throws 如果Worker尚未获取则抛出错误，确保使用者意识到资源未就绪
     */
    getWorker(): WorkerHandle;
    /**
     * 当前资源快照（给 health / debug）
     *
     * 获取当前资源使用情况的快照，主要用于健康检查和调试目的。
     * 返回一个不可变的对象，包含当前内存使用量和Worker状态。
     *
     * @returns 资源快照对象，包含内存字节数（如果有）和Worker存在状态
     */
    snapshot(): HashTaskResourceSnapshot;
}
//# sourceMappingURL=HashTaskResources.d.ts.map