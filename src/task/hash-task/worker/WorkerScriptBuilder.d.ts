/**
 * Worker脚本构建器
 *
 * 负责将算法函数转换为可在Worker中执行的源码字符串
 * 设计原则：只负责脚本的构建，不关心算法的具体实现
 *
 * 明确不负责：
 * - 不执行具体的哈希计算
 * - 不管理Worker生命周期
 * - 不处理通信协议
 */
export declare class WorkerScriptBuilder {
    private readonly template;
    /**
     * 将算法转换成 Worker 可执行的源码
     *
     * @param algorithm 要构建的算法，可以是函数或字符串
     * @returns 可在Worker中执行的源码字符串
     */
    build(algorithm: ((data: ArrayBuffer) => any) | string): string;
    /**
     * 获取内置算法的实现
     *
     * @param name 算法名称
     * @returns 对应算法的函数字符串实现
     * @private
     */
    private getBuiltInAlgorithm;
}
//# sourceMappingURL=WorkerScriptBuilder.d.ts.map