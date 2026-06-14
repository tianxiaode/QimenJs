"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserWorkerPool = void 0;
const DefaultWorkerPool_1 = require("./DefaultWorkerPool");
/**
 * 浏览器环境下的Worker池实现
 *
 * 继承自DefaultWorkerPool，针对浏览器环境进行了优化
 * 设计原则：只负责Worker的生命周期管理，不关心具体执行的任务
 *
 * 明确不负责：
 * - 不执行具体的哈希计算
 * - 不管理任务状态
 * - 不处理算法逻辑
 */
class BrowserWorkerPool extends DefaultWorkerPool_1.DefaultWorkerPool {
    /**
     * 浏览器环境下的池子实现
     *
     * @param poolSize 并行 Worker 数量，默认根据 CPU 核心数计算
     */
    constructor(poolSize = Math.min(navigator.hardwareConcurrency || 4, 8)) {
        // 现在父类构造函数只接收 maxWorkers
        super(poolSize);
    }
}
exports.BrowserWorkerPool = BrowserWorkerPool;
//# sourceMappingURL=BrowserWorkerPool.js.map