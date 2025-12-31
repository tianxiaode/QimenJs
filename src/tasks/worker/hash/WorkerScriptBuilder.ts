// workers/WorkerScriptBuilder.ts

import { ILogger, Logger } from "@orbitjs/logger";
import { HashAlgorithm, AlgorithmOptions } from "./types1";
import { HashErrorFactory } from "./errors";

/**
 * 🎯 Worker脚本构建器
 * 负责动态创建包含用户算法的Web Worker脚本
 */
export class WorkerScriptBuilder {
  private logger: ILogger;
  private static workerTemplate = `
// ==================== 动态生成的哈希Worker脚本 ====================
// 生成时间: {{TIMESTAMP}}
// 算法名称: {{ALGORITHM_NAME}}

// 用户提供的哈希算法函数
const userAlgorithm = {{ALGORITHM_CODE}};

// Worker消息处理器
self.onmessage = async function(e) {
  const { type, taskId, data, options } = e.data;
  
  switch (type) {
    case 'PING':
      // 心跳检测
      self.postMessage({ type: 'PONG', taskId });
      break;
      
    case 'COMPUTE_CHUNK':
      try {
        const startTime = performance.now();
        
        // 执行用户算法
        const result = await userAlgorithm(data, options);
        
        const timeCost = performance.now() - startTime;
        
        self.postMessage({ 
          type: 'CHUNK_RESULT', 
          taskId, 
          hash: result,
          timeCost: Math.round(timeCost)
        });
        
      } catch (error) {
        console.error('[HashWorker] Algorithm error:', error);
        
        self.postMessage({ 
          type: 'ERROR', 
          taskId, 
          error: error.message || 'Unknown algorithm error',
          stack: error.stack
        });
      }
      break;
      
    case 'BENCHMARK':
      // 性能测试（可选）
      try {
        const testData = new ArrayBuffer(1024); // 1KB测试数据
        const startTime = performance.now();
        const iterations = 100;
        
        for (let i = 0; i < iterations; i++) {
          await userAlgorithm(testData, options);
        }
        
        const totalTime = performance.now() - startTime;
        const avgTime = totalTime / iterations;
        
        self.postMessage({
          type: 'BENCHMARK_RESULT',
          taskId,
          avgTime,
          iterations
        });
        
      } catch (error) {
        self.postMessage({
          type: 'ERROR',
          taskId,
          error: \`Benchmark failed: \${error.message}\`
        });
      }
      break;
      
    default:
      console.warn('[HashWorker] Unknown message type:', type);
      self.postMessage({
        type: 'ERROR',
        taskId,
        error: \`Unknown message type: \${type}\`
      });
  }
};

// Worker初始化完成
console.log('[HashWorker] Worker initialized with algorithm:', 
  userAlgorithm.name || 'anonymous');
self.postMessage({ type: 'READY' });

// ==================== 脚本结束 ====================
`;

  constructor() {
    this.logger = Logger.for(this.constructor.name);
  }

  /**
   * 🎯 构建包含算法的Worker脚本
   */
  public buildWorkerScript(algorithm: HashAlgorithm): string {
    this.logger.debug('Building worker script', {
      algorithmName: algorithm.name || 'anonymous'
    });

    try {
      // 获取算法代码
      const algorithmCode = this.serializeAlgorithm(algorithm);
      
      // 替换模板变量
      const script = WorkerScriptBuilder.workerTemplate
        .replace('{{TIMESTAMP}}', new Date().toISOString())
        .replace('{{ALGORITHM_NAME}}', algorithm.name || 'CUSTOM')
        .replace('{{ALGORITHM_CODE}}', algorithmCode);
      
      // 验证生成的脚本
      this.validateWorkerScript(script);
      
      this.logger.debug('Worker script built successfully', {
        scriptLength: script.length,
        algorithmCodeLength: algorithmCode.length
      });
      
      return script;
      
    } catch (error) {
      this.logger.error('Failed to build worker script', { error });
      throw HashErrorFactory.algorithmError(
        0,
        algorithm.name || 'anonymous',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * 🎯 序列化算法函数
   */
  private serializeAlgorithm(algorithm: HashAlgorithm): string {
    if (typeof algorithm !== 'function') {
      throw new Error('Algorithm must be a function');
    }
    
    // 获取函数字符串表示
    let algorithmString = algorithm.toString();
    
    // 验证函数内容
    if (!algorithmString.includes('=>') && !algorithmString.includes('function')) {
      throw new Error('Invalid algorithm function format');
    }
    
    // 检查是否包含潜在的危险代码（基本安全检测）
    const dangerousPatterns = [
      'eval(',
      'Function(',
      'setTimeout(',
      'setInterval(',
      'fetch(',
      'XMLHttpRequest',
      'document.',
      'window.',
      'localStorage',
      'sessionStorage',
      'indexedDB'
    ];
    
    for (const pattern of dangerousPatterns) {
      if (algorithmString.includes(pattern)) {
        this.logger.warn('Potentially dangerous pattern found in algorithm', {
          pattern
        });
        // 注意：这里只是警告，不阻止执行
        // 因为用户算法可能需要这些功能（如网络请求）
      }
    }
    
    return algorithmString;
  }

  /**
   * 🎯 验证Worker脚本
   */
  private validateWorkerScript(script: string): void {
    // 基本语法检查
    if (!script.trim()) {
      throw new Error('Empty worker script');
    }
    
    if (!script.includes('self.onmessage')) {
      throw new Error('Worker script missing message handler');
    }
    
    if (!script.includes('userAlgorithm')) {
      throw new Error('Worker script missing algorithm reference');
    }
    
    // 尝试解析为函数（轻量级检查）
    try {
      // 只检查语法，不执行
      new Function(script);
    } catch (error: any) {
      throw new Error(`Invalid JavaScript in worker script: ${error.message}`);
    }
    
    this.logger.debug('Worker script validation passed');
  }

  /**
   * 🎯 创建Worker Blob URL
   */
  public createWorkerBlobUrl(algorithm: HashAlgorithm): string {
    this.logger.debug('Creating worker blob URL');
    
    const script = this.buildWorkerScript(algorithm);
    
    // 创建Blob
    const blob = new Blob([script], { 
      type: 'application/javascript' 
    });
    
    // 创建URL
    const blobUrl = URL.createObjectURL(blob);
    
    this.logger.debug('Worker blob URL created', {
      blobSize: blob.size,
      scriptLength: script.length
    });
    
    return blobUrl;
  }

  /**
   * 🎯 直接创建Worker实例
   */
  public createWorker(algorithm: HashAlgorithm): Worker {
    this.logger.debug('Creating worker instance');
    
    const blobUrl = this.createWorkerBlobUrl(algorithm);
    
    try {
      const worker = new Worker(blobUrl);
      
      // 保存URL用于后续清理
      (worker as any)._blobUrl = blobUrl;
      
      // 添加清理方法
      (worker as any).cleanup = () => {
        URL.revokeObjectURL(blobUrl);
        delete (worker as any)._blobUrl;
      };
      
      this.logger.debug('Worker instance created');
      return worker;
      
    } catch (error) {
      // 创建失败时清理URL
      URL.revokeObjectURL(blobUrl);
      throw error;
    }
  }

  /**
   * 🎯 创建Worker并等待初始化
   */
  public async createAndInitializeWorker(
    algorithm: HashAlgorithm
  ): Promise<Worker> {
    const worker = this.createWorker(algorithm);
    
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        worker.terminate();
        (worker as any).cleanup?.();
        reject(new Error('Worker initialization timeout'));
      }, 5000);
      
      const messageHandler = (event: MessageEvent) => {
        if (event.data.type === 'READY') {
          clearTimeout(timeoutId);
          worker.removeEventListener('message', messageHandler);
          resolve(worker);
        }
      };
      
      worker.addEventListener('message', messageHandler);
      
      worker.addEventListener('error', (error) => {
        clearTimeout(timeoutId);
        worker.removeEventListener('message', messageHandler);
        (worker as any).cleanup?.();
        reject(new Error(`Worker error: ${error.message}`));
      });
    });
  }

  /**
   * 🎯 清理Worker资源
   */
  public static cleanupWorker(worker: Worker): void {
    if ((worker as any)._blobUrl) {
      URL.revokeObjectURL((worker as any)._blobUrl);
      delete (worker as any)._blobUrl;
    }
    
    if (typeof (worker as any).cleanup === 'function') {
      (worker as any).cleanup();
    }
  }
}