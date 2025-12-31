import { ErrorBase } from '@orbitjs/error';

/**
 * 算法不支持错误类
 * 
 * 当尝试使用环境中不支持的哈希算法时抛出此错误。
 * 例如，某些浏览器可能不支持特定的加密算法。
 */
export class AlgorithmNotSupportedError extends ErrorBase {
    /**
     * 构造函数
     * 
     * @param algorithm - 尝试使用的算法名称
     * @param algorithmName - 算法名称，与algorithm参数相同，作为公共属性提供
     */
    constructor(
        algorithm: string,
        public readonly algorithmName: string
    ) {
        super(
            `AlgorithmNotSupportedError: Algorithm "${algorithm}" is not supported in this environment`,
            'ALGORITHM_NOT_SUPPORTED',
            { algorithm, algorithmName }
        );
        this.name = 'AlgorithmNotSupportedError';
    }
}