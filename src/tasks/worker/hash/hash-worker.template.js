// 这是一个模板文件，实际使用时会被动态填充

/**
 * 通用哈希Worker模板
 * 实际算法会在运行时注入
 */

// 算法函数占位符（会被替换）
// {{ALGORITHM_PLACEHOLDER}}

// Worker主逻辑
self.onmessage = async function(e) {
  const { type, taskId, data, options } = e.data;
  
  switch (type) {
    case 'PING':
      self.postMessage({ type: 'PONG', taskId });
      break;
      
    case 'COMPUTE_CHUNK':
      try {
        const startTime = performance.now();
        const result = await userAlgorithm(data, options);
        const timeCost = performance.now() - startTime;
        
        self.postMessage({ 
          type: 'CHUNK_RESULT', 
          taskId, 
          hash: result,
          timeCost: Math.round(timeCost)
        });
      } catch (error) {
        self.postMessage({ 
          type: 'ERROR', 
          taskId, 
          error: error.message,
          stack: error.stack
        });
      }
      break;
      
    case 'VALIDATE':
      // 验证算法是否正常工作
      try {
        const testData = new ArrayBuffer(16);
        const result = await userAlgorithm(testData, options);
        
        self.postMessage({
          type: 'VALIDATION_RESULT',
          taskId,
          isValid: typeof result === 'string' && result.length > 0,
          sampleHash: result.substring(0, 8)
        });
      } catch (error) {
        self.postMessage({
          type: 'ERROR',
          taskId,
          error: `Validation failed: ${error.message}`
        });
      }
      break;
      
    default:
      self.postMessage({
        type: 'ERROR',
        taskId,
        error: `Unknown message type: ${type}`
      });
  }
};

// 发送就绪信号
self.postMessage({ type: 'READY' });