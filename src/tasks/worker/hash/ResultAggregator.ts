import { ILogger, Logger } from "@orbitjs/logger";
import { 
  HashAlgorithm, 
  HashResult, 
  ChunkHashResult,
  AlgorithmOptions 
} from "./types";

/**
 * 🎯 结果聚合器
 * 负责收集分片哈希，计算最终哈希值，并生成完整结果
 */
export class ResultAggregator {
  private logger: ILogger;
  private chunkResults: ChunkHashResult[] = [];
  private startTime: number = 0;

  constructor(
    private algorithm: HashAlgorithm,
    private algorithmName: string = 'CUSTOM',
    private algorithmOptions?: AlgorithmOptions
  ) {
    this.logger = Logger.for(this.constructor.name);
    this.startTime = performance.now();
    
    this.logger.debug('ResultAggregator initialized', {
      algorithmName,
      algorithmOptions
    });
  }

  /**
   * 🎯 添加分片结果
   */
  public addChunkResult(
    index: number,
    hash: string,
    offset: number,
    size: number,
    computeTime: number
  ): void {
    const chunkResult: ChunkHashResult = {
      index,
      hash,
      offset,
      size,
      timeCost: computeTime
    };

    this.chunkResults.push(chunkResult);
    
    this.logger.debug('Chunk result added', {
      index,
      hash: this.truncateHash(hash),
      size,
      computeTime
    });
  }

  /**
   * 🎯 计算最终哈希
   */
  public async finalize(fileSize: number, chunkSize: number): Promise<HashResult> {
    const finalizeStartTime = performance.now();
    
    this.logger.info('Finalizing hash computation', {
      totalChunks: this.chunkResults.length,
      fileSize,
      chunkSize
    });

    try {
      // 1. 验证分片结果
      this.validateChunkResults();
      
      // 2. 排序分片结果（按索引）
      this.sortChunkResults();
      
      // 3. 计算最终哈希
      const finalHash = await this.computeFinalHash();
      
      // 4. 生成最终结果
      const result = this.buildResult(fileSize, chunkSize, finalHash, finalizeStartTime);
      
      this.logResult(result);
      
      return result;
      
    } catch (error) {
      this.logger.error('Failed to finalize hash computation', { error });
      throw error;
    }
  }

  /**
   * 🎯 验证分片结果
   */
  private validateChunkResults(): void {
    if (this.chunkResults.length === 0) {
      throw new Error('No chunk results to aggregate');
    }

    // 检查是否有重复索引
    const indices = new Set<number>();
    const duplicates: number[] = [];
    
    for (const result of this.chunkResults) {
      if (indices.has(result.index)) {
        duplicates.push(result.index);
      }
      indices.add(result.index);
    }
    
    if (duplicates.length > 0) {
      throw new Error(`Duplicate chunk indices: ${duplicates.join(', ')}`);
    }

    // 检查哈希值格式
    for (const result of this.chunkResults) {
      if (!result.hash || typeof result.hash !== 'string') {
        throw new Error(`Invalid hash for chunk ${result.index}: ${result.hash}`);
      }
    }

    this.logger.debug('Chunk results validated', {
      totalChunks: this.chunkResults.length,
      indices: Array.from(indices).sort((a, b) => a - b)
    });
  }

  /**
   * 🎯 排序分片结果
   */
  private sortChunkResults(): void {
    this.chunkResults.sort((a, b) => a.index - b.index);
    
    // 验证连续性
    for (let i = 0; i < this.chunkResults.length; i++) {
      if (this.chunkResults[i].index !== i) {
        this.logger.warn('Chunk indices are not continuous', {
          expected: i,
          actual: this.chunkResults[i].index
        });
        break;
      }
    }
  }

  /**
   * 🎯 计算最终哈希（使用拼接+再次哈希的策略）
   */
  private async computeFinalHash(): Promise<string> {
    const combineStartTime = performance.now();
    
    // 策略：拼接所有分片哈希，然后对拼接结果再次哈希
    // 这样可以保证最终哈希长度固定，且与分片哈希算法一致
    
    this.logger.debug('Computing final hash', {
      chunkCount: this.chunkResults.length
    });

    // 1. 拼接所有分片哈希
    const concatenatedHashes = this.chunkResults
      .map(chunk => chunk.hash)
      .join('');
    
    // 2. 将拼接后的字符串转换为ArrayBuffer
    const encoder = new TextEncoder();
    const combinedData = encoder.encode(concatenatedHashes);
    
    // 3. 对拼接结果再次应用哈希算法
    const finalHash = await this.algorithm(combinedData, this.algorithmOptions);
    
    const combineTime = performance.now() - combineStartTime;
    
    this.logger.debug('Final hash computed', {
      combineTime: combineTime.toFixed(2),
      concatenatedLength: concatenatedHashes.length,
      finalHash: this.truncateHash(finalHash)
    });
    
    return finalHash;
  }

  /**
   * 🎯 构建最终结果
   */
  private buildResult(
    fileSize: number,
    chunkSize: number,
    finalHash: string,
    finalizeStartTime: number
  ): HashResult {
    const totalTime = performance.now() - this.startTime;
    const finalizeTime = performance.now() - finalizeStartTime;
    
    // 计算分片统计信息
    const chunkStats = this.calculateChunkStats();
    
    const result: HashResult = {
      totalHash: finalHash,
      chunkHashes: [...this.chunkResults], // 复制数组
      metadata: {
        fileSize,
        chunkSize,
        chunkCount: this.chunkResults.length,
        algorithmName: this.algorithmName,
        timeCost: Math.round(totalTime),
        timestamp: Date.now(),
        stats: {
          totalChunks: this.chunkResults.length,
          avgChunkTime: chunkStats.avgComputeTime,
          maxChunkTime: chunkStats.maxComputeTime,
          minChunkTime: chunkStats.minComputeTime,
          finalizationTime: Math.round(finalizeTime)
        }
      }
    };
    
    return result;
  }

  /**
   * 🎯 计算分片统计信息
   */
  private calculateChunkStats(): {
    totalComputeTime: number;
    avgComputeTime: number;
    maxComputeTime: number;
    minComputeTime: number;
  } {
    if (this.chunkResults.length === 0) {
      return {
        totalComputeTime: 0,
        avgComputeTime: 0,
        maxComputeTime: 0,
        minComputeTime: 0
      };
    }
    
    let total = 0;
    let max = Number.MIN_SAFE_INTEGER;
    let min = Number.MAX_SAFE_INTEGER;
    
    for (const chunk of this.chunkResults) {
      total += chunk.timeCost;
      max = Math.max(max, chunk.timeCost);
      min = Math.min(min, chunk.timeCost);
    }
    
    return {
      totalComputeTime: total,
      avgComputeTime: total / this.chunkResults.length,
      maxComputeTime: max,
      minComputeTime: min
    };
  }

  /**
   * 🎯 记录结果日志
   */
  private logResult(result: HashResult): void {
    const { metadata } = result;
    
    this.logger.info('Hash computation completed successfully', {
      totalHash: this.truncateHash(result.totalHash),
      fileSizeMB: (metadata.fileSize / 1024 / 1024).toFixed(2),
      chunkCount: metadata.chunkCount,
      totalTime: metadata.timeCost,
      algorithm: metadata.algorithmName,
      avgChunkTime: metadata.stats?.avgChunkTime?.toFixed(2),
      finalizationTime: metadata.stats?.finalizationTime
    });
    
    // 详细日志（仅调试级别）
    this.logger.debug('Detailed hash results', {
      chunkHashes: result.chunkHashes.map(chunk => ({
        index: chunk.index,
        hash: this.truncateHash(chunk.hash),
        size: chunk.size,
        timeCost: chunk.timeCost
      }))
    });
  }

  /**
   * 🎯 截断哈希值用于日志显示
   */
  private truncateHash(hash: string, length: number = 16): string {
    if (hash.length <= length) {
      return hash;
    }
    return hash.substring(0, length) + '...';
  }

  /**
   * 🎯 获取当前聚合器状态
   */
  public getStatus(): {
    chunkCount: number;
    totalComputeTime: number;
    avgComputeTime: number;
  } {
    const stats = this.calculateChunkStats();
    
    return {
      chunkCount: this.chunkResults.length,
      totalComputeTime: stats.totalComputeTime,
      avgComputeTime: stats.avgComputeTime
    };
  }

  /**
   * 🎯 重置聚合器（用于重新计算）
   */
  public reset(): void {
    this.chunkResults = [];
    this.startTime = performance.now();
    this.logger.debug('ResultAggregator reset');
  }

  /**
   * 🎯 导出分片哈希映射
   */
  public exportChunkMap(): Map<number, string> {
    const map = new Map<number, string>();
    for (const chunk of this.chunkResults) {
      map.set(chunk.index, chunk.hash);
    }
    return map;
  }

  /**
   * 🎯 验证分片哈希（用于断点续传验证）
   */
  public verifyChunkHash(index: number, expectedHash: string): boolean {
    const chunk = this.chunkResults.find(c => c.index === index);
    if (!chunk) {
      return false;
    }
    return chunk.hash === expectedHash;
  }
}