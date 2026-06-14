/**
 * 数据处理权重阶段定义
 *
 * 参照 validation 的权重设计，定义数据处理的不同阶段
 *
 * @module data-processor/weights
 */
/**
 * 数据处理权重阶段
 *
 * @description 定义数据处理管道的执行阶段
 *
 * 执行顺序（按权重升序）：
 * 1. PREPARATION (0) - 准备阶段：参数初始化、默认值设置
 * 2. TRANSFORM (1000) - 转换阶段：参数转换、格式化
 * 3. VALIDATION (2000) - 验证阶段：参数校验
 * 4. ENRICHMENT (3000) - 增强阶段：注入额外信息（Header、Token）
 * 5. EXCHANGE (4000) - 交换阶段：HTTP 传输（仅前道）
 * 6. EXTRACT (5000) - 提取阶段：数据提取、解析（仅后道）
 * 7. ALIGN (6000) - 对齐阶段：数据对齐、转换
 * 8. ERROR (7000) - 错误阶段：错误处理
 * 9. FINALIZE (8000) - 结算阶段：最终处理、清理
 */
export declare enum DataProcessorWeight {
    /**
     * 准备阶段
     * - 参数初始化
     * - 默认值设置
     * - 上下文准备
     */
    PREPARATION = 0,
    /**
     * 转换阶段
     * - 参数转换（如分页参数）
     * - 格式化
     * - 单位转换
     */
    TRANSFORM = 1000,
    /**
     * 验证阶段
     * - 参数校验
     * - 权限检查
     */
    VALIDATION = 2000,
    /**
     * 增强阶段
     * - 注入 Header
     * - 注入 Token
     * - 注入租户信息
     */
    ENRICHMENT = 3000,
    /**
     * 交换阶段（仅前道）
     * - HTTP 请求发送
     * - 响应接收
     */
    EXCHANGE = 4000,
    /**
     * 提取阶段（仅后道）
     * - 数据提取
     * - 结构解析
     * - 格式识别
     */
    EXTRACT = 5000,
    /**
     * 对齐阶段
     * - 数据对齐
     * - 字段映射
     * - 格式转换
     */
    ALIGN = 6000,
    /**
     * 错误阶段
     * - 错误识别
     * - 错误转换
     * - 错误处理
     */
    ERROR = 7000,
    /**
     * 结算阶段
     * - 最终处理
     * - 清理工作
     * - 日志记录
     */
    FINALIZE = 8000
}
/**
 * 获取权重阶段名称
 */
export declare function getWeightName(weight: number): string;
//# sourceMappingURL=weights.d.ts.map