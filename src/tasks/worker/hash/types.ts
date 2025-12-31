// types.ts

/**
 * 核心哈希计算函数类型
 * 用户传入的算法函数，接收分片数据，返回哈希字符串
 */
export type HashAlgorithm = (
  chunk: ArrayBuffer,
  options?: AlgorithmOptions
) => string | Promise<string>;

/**
 * 算法特定选项
 */
export interface AlgorithmOptions {
  seed?: number;          // 如xxhash64需要的种子
  encoding?: string;      // 编码方式
  [key: string]: any;     // 其他算法特定参数
}

/**
 * 哈希计算器配置
 */
export interface HashCalculatorConfig {
  chunkSize?: number;     // 分片大小（字节），默认1MB
  maxWorkers?: number;    // 最大Worker数量，默认CPU核心数（最多4个）
  algorithmOptions?: AlgorithmOptions; // 算法特定选项
}

/**
 * 进度信息
 */
export interface HashProgress {
  processedChunks: number;    // 已处理分片数
  totalChunks: number;        // 总分片数
  processedBytes: number;     // 已处理字节数
  totalBytes: number;         // 总字节数
  percentage: number;         // 完成百分比（0-100）
  currentSpeed?: number;      // 当前处理速度（字节/秒）
  estimatedTime?: number;     // 预计剩余时间（秒）
}

/**
 * 分片哈希结果
 */
export interface ChunkHashResult {
  index: number;          // 分片索引（从0开始）
  hash: string;           // 分片哈希值
  offset: number;         // 在文件中的偏移量（字节）
  size: number;           // 分片大小（字节）
  timeCost: number;       // 计算耗时（毫秒）
}

/**
 * 最终哈希计算结果
 */
export interface HashResult {
  totalHash: string;      // 文件整体哈希值
  chunkHashes: ChunkHashResult[]; // 所有分片的哈希结果
  metadata: {
    fileSize: number;     // 文件大小（字节）
    chunkSize: number;    // 分片大小（字节）
    chunkCount: number;   // 分片总数
    algorithmName: string; // 算法名称（从函数名提取或用户指定）
    timeCost: number;     // 总计算时间（毫秒）
    timestamp: number;    // 计算完成时间戳
  };
}

/**
 * 计算器状态
 */
export type CalculatorState = 
  | 'idle'       // 空闲
  | 'reading'    // 正在读取文件
  | 'computing'  // 正在计算哈希
  | 'paused'     // 已暂停
  | 'cancelled'  // 已取消
  | 'error';     // 错误状态

/**
 * Worker消息类型
 */
export type WorkerMessageType = 
  | 'COMPUTE_CHUNK'   // 计算分片
  | 'CHUNK_RESULT'    // 分片计算结果
  | 'ERROR'          // 错误
  | 'PING'           // 心跳检测
  | 'PONG';          // 心跳响应

/**
 * 主线程 -> Worker 的消息
 */
export interface WorkerRequestMessage {
  type: WorkerMessageType;
  taskId: string;           // 任务ID
  chunk?: ArrayBuffer;      // 分片数据（COMPUTE_CHUNK时）
  options?: AlgorithmOptions; // 算法选项
}

/**
 * Worker -> 主线程 的消息
 */
export interface WorkerResponseMessage {
  type: WorkerMessageType;
  taskId: string;           // 对应的任务ID
  hash?: string;           // 计算结果（CHUNK_RESULT时）
  error?: string;          // 错误信息（ERROR时）
}

/**
 * 可暂停控制接口
 */
export interface Pausable {
  pause(): void;
  resume(): void;
  isPaused(): boolean;
}

/**
 * 可取消任务接口
 */
export interface Cancellable {
  cancel(): Promise<void>;
  isCancelled(): boolean;
}

/**
 * 文件分片信息
 */
export interface FileChunk {
  index: number;          // 分片索引
  data: ArrayBuffer;      // 分片数据
  offset: number;         // 文件偏移量
  size: number;           // 分片大小
  isLast: boolean;        // 是否是最后一个分片
}

/**
 * 分片读取选项
 */
export interface ChunkReaderOptions {
  chunkSize: number;      // 分片大小
  bufferSize?: number;    // 缓冲区大小（默认2个分片）
  highWaterMark?: number; // 高水位标记（控制内存使用）
}

/**
 * 任务队列项
 */
export interface TaskQueueItem {
  chunk: FileChunk;       // 分片数据
  resolve: (hash: string) => void;  // 成功回调
  reject: (error: Error) => void;   // 失败回调
  startTime: number;      // 任务开始时间
}