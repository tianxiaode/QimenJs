// hash-worker.js
let sparkMD5 = null;
let xxHash64 = null;

// 算法库配置
let algorithmLibraries = {};

// 加载所需库
async function loadLibraries(config) {
  algorithmLibraries = config || {};
  
  // 加载MD5库（如果配置了库路径）
  if (algorithmLibraries.MD5 && algorithmLibraries.MD5.libraryPath) {
    try {
      if (typeof importScripts === 'function') {
        importScripts(algorithmLibraries.MD5.libraryPath);
        sparkMD5 = self.SparkMD5;
      }
    } catch (e) {
      console.warn('Failed to load MD5 library:', e);
    }
  }
  
  // 加载XXHASH64库（如果配置了库路径）
  if (algorithmLibraries.XXHASH64 && algorithmLibraries.XXHASH64.libraryPath) {
    try {
      if (typeof importScripts === 'function') {
        importScripts(algorithmLibraries.XXHASH64.libraryPath);
        xxHash64 = self.XXHash64;
      }
    } catch (e) {
      console.warn('Failed to load XXHASH64 library:', e);
    }
  }

  // 检查Web Crypto支持
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    throw new Error('Web Crypto API not supported in this environment');
  }
}

// 初始化
self.addEventListener('message', function(event) {
  const message = event.data;
  
  if (message.type === 'INIT_CONFIG') {
    loadLibraries(message.config).then(() => {
      self.postMessage({ type: 'READY' });
    }).catch(error => {
      self.postMessage({
        type: 'ERROR',
        error: error.message
      });
    });
  } else {
    // 处理其他消息
    handleMessage(event);
  }
});

function handleMessage(event) {
  const message = event.data;
  
  try {
    switch (message.type) {
      case 'INIT':
        handleInit(message.config);
        break;
        
      case 'HASH_CHUNK':
        handleHashChunk(message.task);
        break;
        
      case 'HASH_FULL':
        handleHashFull(message.data, message.algorithm, message.options);
        break;
        
      case 'TERMINATE':
        self.close();
        break;
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: error.message,
      taskId: message.task?.id
    });
  }
}

function handleInit(config) {
  console.log('Worker initialized with config:', config);
}

function handleHashChunk(task) {
  const { id, chunk, index, algorithm, options } = task;
  
  // 异步处理
  blobToArrayBuffer(chunk).then(data => {
    return computeHash(data, algorithm, options);
  }).then(hash => {
    // 格式化输出
    const formattedHash = formatHash(hash, options?.format || 'hex');
    
    self.postMessage({
      type: 'CHUNK_RESULT',
      taskId: id,
      hash: formattedHash,
      index: index
    });
  }).catch(error => {
    self.postMessage({
      type: 'ERROR',
      error: error.message,
      taskId: id
    });
  });
}

function handleHashFull(data, algorithm, options = {}) {
  const processData = data instanceof ArrayBuffer ? data : blobToArrayBuffer(data);
  
  Promise.resolve(processData).then(resolvedData => {
    return computeHash(resolvedData, algorithm, options);
  }).then(hash => {
    // 格式化输出
    const formattedHash = formatHash(hash, options.format || 'hex');
    
    self.postMessage({
      type: 'FULL_RESULT',
      hash: formattedHash,
      algorithm: algorithm
    });
  }).catch(error => {
    self.postMessage({
      type: 'ERROR',
      error: error.message
    });
  });
}

// 计算哈希的通用函数
async function computeHash(data, algorithm, options = {}) {
  if (algorithm === 'XXHASH64') {
    if (!xxHash64) {
      throw new Error('XXHASH64 library not loaded');
    }
    // 使用XXHASH64
    return await hashXXHASH64(data, options?.seed || 0);
  } else if (algorithm === 'MD5') {
    if (!sparkMD5) {
      throw new Error('MD5 library not loaded');
    }
    // 使用SparkMD5
    return sparkMD5.ArrayBuffer.hash(data);
  } else {
    // 使用Web Crypto API
    const hashBuffer = await crypto.subtle.digest(algorithm, data);
    return arrayBufferToHex(hashBuffer);
  }
}

// 工具函数
function blobToArrayBuffer(blob) {
  if (blob.arrayBuffer) {
    return blob.arrayBuffer();
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
}

function arrayBufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function formatHash(hash, format) {
  if (format === 'hex') return hash;
  if (format === 'base64') return btoa(hash);
  if (format === 'base64url') {
    return btoa(hash).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  return hash;
}

// XXHASH64实现（需要外部库）
async function hashXXHASH64(data, seed) {
  if (typeof xxHash64 === 'function') {
    return xxHash64(data, seed);
  } else {
    throw new Error('XXHASH64 library not loaded or incompatible');
  }
}