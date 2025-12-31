// universal-hash-worker.js
// 通用哈希计算worker，接收并执行传入的自定义哈希算法函数

let currentAlgorithm = null;

// 处理消息
self.addEventListener('message', function(event) {
  const message = event.data;
  
  if (message.type === 'SET_ALGORITHM') {
    // 设置算法函数
    try {
      // 将字符串转换为函数
      currentAlgorithm = new Function('return ' + message.algorithmCode)();
      
      self.postMessage({
        type: 'ALGORITHM_SET'
      });
    } catch (error) {
      self.postMessage({
        type: 'ERROR',
        error: 'Failed to set algorithm: ' + error.message
      });
    }
  } 
  else if (message.type === 'EXECUTE_HASH') {
    // 执行哈希计算
    handleExecuteHash(message);
  }
  else {
    self.postMessage({
      type: 'ERROR',
      error: 'Unknown message type: ' + message.type
    });
  }
});

// 处理哈希执行请求
async function handleExecuteHash(message) {
  if (!currentAlgorithm) {
    self.postMessage({
      type: 'ERROR',
      error: 'No algorithm set in worker',
      taskId: message.taskId
    });
    return;
  }

  try {
    // 执行当前算法
    let result = currentAlgorithm(message.data, message.options);
    
    // 如果结果是Promise，则等待其完成
    if (result instanceof Promise) {
      result = await result;
    }
    
    // 发送结果
    self.postMessage({
      type: 'EXECUTE_RESULT',
      taskId: message.taskId,
      hash: result
    });
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: error.message,
      taskId: message.taskId
    });
  }
}