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
    // Web Crypto API 支持的算法
    const webCryptoAlgorithms: HashAlgorithm[] = ['SHA-1', 'SHA-256', 'SHA-512'];
    webCryptoAlgorithms.forEach(algo => {
      this.algorithms.set(algo, {
        name: algo,
        supported: this.isWebCryptoSupported(),
        validationFunction: () => this.isWebCryptoSupported(),
      });
    });

    // MD5 需要第三方库支持
    this.algorithms.set('MD5', {
      name: 'MD5',
      supported: false, // 默认为false，需要手动注册
      libraryPath: 'https://cdn.jsdelivr.net/npm/spark-md5@3.0.2/spark-md5.min.js', // 默认CDN路径，用户可以覆盖
      validationFunction: () => typeof (self as any).SparkMD5 !== 'undefined',
    });

    // XXHASH64 需要第三方库支持
    this.algorithms.set('XXHASH64', {
      name: 'XXHASH64',
      supported: false, // 默认为false，需要手动注册
      libraryPath: 'https://cdn.jsdelivr.net/npm/xxhash-wasm@1.0.1/dist/xxhash-wasm.js', // 默认CDN路径，用户可以覆盖
      validationFunction: () => typeof (self as any).XXHashWasm !== 'undefined',
    });
  }

  private isWebCryptoSupported(): boolean {
    return typeof crypto !== 'undefined' && !!(crypto.subtle);
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
          supported: false, // 默认为不支持，需要验证
          validationFunction: () => {
            // 默认验证函数，检查库是否已加载
            if (algorithm === 'MD5') {
              return typeof (self as any).SparkMD5 !== 'undefined';
            } else if (algorithm === 'XXHASH64') {
              return typeof (self as any).XXHashWasm !== 'undefined' || typeof (self as any).XXHash64 !== 'undefined';
            }
            // Web Crypto API 算法默认支持
            return this.isWebCryptoSupported();
          }
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
      dynamicLoading: true,
    };
  }
}