"use strict";
/**
 * 数据处理权重阶段定义
 *
 * 参照 validation 的权重设计，定义数据处理的不同阶段
 *
 * @module data-processor/weights
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataProcessorWeight = void 0;
exports.getWeightName = getWeightName;
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
var DataProcessorWeight;
(function (DataProcessorWeight) {
    /**
     * 准备阶段
     * - 参数初始化
     * - 默认值设置
     * - 上下文准备
     */
    DataProcessorWeight[DataProcessorWeight["PREPARATION"] = 0] = "PREPARATION";
    /**
     * 转换阶段
     * - 参数转换（如分页参数）
     * - 格式化
     * - 单位转换
     */
    DataProcessorWeight[DataProcessorWeight["TRANSFORM"] = 1000] = "TRANSFORM";
    /**
     * 验证阶段
     * - 参数校验
     * - 权限检查
     */
    DataProcessorWeight[DataProcessorWeight["VALIDATION"] = 2000] = "VALIDATION";
    /**
     * 增强阶段
     * - 注入 Header
     * - 注入 Token
     * - 注入租户信息
     */
    DataProcessorWeight[DataProcessorWeight["ENRICHMENT"] = 3000] = "ENRICHMENT";
    /**
     * 交换阶段（仅前道）
     * - HTTP 请求发送
     * - 响应接收
     */
    DataProcessorWeight[DataProcessorWeight["EXCHANGE"] = 4000] = "EXCHANGE";
    /**
     * 提取阶段（仅后道）
     * - 数据提取
     * - 结构解析
     * - 格式识别
     */
    DataProcessorWeight[DataProcessorWeight["EXTRACT"] = 5000] = "EXTRACT";
    /**
     * 对齐阶段
     * - 数据对齐
     * - 字段映射
     * - 格式转换
     */
    DataProcessorWeight[DataProcessorWeight["ALIGN"] = 6000] = "ALIGN";
    /**
     * 错误阶段
     * - 错误识别
     * - 错误转换
     * - 错误处理
     */
    DataProcessorWeight[DataProcessorWeight["ERROR"] = 7000] = "ERROR";
    /**
     * 结算阶段
     * - 最终处理
     * - 清理工作
     * - 日志记录
     */
    DataProcessorWeight[DataProcessorWeight["FINALIZE"] = 8000] = "FINALIZE";
})(DataProcessorWeight || (exports.DataProcessorWeight = DataProcessorWeight = {}));
/**
 * 获取权重阶段名称
 */
function getWeightName(weight) {
    for (const [name, value] of Object.entries(DataProcessorWeight)) {
        if (value === weight) {
            return name;
        }
    }
    return 'UNKNOWN';
}
//# sourceMappingURL=weights.js.map