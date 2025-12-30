import { AlgorithmLibraryConfig } from './AlgorithmRegistry';

/**
 * 全局配置哈希算法库
 *
 * 此函数允许用户在应用启动时配置算法库的路径
 *
 * @param config 算法库配置对象，键名为算法名称，值为包含库路径的对象
 *
 * 示例:
 * ```typescript
 * import { configureAlgorithms } from '@orbitjs/tasks';
 *
 * configureAlgorithms({
 *   MD5: {
 *     libraryPath: '/assets/spark-md5.min.js', // 使用本地文件
 *   },
 *   XXHASH64: {
 *     libraryPath: 'https://my-cdn.com/xxhash-wasm.js', // 使用自定义CDN
 *   }
 * });
 * ```
 */
export function configureAlgorithms(config: AlgorithmLibraryConfig): void {
    const { AlgorithmRegistry } = require('./AlgorithmRegistry');
    const registry = AlgorithmRegistry.getInstance();
    registry.configureAlgorithmLibraries(config);
}
