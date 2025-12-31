import { HashResult, HashOptions, HashAlgorithm, HashFormat, AlgorithFunction } from '../types';
import { ILogger, Logger } from '@orbitjs/logger';

export interface HashCalculationResult {
  hash: string;
  timeCost: number;
  chunkCount: number;
}

export interface ChunkResult {
  hash: string;
  index: number;
}

export interface FileChunk {
  data: ArrayBuffer;
  index: number;
}

export interface DataChunk {
  data: any;
  index: number;
}

export class HashCalculator {
  private logger: ILogger;

  constructor() {
    this.logger = Logger.for(this.constructor.name);
  }

  /**
   * 计算单个数据块的哈希
   */
  public async calculateHashForChunk(chunk: any, algorithmFn: AlgorithFunction, options?: HashOptions): Promise<ChunkResult> {
    const startTime = performance.now();
    
    try {
      const hash = await Promise.resolve(algorithmFn(chunk, options));
      const timeCost = performance.now() - startTime;

      return {
        hash,
        index: 0, // 在单个块计算中，索引通常不重要
      };
    } catch (error) {
      this.logger.error('Error calculating hash for chunk:', error);
      throw error;
    }
  }

  /**
   * 计算整个数据的哈希
   */
  public async calculateHashForData(data: any, algorithmFn: AlgorithFunction, options?: HashOptions): Promise<HashCalculationResult> {
    const startTime = performance.now();
    
    try {
      const hash = await Promise.resolve(algorithmFn(data, options));
      const timeCost = performance.now() - startTime;

      return {
        hash,
        timeCost,
        chunkCount: 1,
      };
    } catch (error) {
      this.logger.error('Error calculating hash for data:', error);
      throw error;
    }
  }

  /**
   * 计算多个数据块的哈希并合并结果
   */
  public async calculateHashForChunks(chunks: any[], algorithmFn: AlgorithFunction, options?: HashOptions): Promise<HashCalculationResult> {
    const startTime = performance.now();
    
    try {
      // 并行处理所有块
      const chunkPromises = chunks.map((chunk, index) => 
        this.calculateHashForChunk(chunk, algorithmFn, options)
          .then(result => ({ ...result, index }))
      );
      
      const chunkResults = await Promise.all(chunkPromises);
      
      // 按索引排序确保顺序正确
      chunkResults.sort((a, b) => a.index - b.index);
      
      // 合并所有块的哈希结果
      const combinedHash = chunkResults.map(result => result.hash).join('');
      
      // 对合并后的结果再次应用算法
      const finalHash = await Promise.resolve(algorithmFn(combinedHash, options));
      const timeCost = performance.now() - startTime;

      return {
        hash: finalHash,
        timeCost,
        chunkCount: chunks.length,
      };
    } catch (error) {
      this.logger.error('Error calculating hash for chunks:', error);
      throw error;
    }
  }

  /**
   * 处理大数据的哈希计算（分块计算并合并）
   */
  public async processLargeData(
    data: any, 
    dataSize: number, 
    chunkSize: number, 
    algorithmFn: AlgorithFunction, 
    options?: HashOptions
  ): Promise<HashCalculationResult> {
    const chunks = this.createDataChunks(data, dataSize, chunkSize);
    return this.calculateHashForChunks(chunks, algorithmFn, options);
  }

  /**
   * 处理大文件的哈希计算（分块计算并合并）
   */
  public async processLargeFile(
    fileData: ArrayBuffer, 
    chunkSize: number, 
    algorithmFn: AlgorithFunction, 
    options?: HashOptions
  ): Promise<HashCalculationResult> {
    const chunks = this.createFileChunks(fileData, chunkSize);
    return this.calculateHashForChunks(chunks, algorithmFn, options);
  }

  /**
   * 将数据分块
   */
  private createDataChunks(data: any, dataSize: number, chunkSize: number): any[] {
    const chunks: any[] = [];
    
    if (typeof data === 'string') {
      // 处理字符串数据
      for (let i = 0; i < dataSize; i += chunkSize) {
        const end = Math.min(i + chunkSize, dataSize);
        chunks.push(data.slice(i, end));
      }
    } else if (data instanceof ArrayBuffer) {
      // 处理ArrayBuffer数据
      for (let i = 0; i < dataSize; i += chunkSize) {
        const end = Math.min(i + chunkSize, dataSize);
        chunks.push(data.slice(i, end));
      }
    } else {
      // 其他类型的数据，转换为字符串处理
      const strData = JSON.stringify(data);
      for (let i = 0; i < strData.length; i += chunkSize) {
        const end = Math.min(i + chunkSize, strData.length);
        chunks.push(strData.slice(i, end));
      }
    }
    
    return chunks;
  }

  /**
   * 将文件数据分块
   */
  private createFileChunks(fileData: ArrayBuffer, chunkSize: number): ArrayBuffer[] {
    const chunks: ArrayBuffer[] = [];
    const totalSize = fileData.byteLength;
    
    for (let i = 0; i < totalSize; i += chunkSize) {
      const end = Math.min(i + chunkSize, totalSize);
      chunks.push(fileData.slice(i, end));
    }
    
    return chunks;
  }

  /**
   * 从计算结果创建HashResult对象
   */
  public createHashResult(
    algorithm: HashAlgorithm,
    hash: string,
    format: HashFormat,
    fileSize: number,
    timeCost: number,
    chunkCount: number
  ): HashResult {
    return {
      algorithm,
      hash,
      format,
      fileSize,
      timeCost,
      chunkCount
    };
  }
}