import { HashAlgorithm, AlgorithmConfig, HashWorkerConfig } from '../types';

export interface AlgorithmLibraryConfig {
  [key: string]: {
    libraryPath?: string;
    importFunction?: () => Promise<any>;
  };
}

export class AlgorithmRegistry {
  private static instance: AlgorithmRegistry;
  private algorithms: Map<HashAlgorithm, AlgorithmConfig> = new Map();
  private fallbackAlgorithm: HashAlgorithm = 'SHA-256';

  private constructor() {
    // 初始化默认支持的算法
    this.initializeDefaultAlgorithms();
  }

  public static getInstance(): AlgorithmRegistry {
    if (!AlgorithmRegistry.instance) {
      AlgorithmRegistry.instance = new AlgorithmRegistry();
    }
    return AlgorithmRegistry.instance;
  }

  private initializeDefaultAlgorithms(): void {
    // 本地实现的算法
    const localAlgorithms: HashAlgorithm[] = ['MD5', 'SHA-1', 'SHA-256', 'SHA-512', 'XXHASH64'];
    
    localAlgorithms.forEach(algo => {
      this.algorithms.set(algo, {
        name: algo,
        supported: true, // 本地实现始终可用
        validationFunction: () => true,
      });
    });
  }

  /**
   * 注册算法配置
   */
  public registerAlgorithm(config: AlgorithmConfig): void {
    // 验证算法是否支持
    if (config.validationFunction) {
      config.supported = config.validationFunction();
    }
    this.algorithms.set(config.name, config);
  }

  /**
   * 批量注册算法配置
   */
  public registerAlgorithms(configs: AlgorithmConfig[]): void {
    configs.forEach(config => this.registerAlgorithm(config));
  }

  /**
   * 配置算法库地址
   */
  public configureAlgorithmLibraries(config: AlgorithmLibraryConfig): void {
    Object.keys(config).forEach(algorithm => {
      const existingConfig = this.algorithms.get(algorithm as HashAlgorithm);
      if (existingConfig) {
        // 更新库路径和导入函数
        existingConfig.libraryPath = config[algorithm].libraryPath || existingConfig.libraryPath;
        existingConfig.importFunction = config[algorithm].importFunction || existingConfig.importFunction;
        
        // 重新检查支持状态
        if (existingConfig.validationFunction) {
          existingConfig.supported = existingConfig.validationFunction();
        }
      } else {
        // 如果算法不存在，创建新的配置
        this.algorithms.set(algorithm as HashAlgorithm, {
          name: algorithm as HashAlgorithm,
          libraryPath: config[algorithm].libraryPath,
          importFunction: config[algorithm].importFunction,
          supported: true, // 本地实现始终可用
          validationFunction: () => true,
        });
      }
    });
  }

  /**
   * 获取算法配置
   */
  public getAlgorithm(algorithm: HashAlgorithm): AlgorithmConfig | undefined {
    return this.algorithms.get(algorithm);
  }

  /**
   * 检查算法是否支持
   */
  public isAlgorithmSupported(algorithm: HashAlgorithm): boolean {
    const config = this.algorithms.get(algorithm);
    if (!config) return false;
    
    // 如果有验证函数，则执行验证
    if (config.validationFunction) {
      return config.validationFunction();
    }
    
    return !!config.supported;
  }

  /**
   * 获取所有支持的算法
   */
  public getSupportedAlgorithms(): HashAlgorithm[] {
    const supported: HashAlgorithm[] = [];
    
    this.algorithms.forEach((config, algo) => {
      if (this.isAlgorithmSupported(algo)) {
        supported.push(algo);
      }
    });
    
    return supported;
  }

  /**
   * 设置回退算法
   */
  public setFallbackAlgorithm(algorithm: HashAlgorithm): void {
    this.fallbackAlgorithm = algorithm;
  }

  /**
   * 获取回退算法
   */
  public getFallbackAlgorithm(): HashAlgorithm {
    return this.fallbackAlgorithm;
  }

  /**
   * 推荐算法
   */
  public recommendAlgorithm(params: {
    needSecurity: boolean;
    fileSize: number;
    performancePriority: boolean;
  }): HashAlgorithm {
    const { needSecurity, fileSize, performancePriority } = params;

    if (needSecurity) {
      return fileSize > 1024 * 1024 * 1024 ? 'SHA-256' : 'SHA-512';
    }

    if (performancePriority) {
      if (fileSize > 1024 * 1024 * 1024) {
        // >1GB，如果支持XXHASH64则使用，否则使用MD5
        if (this.isAlgorithmSupported('XXHASH64')) {
          return 'XXHASH64';
        }
        if (this.isAlgorithmSupported('MD5')) {
          return 'MD5';
        }
      }
      if (this.isAlgorithmSupported('MD5')) {
        return 'MD5';
      }
    }

    // 尝试返回一个支持的算法，如果都不支持则返回回退算法
    const supported = this.getSupportedAlgorithms();
    if (supported.length > 0) {
      return supported.includes('SHA-256') ? 'SHA-256' : supported[0];
    }
    
    return this.fallbackAlgorithm;
  }

  /**
   * 获取Worker配置
   */
  public getWorkerConfig(): HashWorkerConfig {
    // 提取所有算法的配置，只包含库路径等必要信息
    const supportedAlgorithms: AlgorithmConfig[] = [];
    
    this.algorithms.forEach(config => {
      if (config.libraryPath || config.importFunction) {
        // 只包含有库路径或导入函数的算法
        supportedAlgorithms.push({
          name: config.name,
          libraryPath: config.libraryPath,
          importFunction: config.importFunction,
        });
      }
    });
    
    return {
      supportedAlgorithms,
      fallbackAlgorithm: this.fallbackAlgorithm,
      dynamicLoading: false, // 不再需要动态加载外部库
    };
  }
  
  /**
   * 计算哈希值
   */
  public computeHash(data: string, algorithm: HashAlgorithm): string {
    // 动态导入相应的算法实现
    switch (algorithm) {
      case 'MD5':
        return this.getAlgorithmImplementation('MD5')(data);
      case 'SHA-1':
        return this.getAlgorithmImplementation('SHA-1')(data);
      case 'SHA-256':
        return this.getAlgorithmImplementation('SHA-256')(data);
      case 'SHA-512':
        return this.getAlgorithmImplementation('SHA-512')(data);
      case 'XXHASH64':
        return this.getAlgorithmImplementation('XXHASH64')(data, 0); // 默认seed为0
      default:
        throw new Error(`Unsupported algorithm: ${algorithm}`);
    }
  }

  /**
   * 获取算法实现函数
   */
  private getAlgorithmImplementation(algorithm: HashAlgorithm): (data: string, seed?: number) => string {
    switch (algorithm) {
      case 'MD5':
        return (data: string): string => {
          const { md5 } = require('@orbitjs/crypto');
          return md5(data);
        };
      case 'SHA-1':
        return (data: string): string => {
          const { sha1 } = require('@orbitjs/crypto');
          return sha1(data);
        };
      case 'SHA-256':
        return (data: string): string => {
          const { sha256 } = require('@orbitjs/crypto');
          return sha256(data);
        };
      case 'SHA-512':
        return (data: string): string => {
          const { sha512 } = require('@orbitjs/crypto');
          return sha512(data);
        };
      case 'XXHASH64':
        return (data: string, seed: number = 0): string => {
          const { xxhash64 } = require('@orbitjs/crypto');
          return xxhash64(data, seed);
        };
      default:
        throw new Error(`Unsupported algorithm: ${algorithm}`);
    }
  }
}