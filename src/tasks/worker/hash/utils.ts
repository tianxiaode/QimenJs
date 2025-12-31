// utils.ts (单独创建工具函数文件)

import { FileHashCalculator } from "./FileHashCalculator";
import { HashAlgorithm, HashProgress } from "./types";

/**
 * 🎯 快速计算文件哈希（简化API）
 */
export async function computeFileHash(
  file: File,
  algorithm: HashAlgorithm,
  options?: {
    chunkSize?: number;
    maxWorkers?: number;
    onProgress?: (progress: HashProgress) => void;
  }
): Promise<string> {
  const calculator = new FileHashCalculator(algorithm, {
    chunkSize: options?.chunkSize,
    maxWorkers: options?.maxWorkers
  });
  
  const result = await calculator.compute(file, options?.onProgress);
  return result.totalHash;
}

/**
 * 🎯 计算文件分片哈希（用于断点续传）
 */
export async function computeFileChunkHashes(
  file: File,
  algorithm: HashAlgorithm,
  options?: {
    chunkSize?: number;
    maxWorkers?: number;
  }
): Promise<Map<number, string>> {
  const calculator = new FileHashCalculator(algorithm, {
    chunkSize: options?.chunkSize,
    maxWorkers: options?.maxWorkers
  });
  
  // 这里简化处理，实际应该使用专门的方法
  const result = await calculator.compute(file);
  const chunkMap = new Map<number, string>();
  
  result.chunkHashes.forEach(chunk => {
    chunkMap.set(chunk.index, chunk.hash);
  });
  
  return chunkMap;
}

/**
 * 🎯 检查浏览器环境是否支持Web Worker
 */
export function isWebWorkerSupported(): boolean {
  return typeof Worker !== 'undefined';
}

/**
 * 🎯 检查浏览器环境是否支持所需API
 */
export function isEnvironmentSupported(): {
  webWorker: boolean;
  fileApi: boolean;
  blob: boolean;
  arrayBuffer: boolean;
} {
  return {
    webWorker: typeof Worker !== 'undefined',
    fileApi: typeof File !== 'undefined',
    blob: typeof Blob !== 'undefined',
    arrayBuffer: typeof ArrayBuffer !== 'undefined'
  };
}

/**
 * 🎯 估算计算时间（基于文件大小和经验数据）
 */
export function estimateComputeTime(
  fileSize: number,
  chunkSize: number = 1024 * 1024,
  workerCount: number = 1
): {
  estimatedTime: number; // 毫秒
  chunkCount: number;
  timePerChunk: number;
} {
  const chunkCount = Math.ceil(fileSize / chunkSize);
  // 经验值：每个分片约50ms（取决于算法复杂度）
  const timePerChunk = 50;
  const estimatedTime = (chunkCount * timePerChunk) / Math.max(workerCount, 1);
  
  return {
    estimatedTime,
    chunkCount,
    timePerChunk
  };
}

/**
 * 🎯 获取推荐的分片大小
 */
export function getRecommendedChunkSize(fileSize: number): number {
  if (fileSize <= 10 * 1024 * 1024) { // <= 10MB
    return 256 * 1024; // 256KB
  } else if (fileSize <= 100 * 1024 * 1024) { // <= 100MB
    return 1024 * 1024; // 1MB
  } else if (fileSize <= 1024 * 1024 * 1024) { // <= 1GB
    return 2 * 1024 * 1024; // 2MB
  } else {
    return 4 * 1024 * 1024; // 4MB
  }
}