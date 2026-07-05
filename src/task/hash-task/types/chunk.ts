/**
 * 数据块接口
 *
 * 定义了数据块的基本结构，包含唯一标识和实际数据
 */
export interface Chunk {
    /** 数据块的唯一标识符 */
    id: string;
    /** 数据块的实际内容，以ArrayBuffer形式存储 */
    data: ArrayBuffer;
}

/**
 * 数据块提供者接口
 *
 * 定义了获取数据块的接口，用于向任务提供待处理的数据
 */
export interface ChunkProvider {
    /**
     * 获取下一个分片，如果没有则返回 null
     *
     * @returns Promise，解析为下一个数据块或null
     */
    next(): Promise<Chunk | null>;

    /**
     * 检查是否还有后续分片
     *
     * @returns 如果还有后续分片则返回true，否则返回false
     */
    hasNext(): boolean;

    /**
     * 获取配置的分片大小
     *
     * @returns 分片大小（以字节为单位）
     */
    getChunkSize(): number;

    /**
     * 获取总字节数
     *
     * @returns 总字节数，如果未知则返回undefined
     */
    getTotalSize(): number | undefined;
}

/**
 * 数据块源接口
 *
 * 定义了数据块源的基本操作，包括获取数据、暂停、恢复和关闭
 */
export interface ChunkSource {
    /**
     * 获取下一个数据块
     *
     * @returns Promise，解析为下一个数据块或null
     */
    next(): Promise<Chunk | null>;
    /** 暂停数据源 */
    pause(): void;
    /** 恢复数据源 */
    resume(): void;
    /** 关闭数据源，释放相关资源 */
    close(): void;
}
