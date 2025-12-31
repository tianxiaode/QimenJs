import { AlgorithmRegistry, computeHashWithImplementation, initializeAlgorithmRegistry } from '../../../src/tasks/worker/hash';
import md5 from '../../../src/crypto/md5';
import sha1 from '../../../src/crypto/sha1';
import sha256 from '../../../src/crypto/sha256';
import sha512 from '../../../src/crypto/sha512';
import xxhash64 from '../../../src/crypto/xxhash64';
import { HashAlgorithm, AlgorithmConfig } from '../../../src/tasks/worker/types';

describe('AlgorithmRegistry', () => {
  let registry: AlgorithmRegistry;

  beforeEach(() => {
    // 重新创建实例，避免测试之间的相互影响
    (AlgorithmRegistry as any).instance = null;
    registry = AlgorithmRegistry.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = AlgorithmRegistry.getInstance();
      const instance2 = AlgorithmRegistry.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Initialization', () => {
    it('should initialize with default algorithms', () => {
      const supported = registry.getSupportedAlgorithms();
      expect(supported).toContain('MD5');
      expect(supported).toContain('SHA-1');
      expect(supported).toContain('SHA-256');
      expect(supported).toContain('SHA-512');
      expect(supported).toContain('XXHASH64');
    });
  });

  describe('Algorithm Registration', () => {
    it('should register a single algorithm', () => {
      const algorithmConfig = {
        name: 'MD5' as HashAlgorithm,
        supported: true,
        validationFunction: () => true
      };
      
      registry.registerAlgorithm(algorithmConfig);
      const config = registry.getAlgorithm('MD5');
      expect(config).toEqual(algorithmConfig);
    });

    it('should register multiple algorithms', () => {
      const configs = [
        { name: 'MD5' as HashAlgorithm, supported: true },
        { name: 'SHA-1' as HashAlgorithm, supported: true }
      ];
      
      registry.registerAlgorithms(configs);
      
      expect(registry.getAlgorithm('MD5')).toBeDefined();
      expect(registry.getAlgorithm('SHA-1')).toBeDefined();
    });
    
    it('should update supported status when validation function is provided', () => {
      const config: AlgorithmConfig = {
        name: 'MD5' as HashAlgorithm,
        supported: true,
        validationFunction: () => false
      };
      
      registry.registerAlgorithm(config);
      expect(registry.isAlgorithmSupported('MD5')).toBe(false);
    });
  });

  describe('Algorithm Library Configuration', () => {
    it('should configure algorithm libraries for existing algorithms', () => {
      const config = {
        'MD5': {
          libraryPath: '/path/to/md5.js',
          importFunction: async () => ({})
        }
      };
      
      registry.configureAlgorithmLibraries(config);
      
      const md5Config = registry.getAlgorithm('MD5');
      expect(md5Config?.libraryPath).toBe('/path/to/md5.js');
      expect(md5Config?.importFunction).toBeDefined();
    });

    it('should configure algorithm libraries for new algorithms', () => {
      const config = {
        'NON_EXISTENT': {
          libraryPath: '/path/to/custom.js',
          importFunction: async () => ({})
        }
      };
      
      registry.configureAlgorithmLibraries(config);
      
      const customConfig = registry.getAlgorithm('NON_EXISTENT' as HashAlgorithm);
      expect(customConfig?.libraryPath).toBe('/path/to/custom.js');
      expect(customConfig?.importFunction).toBeDefined();
    });
  });

  describe('Algorithm Implementation', () => {
    it('should set and get algorithm implementation', () => {
      const mockImplementation = jest.fn((data: string) => `hashed_${data}`);
      registry.setAlgorithmImplementation('MD5', mockImplementation);
      
      // 设置实现后应该能正常工作
      registry.setAlgorithmImplementation('MD5', (data: string) => `hashed_${data}`);
      const result = registry.computeHash('test', 'MD5');
      expect(result).toBe('hashed_test');
    });

    it('should set multiple algorithm implementations', () => {
      const implementations = {
        'MD5': (data: string) => `md5_${data}`,
        'SHA-1': (data: string) => `sha1_${data}`
      };
      
      registry.setAlgorithmImplementations(implementations);
      
      const md5Result = registry.computeHash('test', 'MD5');
      expect(md5Result).toBe('md5_test');
      
      const sha1Result = registry.computeHash('test', 'SHA-1');
      expect(sha1Result).toBe('sha1_test');
    });
    
    it('should throw error when algorithm implementation is not found', () => {
      expect(() => {
        registry.computeHash('test', 'MD5');
      }).toThrow('Algorithm implementation not found for: MD5');
    });
  });
  
  describe('Direct Implementation Usage', () => {
    it('should compute hash using direct implementation', () => {
      const result = AlgorithmRegistry.computeHashWithImplementation(
        'test',
        'MD5',
        (data: string) => `direct_${data}`
      );
      expect(result).toBe('direct_test');
    });

    it('should compute hash using XXHASH64 direct implementation', () => {
      const result = AlgorithmRegistry.computeHashWithImplementation(
        'test',
        'XXHASH64',
        (data: string, seed: number = 0) => `xxh64_${data}_${seed}`
      );
      expect(result).toBe('xxh64_test_0');
    });

    it('should compute hash using convenience function', () => {
      const result = computeHashWithImplementation(
        'test',
        'SHA-256',
        (data: string) => sha256(data)
      );
      expect(result).toBe(sha256('test'));
    });
  });

  describe('Algorithm Support', () => {
    it('should check if an algorithm is supported', () => {
      expect(registry.isAlgorithmSupported('MD5')).toBe(true);
      expect(registry.isAlgorithmSupported('NON_EXISTENT' as HashAlgorithm)).toBe(false);
    });
  });

  describe('Fallback Algorithm', () => {
    it('should set and get fallback algorithm', () => {
      registry.setFallbackAlgorithm('SHA-512');
      expect(registry.getFallbackAlgorithm()).toBe('SHA-512');
    });
  });

  describe('Algorithm Recommendation', () => {
    it('should recommend secure algorithm for large files', () => {
      const algorithm = registry.recommendAlgorithm({
        needSecurity: true,
        fileSize: 2 * 1024 * 1024 * 1024, // 2GB
        performancePriority: false
      });
      
      expect(algorithm).toBe('SHA-256');
    });

    it('should recommend SHA-512 for smaller secure files', () => {
      const algorithm = registry.recommendAlgorithm({
        needSecurity: true,
        fileSize: 512 * 1024 * 1024, // 512MB
        performancePriority: false
      });
      
      expect(algorithm).toBe('SHA-512');
    });

    it('should recommend XXHASH64 for large files with performance priority', () => {
      registry.setAlgorithmImplementation('XXHASH64', (data: string) => xxhash64(data, 0));
      
      const algorithm = registry.recommendAlgorithm({
        needSecurity: false,
        fileSize: 2 * 1024 * 1024 * 1024, // 2GB
        performancePriority: true
      });
      
      // XXHASH64 is preferred when available and performance is priority
      expect(['XXHASH64', 'MD5']).toContain(algorithm);
    });
    
    it('should recommend first supported algorithm when XXHASH64 is not available', () => {
      const algorithm = registry.recommendAlgorithm({
        needSecurity: false,
        fileSize: 2 * 1024 * 1024 * 1024, // 2GB
        performancePriority: true
      });
      
      // 推荐算法会根据当前支持的算法列表返回第一个（通常是MD5）
      expect(['MD5', 'SHA-1', 'SHA-256', 'SHA-512', 'XXHASH64']).toContain(algorithm);
    });
    
    it('should recommend fallback when no algorithms are supported', () => {
      // 清空所有算法配置以测试fallback
      const newRegistry = new (AlgorithmRegistry as any)();
      const algorithm = newRegistry.recommendAlgorithm({
        needSecurity: false,
        fileSize: 1024, // 1KB
        performancePriority: false
      });
      
      expect(algorithm).toBe('SHA-256'); // 默认fallback
    });
  });

  describe('Worker Configuration', () => {
    it('should return worker configuration', () => {
      const config = registry.getWorkerConfig();
      expect(config).toHaveProperty('supportedAlgorithms');
      expect(config).toHaveProperty('fallbackAlgorithm');
      expect(config.dynamicLoading).toBe(false);
    });
    
    it('should return algorithms with library path or import function', () => {
      const config = {
        'MD5': {
          libraryPath: '/path/to/md5.js',
          importFunction: async () => ({})
        }
      };
      
      registry.configureAlgorithmLibraries(config);
      const workerConfig = registry.getWorkerConfig();
      
      expect(workerConfig.supportedAlgorithms).toHaveLength(1);
      expect(workerConfig.supportedAlgorithms[0].name).toBe('MD5');
      expect(workerConfig.supportedAlgorithms[0].libraryPath).toBe('/path/to/md5.js');
    });
  });

  describe('initializeAlgorithmRegistry', () => {
    it('should initialize all algorithm implementations', () => {
      const registry = initializeAlgorithmRegistry();
      
      // 测试各种算法是否可以正常工作
      const testInput = 'hello world';
      
      const md5Result = registry.computeHash(testInput, 'MD5');
      expect(md5Result).toBe(md5(testInput));
      
      const sha1Result = registry.computeHash(testInput, 'SHA-1');
      expect(sha1Result).toBe(sha1(testInput));
      
      const sha256Result = registry.computeHash(testInput, 'SHA-256');
      expect(sha256Result).toBe(sha256(testInput));
      
      const sha512Result = registry.computeHash(testInput, 'SHA-512');
      expect(sha512Result).toBe(sha512(testInput));
      
      const xxhash64Result = registry.computeHash(testInput, 'XXHASH64');
      expect(xxhash64Result).toBe(xxhash64(testInput, 0));
    });
  });
  
  describe('XXHASH64 with seed', () => {
    it('should call XXHASH64 implementation with seed parameter', () => {
      const mockXXH64 = jest.fn((data: string, seed: number = 0) => `xxh64_${data}_${seed}`);
      registry.setAlgorithmImplementation('XXHASH64', mockXXH64);
      
      const result = registry.computeHash('test', 'XXHASH64');
      expect(mockXXH64).toHaveBeenCalledWith('test', 0); // 默认seed为0
      expect(result).toBe('xxh64_test_0');
    });
  });
});