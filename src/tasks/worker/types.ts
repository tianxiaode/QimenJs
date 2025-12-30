type MessageHandler = (event: MessageEvent) => void;
type ErrorHandler = (error: ErrorEvent) => void;
type MessageErrorHandler = (error: MessageEvent) => void;

export interface WorkerManagerOptions {
    onMessage?: MessageHandler;
    onError?: ErrorHandler;
    onMessageError?: MessageErrorHandler;
}

export type HashAlgorithm = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-512' | 'XXHASH64';
export type HashFormat = 'hex' | 'base64' | 'base64url';

export interface HashOptions {
    algorithm?: HashAlgorithm;
    chunkSize?: number;
    format?: HashFormat;
    seed?: number; // XXHASH64 算法专用种子
    normalizeLineEndings?: boolean; // 是否统一换行符
}

export interface HashResult {
    algorithm: HashAlgorithm;
    hash: string;
    format: HashFormat;
    fileSize: number;
    timeCost: number;
    chunkCount: number;
    workerId?: string;
}

export interface HashProgress {
    processedBytes: number;
    totalBytes: number;
    percentage: number;
    currentChunk: number;
    totalChunks: number;
}

// 分片任务接口
export interface ChunkTask {
    id: string;
    chunk: Blob | ArrayBuffer;
    index: number;
    total: number;
    algorithm: HashAlgorithm;
    options?: HashOptions;
}

// Worker消息类型
export type WorkerMessage =
    | { type: 'INIT'; config: WorkerConfig }
    | { type: 'HASH_CHUNK'; task: ChunkTask }
    | {
          type: 'HASH_FULL';
          data: ArrayBuffer | Blob;
          algorithm: HashAlgorithm;
          options?: HashOptions;
      }
    | { type: 'TERMINATE' };

// Worker响应类型
export type WorkerResponse =
    | { type: 'READY' }
    | { type: 'CHUNK_RESULT'; taskId: string; hash: string; index: number }
    | { type: 'FULL_RESULT'; hash: string; algorithm: HashAlgorithm }
    | { type: 'PROGRESS'; processed: number; total: number }
    | { type: 'ERROR'; error: string; taskId?: string };

// Worker配置
export interface WorkerConfig {
    supportedAlgorithms: HashAlgorithm[];
    maxChunkSize: number;
    workerId: string;
}

// 事件类型
export type HashEventType = 'start' | 'progress' | 'chunk-complete' | 'complete' | 'error';

export interface HashEvent {
    type: HashEventType;
    data?: HashResult | HashProgress | Error;
}

// 回调类型
export type HashCallback = (event: HashEvent) => void;

export interface AlgorithmConfig {
  name: HashAlgorithm;
  libraryPath?: string;        // 第三方库路径
  importFunction?: () => Promise<any>; // 动态导入函数
  supported?: boolean;         // 是否支持
  validationFunction?: () => boolean; // 验证函数
}

export interface HashWorkerConfig {
  supportedAlgorithms: AlgorithmConfig[];
  fallbackAlgorithm?: HashAlgorithm;
  dynamicLoading?: boolean;    // 是否支持动态加载
}