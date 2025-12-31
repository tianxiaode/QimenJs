import { DefaultWorkerPool } from './DefaultWorkerPool';

export class BrowserWorkerPool extends DefaultWorkerPool {
/**
     * 浏览器环境下的池子实现
     * @param poolSize 并行 Worker 数量，默认根据 CPU 核心数计算
     */
    constructor(
        poolSize: number = Math.min(navigator.hardwareConcurrency || 4, 8)
    ) {
        // 现在父类构造函数只接收 maxWorkers
        super(poolSize);
    }

}
