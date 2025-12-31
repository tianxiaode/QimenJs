export interface Chunk {
    id: string;
    data: ArrayBuffer;
}

export interface ChunkProvider {
  /** 获取下一个分片，如果没有则返回 null */
  next(): Promise<Chunk | null>;
  
  /** 是否还有后续分片 (Runner 循环需要) */
  hasNext(): boolean;
  
  /** 获取配置的分片大小 (Runner 内存计算需要) */
  getChunkSize(): number;
  
  /** 获取总字节数 (Progress 初始化需要) */
  getTotalSize(): number | undefined;
}

export interface ChunkSource {
    next(): Promise<Chunk | null>;
    pause(): void;
    resume(): void;
    close(): void;
}
