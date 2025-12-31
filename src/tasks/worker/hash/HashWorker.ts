// HashWorker.ts - 用于哈希计算的Web Worker实现
import { md5, sha1, sha256, sha512, xxhash64 } from '@orbitjs/crypto';

// 定义消息类型
interface HashMessage {
  type: string;
  data?: any;
  algorithm?: string;
  taskId?: string;
  options?: any;
}

// 定义响应类型
interface HashResponse {
  type: string;
  hash?: string;
  taskId?: string;
  processed?: number;
  total?: number;
  error?: string;
  index?: number;  // 为CHUNK_RESULT添加index属性
  algorithm?: string;  // 为FULL_RESULT添加algorithm属性
}

// 用于分片处理的上下文
interface ChunkContext {
  taskId: string;
  chunks: Uint8Array[];
  currentIndex: number;
  totalChunks: number;
  algorithm: string;
  options: any;
}

// 存储分片处理上下文
const chunkContexts = new Map<string, ChunkContext>();

// 计算哈希的函数
function computeHash(data: string | ArrayBuffer, algorithm: string, options: any = {}): string {
  try {
    // 转换数据为字符串
    let dataStr: string;
    if (data instanceof ArrayBuffer) {
      const uint8Array = new Uint8Array(data);
      // 将字节数组转换为字符串
      dataStr = Array.from(uint8Array)
        .map(byte => String.fromCharCode(byte))
        .join('');
    } else {
      dataStr = data;
    }

    // 如果需要规范化换行符
    if (options.normalizeLineEndings) {
      dataStr = dataStr.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    }

    // 根据算法类型计算哈希
    switch (algorithm) {
      case 'MD5':
        return md5(dataStr);
      case 'SHA-1':
        return sha1(dataStr);
      case 'SHA-256':
        return sha256(dataStr);
      case 'SHA-512':
        return sha512(dataStr);
      case 'XXHASH64':
        // 使用提供的种子或默认为0
        return xxhash64(dataStr, options.seed || 0);
      default:
        throw new Error(`Unsupported algorithm: ${algorithm}`);
    }
  } catch (error) {
    console.error('Error computing hash:', error);
    throw error;
  }
}

// Web Worker 事件监听器
self.onmessage = function (event: MessageEvent<HashMessage>) {
  const { type, data, algorithm, taskId, options } = event.data;

  try {
    switch (type) {
      case 'INIT_CONFIG':
        // 发送READY消息表示Worker已初始化
        const response: HashResponse = { type: 'READY' };
        self.postMessage(response);
        break;

      case 'HASH_FULL':
        // 计算完整数据的哈希
        const fullHash = computeHash(data, algorithm!, options);
        const fullResponse: HashResponse = {
          type: 'FULL_RESULT',
          hash: fullHash,
          algorithm: algorithm,
          taskId,
        };
        self.postMessage(fullResponse);
        break;

      case 'HASH_CHUNK':
        // 开始分片处理
        if (taskId) {
          const context: ChunkContext = {
            taskId,
            chunks: [new Uint8Array(data as ArrayBuffer)],
            currentIndex: 0,
            totalChunks: 1,
            algorithm: algorithm!,
            options,
          };
          chunkContexts.set(taskId, context);

          // 发送分片结果
          const chunkHash = computeHash(data, algorithm!, options);
          const chunkResponse: HashResponse = {
            type: 'CHUNK_RESULT',
            hash: chunkHash,
            taskId,
            index: 0,
          };
          self.postMessage(chunkResponse);
        }
        break;

      case 'COMBINE_HASHES':
        // 合并多个哈希值
        if (taskId) {
          const context = chunkContexts.get(taskId);
          if (context) {
            // 将所有分片的哈希值连接起来再次哈希
            const combinedHash = computeHash(
              context.chunks.map(chunk => Array.from(chunk).map(b => String.fromCharCode(b)).join('')).join(''),
              algorithm!,
              options
            );
            
            const combineResponse: HashResponse = {
              type: 'FULL_RESULT',
              hash: combinedHash,
              algorithm: algorithm,
              taskId,
            };
            self.postMessage(combineResponse);
            
            chunkContexts.delete(taskId);
          }
        }
        break;

      default:
        console.warn(`Unknown message type: ${type}`);
        break;
    }
  } catch (error) {
    const errorResponse: HashResponse = {
      type: 'ERROR',
      error: (error as Error).message,
      taskId,
    };
    self.postMessage(errorResponse);
  }
};

// 导出标记，表示这是一个模块
export { };