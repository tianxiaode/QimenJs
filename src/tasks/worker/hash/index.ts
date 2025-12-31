import { AlgorithmRegistry, AlgorithmImplementation } from './AlgorithmRegistry';
import md5 from '@/crypto/md5';
import sha1 from '@/crypto/sha1';
import sha256 from '@/crypto/sha256';
import sha512 from '@/crypto/sha512';
import xxhash64 from '@/crypto/xxhash64';

// 初始化算法实现
export function initializeAlgorithmRegistry() {
  const registry = AlgorithmRegistry.getInstance();
  
  // 设置算法实现
  registry.setAlgorithmImplementations({
    'MD5': (data: string) => md5(data),
    'SHA-1': (data: string) => sha1(data),
    'SHA-256': (data: string) => sha256(data),
    'SHA-512': (data: string) => sha512(data),
    'XXHASH64': (data: string, seed: number = 0) => xxhash64(data, seed)
  });
  
  return registry;
}

// 也可以直接传入实现，更灵活
export function initializeWithImplementations(implementations: { [key: string]: AlgorithmImplementation }) {
  const registry = AlgorithmRegistry.getInstance();
  
  // 设置算法实现
  registry.setAlgorithmImplementations({
    'MD5': implementations.md5 || ((data: string) => md5(data)),
    'SHA-1': implementations.sha1 || ((data: string) => sha1(data)),
    'SHA-256': implementations.sha256 || ((data: string) => sha256(data)),
    'SHA-512': implementations.sha512 || ((data: string) => sha512(data)),
    'XXHASH64': implementations.xxhash64 || ((data: string, seed: number = 0) => xxhash64(data, seed))
  });
  
  return registry;
}

// 提供一个便捷方法，直接使用算法实现计算哈希
export function computeHashWithImplementation(
  data: string,
  algorithm: 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-512' | 'XXHASH64',
  implementation: (data: string, seed?: number) => string
): string {
  return AlgorithmRegistry.computeHashWithImplementation(data, algorithm, implementation);
}

export { HashWorkerManager, HashWorkerOptions, CustomHashFunction } from './HashWorkerManager';
export { SimpleHashWorkerManager } from './SimpleHashWorkerManager';
export { CustomHashWorkerManager } from './CustomHashWorkerManager';
export { SimpleCustomHashWorkerManager } from './SimpleCustomHashWorkerManager';
export { DirectHashWorkerManager } from './DirectHashWorkerManager';
export { WorkerHashExecutor } from './WorkerHashExecutor';
export { AlgorithmRegistry } from './AlgorithmRegistry';
export { FileHashProcessor } from './FileHashProcessor';
export { DataHashProcessor } from './DataHashProcessor';
export { MessageHandler } from './MessageHandler';
export { TaskManager } from './TaskManager';

export type { 
  AlgorithmLibraryConfig, 
  AlgorithmImplementation, 
  AlgorithmImplementations 
} from './AlgorithmRegistry';
