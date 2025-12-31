// 示例：使用新的CustomHashWorkerManager实现
import { CustomHashWorkerManager } from './src/tasks/worker/hash';
// 示例：使用新的HashWorkerManager实现，通过构造函数传入算法函数
import { HashWorkerManager } from './src/tasks/worker/hash';
import md5 from './src/crypto/md5';  // 从项目内部导入md5算法

// 模拟一个自定义哈希算法函数
const customHashAlgorithm = async (data: any, options?: any): Promise<string> => {
  // 这里是一个简单的模拟实现
  // 在实际应用中，这里会是你的具体算法实现
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  let hash = 0;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // 转换为32位整数
  }
  
  return Math.abs(hash).toString(16);
};

// 示例：使用HashWorkerManager，通过构造函数传入算法函数
console.log('示例: 使用HashWorkerManager与构造函数传入的算法');

// 创建管理器实例，直接传入算法函数
const hashManager = new HashWorkerManager({
  algorithmFn: md5,
  workerUrl: './src/tasks/worker/hash/universal-hash-worker.js',
  format: 'hex'
});

// 计算数据哈希
hashManager.hashData('Hello, World!', (result) => {
  if (result.type === 'complete') {
    console.log('MD5计算结果:', (result.data as any).hash);
  } else if (result.type === 'error') {
    console.error('计算错误:', result.data);
  }
});

// 使用自定义算法
const customHashManager = new HashWorkerManager({
  algorithmFn: customHashAlgorithm,
  workerUrl: './src/tasks/worker/hash/universal-hash-worker.js',
  format: 'hex'
});

customHashManager.hashData('Hello, World!', (result) => {
  if (result.type === 'complete') {
    console.log('自定义算法计算结果:', (result.data as any).hash);
  } else if (result.type === 'error') {
    console.error('计算错误:', result.data);
  }
});

console.log('所有示例已准备就绪');

// 示例1：使用CustomHashWorkerManager
console.log('示例1: 使用CustomHashWorkerManager');
const customManager = new CustomHashWorkerManager('/path/to/custom-hash-worker.js');

// 首先初始化算法
customManager.initializeAlgorithm(customHashAlgorithm)
  .then(async () => {
    console.log('算法初始化成功');
    
    // 然后计算数据哈希
    await customManager.hashData('Hello, World!', (result) => {
      if (result.type === 'complete') {
        console.log('计算结果:', (result.data as any).hash);
      } else if (result.type === 'error') {
        console.error('计算错误:', result.data);
      }
    });
  })
  .catch(error => {
    console.error('初始化失败:', error);
  });

// 示例：使用DirectHashWorkerManager，从项目内部导入算法函数
import { DirectHashWorkerManager } from './src/tasks/worker/hash';
import md5 from './src/crypto/md5';  // 从项目内部导入md5算法

// 示例：使用DirectHashWorkerManager
console.log('示例: 使用DirectHashWorkerManager与项目内部算法');

// 创建管理器实例
const directManager = new DirectHashWorkerManager('/path/to/direct-hash-worker.js');

// 初始化算法
directManager.setAlgorithm(md5)
  .then(async () => {
    console.log('MD5算法初始化成功');
    
    // 然后计算数据哈希
    await directManager.hashData('Hello, World!', (result) => {
      if (result.type === 'complete') {
        console.log('MD5计算结果:', (result.data as any).hash);
      } else if (result.type === 'error') {
        console.error('计算错误:', result.data);
      }
    });
  })
  .catch(error => {
    console.error('初始化失败:', error);
  });

console.log('所有示例已准备就绪');