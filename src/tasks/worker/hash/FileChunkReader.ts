
import { ILogger, Logger } from "@orbitjs/logger";
import { FileChunk, ChunkReaderOptions } from "./types1";
import { HashErrorFactory, FileHashErrorCodes } from "./errors";

/**
 * 🎯 文件分片读取器
 * 负责流式读取文件并按指定大小分片
 */
export class FileChunkReader {
  private logger: ILogger;
  private options: Required<ChunkReaderOptions>;
  private isPaused: boolean = false;
  private isCancelled: boolean = false;
  private pauseResolve: (() => void) | null = null;

  constructor(options: ChunkReaderOptions) {
    this.logger = Logger.for(this.constructor.name);
    
    this.options = {
      bufferSize: 2,
      highWaterMark: 64 * 1024, // 64KB 读取缓冲区
      ...options
    };
    
    this.logger.debug('FileChunkReader initialized', {
      chunkSize: this.options.chunkSize,
      bufferSize: this.options.bufferSize,
      highWaterMark: this.options.highWaterMark
    });
  }

  /**
   * 🎯 异步迭代器：流式读取文件分片
   */
  async *readFile(file: File): AsyncGenerator<FileChunk, void, void> {
    this.logger.info('Starting file reading', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

    const totalSize = file.size;
    const chunkSize = this.options.chunkSize;
    const totalChunks = Math.ceil(totalSize / chunkSize);
    
    let offset = 0;
    let chunkIndex = 0;

    while (offset < totalSize && !this.isCancelled) {
      // 检查是否暂停
      await this.waitIfPaused();

      // 读取当前分片
      const end = Math.min(offset + chunkSize, totalSize);
      const isLast = end >= totalSize;
      
      try {
        const chunkStartTime = performance.now();
        const chunkData = await this.readChunk(file, offset, end);
        const readTime = performance.now() - chunkStartTime;

        this.logger.debug('Chunk read successfully', {
          chunkIndex,
          offset,
          size: chunkData.byteLength,
          readTime: readTime.toFixed(2),
          isLast
        });

        yield {
          index: chunkIndex,
          data: chunkData,
          offset,
          size: chunkData.byteLength,
          isLast
        };

        offset = end;
        chunkIndex++;

      } catch (error) {
        this.logger.error('Failed to read chunk', {
          chunkIndex,
          offset,
          error: error instanceof Error ? error.message : String(error)
        });

        throw HashErrorFactory.chunkReadError(
          chunkIndex,
          offset,
          error instanceof Error ? error : undefined
        );
      }
    }

    if (this.isCancelled) {
      this.logger.info('File reading cancelled', {
        chunksRead: chunkIndex,
        bytesRead: offset
      });
    } else {
      this.logger.info('File reading completed', {
        totalChunks,
        totalBytes: totalSize,
        chunksRead: chunkIndex
      });
    }
  }

  /**
   * 🎯 读取单个分片
   */
  private async readChunk(file: File, start: number, end: number): Promise<ArrayBuffer> {
    const chunk = file.slice(start, end);
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read chunk as ArrayBuffer'));
        }
      };
      
      reader.onerror = () => {
        reject(reader.error || new Error('Unknown FileReader error'));
      };
      
      // 设置超时
      const timeoutId = setTimeout(() => {
        reader.abort();
        reject(new Error('Chunk read timeout'));
      }, 30000); // 30秒超时

      reader.onloadend = () => {
        clearTimeout(timeoutId);
      };

      reader.readAsArrayBuffer(chunk);
    });
  }

  /**
   * 🎯 暂停读取
   */
  public pause(): void {
    if (!this.isPaused) {
      this.isPaused = true;
      this.logger.debug('File reading paused');
    }
  }

  /**
   * 🎯 恢复读取
   */
  public resume(): void {
    if (this.isPaused) {
      this.isPaused = false;
      if (this.pauseResolve) {
        this.pauseResolve();
        this.pauseResolve = null;
      }
      this.logger.debug('File reading resumed');
    }
  }

  /**
   * 🎯 取消读取
   */
  public cancel(): void {
    this.isCancelled = true;
    this.resume(); // 确保不会卡在等待状态
    this.logger.debug('File reading cancelled');
  }

  /**
   * 🎯 检查是否已取消
   */
  public isCancelledFlag(): boolean {
    return this.isCancelled;
  }

  /**
   * 🎯 等待暂停状态
   */
  private async waitIfPaused(): Promise<void> {
    if (this.isPaused) {
      this.logger.debug('Waiting at pause point');
      await new Promise<void>(resolve => {
        this.pauseResolve = resolve;
      });
    }
  }

  /**
   * 🎯 计算文件分片信息（不实际读取）
   */
  public static calculateChunks(fileSize: number, chunkSize: number): Array<{index: number, offset: number, size: number}> {
    const chunks = [];
    let offset = 0;
    let index = 0;

    while (offset < fileSize) {
      const end = Math.min(offset + chunkSize, fileSize);
      const size = end - offset;
      
      chunks.push({
        index: index++,
        offset,
        size
      });

      offset = end;
    }

    return chunks;
  }

  /**
   * 🎯 获取读取器状态
   */
  public getStatus(): {
    isPaused: boolean;
    isCancelled: boolean;
    options: ChunkReaderOptions;
  } {
    return {
      isPaused: this.isPaused,
      isCancelled: this.isCancelled,
      options: this.options
    };
  }
}