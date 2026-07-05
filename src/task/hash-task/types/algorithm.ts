/**
 * 哈希算法上下文接口
 *
 * 定义了哈希算法执行时的上下文信息
 */
export interface HashAlgorithmContext {
    /** 当前处理的数据块索引 */
    readonly index: number;
    /** 总数据块数量（可选） */
    readonly total?: number;
}

/**
 * 哈希算法接口
 *
 * 定义了哈希算法应实现的基本方法
 */
export interface HashAlgorithm {
    /**
     * 初始化算法
     *
     * @returns 可选的初始化操作，可以是异步的
     */
    init?(): void | Promise<void>;

    /**
     * 更新哈希值
     *
     * 使用给定的数据块更新当前哈希值
     *
     * @param chunk 要处理的数据块
     * @param ctx 哈希算法上下文
     * @returns 可选的更新操作，可以是异步的
     */
    update(chunk: Uint8Array, ctx: HashAlgorithmContext): void | Promise<void>;

    /**
     * 生成最终哈希值
     *
     * @returns 最终的哈希值，可以是异步的
     */
    digest(): Uint8Array | Promise<Uint8Array>;
}
