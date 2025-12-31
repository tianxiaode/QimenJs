import { FileHashCalculator } from './FileHashCalculator';
import { FileChunkReader } from './FileChunkReader';
import { AlgorithmWorkerPool } from './AlgorithmWorkerPool';
import { WorkerScriptBuilder } from './WorkerScriptBuilder';
import { HashAlgorithm, HashCalculatorConfig } from './types1';

/**
 * 🎯 文件哈希计算器工厂函数
 */
export function createFileHasher(
    algorithm: HashAlgorithm,
    config?: HashCalculatorConfig
): FileHashCalculator {
    return new FileHashCalculator(algorithm, config);
}

/**
 * 🎯 文件分片读取器工厂函数
 */
export function createFileChunkReader(
    chunkSize: number = 1024 * 1024,
    bufferSize: number = 2
): FileChunkReader {
    return new FileChunkReader({ chunkSize, bufferSize });
}

/**
 * 🎯 Worker池工厂函数
 */
export function createWorkerPool(algorithm: HashAlgorithm, poolSize?: number): AlgorithmWorkerPool {
    return new AlgorithmWorkerPool(algorithm, poolSize);
}

/**
 * 🎯 Worker脚本构建器工厂函数
 */
export function createWorkerScriptBuilder(): WorkerScriptBuilder {
    return new WorkerScriptBuilder();
}

/**
 * 🎯 预构建Worker脚本（用于调试或特殊情况）
 */
export function prebuildWorkerScript(algorithm: HashAlgorithm): string {
    const builder = new WorkerScriptBuilder();
    return builder.buildWorkerScript(algorithm);
}

/**
 * 🎯 创建Worker Blob URL（高级用法）
 */
export function createWorkerBlobUrl(algorithm: HashAlgorithm): string {
    const builder = new WorkerScriptBuilder();
    return builder.createWorkerBlobUrl(algorithm);
}
