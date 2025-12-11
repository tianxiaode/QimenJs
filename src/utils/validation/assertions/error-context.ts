import { InvalidInputError } from '../../error';
import { ValidationErrorCode, ValidationErrorParams } from './error-codes';

export interface AssertErrorContextOptions {
  paramName?: string;
  functionName?: string;
  // 不再提供 message 参数，完全由用户自己处理
}

/**
 * 创建断言错误上下文（仅提供 key 和 params）
 * 重命名为 createAssetErrorContext 以避免命名冲突
 */
export function createAssetErrorContext(options?: AssertErrorContextOptions) {
  const opts = options || {};
  
  return {
    /**
     * 抛出验证错误
     */
    throwError: (
      code: ValidationErrorCode, 
      params: ValidationErrorParams = {}
    ): never => {
      const errorParams: ValidationErrorParams = {
        paramName: opts.paramName,
        functionName: opts.functionName,
        ...params
      };
      
      // 生成调试消息（仅用于开发和调试）
      const debugMessage = generateDebugMessage(code, errorParams);
      
      // 只传递错误代码和参数，消息由调用者自己根据 key 生成
      throw new InvalidInputError(
        code, // 错误代码作为消息（可被覆盖）
        { 
          code,
          params: errorParams,
          // 为了调试方便，可以包含一个简单消息，但不是给用户看的
          _debugMessage: debugMessage
        } as any
      );
    },
    
    /**
     * 创建错误参数（不抛出）
     */
    createErrorParams: (params: ValidationErrorParams = {}): ValidationErrorParams => {
      return {
        paramName: opts.paramName,
        functionName: opts.functionName,
        ...params
      };
    }
  };
}

/**
 * 生成调试消息（仅用于开发环境）
 */
function generateDebugMessage(code: ValidationErrorCode, params: ValidationErrorParams): string {
  const paramName = params.paramName ? `Parameter '${params.paramName}'` : 'Value';
  const functionText = params.functionName ? ` in ${params.functionName}` : '';
  
  // 简化的英文消息，仅用于开发和调试
  switch (code) {
    // 类型错误
    case ValidationErrorCode.TYPE_NOT_STRING:
      return `${paramName} must be a string${functionText}`;
    case ValidationErrorCode.TYPE_NOT_NUMBER:
      return `${paramName} must be a number${functionText}`;
    case ValidationErrorCode.TYPE_NOT_BOOLEAN:
      return `${paramName} must be a boolean${functionText}`;
    case ValidationErrorCode.TYPE_NOT_ARRAY:
      return `${paramName} must be an array${functionText}`;
    case ValidationErrorCode.TYPE_NOT_OBJECT:
      return `${paramName} must be an object${functionText}`;
    
    // 约束错误
    case ValidationErrorCode.MIN_LENGTH:
      return `${paramName} must have at least ${params.min} items${functionText}`;
    case ValidationErrorCode.MAX_LENGTH:
      return `${paramName} must have at most ${params.max} items${functionText}`;
    case ValidationErrorCode.MIN_VALUE:
      return `${paramName} must be at least ${params.min}${functionText}`;
    case ValidationErrorCode.MAX_VALUE:
      return `${paramName} must be at most ${params.max}${functionText}`;
    case ValidationErrorCode.NOT_IN_COLLECTION:
      return `${paramName} must be one of: ${params.collectionText}${functionText}`;
    
    // 模式错误
    case ValidationErrorCode.EMAIL_INVALID:
      return `${paramName} must be a valid email address${functionText}`;
    case ValidationErrorCode.URL_INVALID:
      return `${paramName} must be a valid URL${functionText}`;
    case ValidationErrorCode.PHONE_INVALID:
      return `${paramName} must be a valid phone number${functionText}`;
    case ValidationErrorCode.PATTERN_MISMATCH:
      return `${paramName} must match pattern ${params.pattern}${functionText}`;
    
    // 空值错误
    case ValidationErrorCode.EMPTY:
      return `${paramName} must be empty${functionText}`;
    case ValidationErrorCode.NOT_EMPTY:
      return `${paramName} must not be empty${functionText}`;
    
    // 默认
    default:
      return `${paramName} failed validation (${code})${functionText}`;
  }
}

/**
 * 工具函数：获取值的长度
 */
export function getLength(value: any): number | undefined {
  if (typeof value === 'string') {
    return value.length;
  } else if (Array.isArray(value)) {
    return value.length;
  } else if (typeof value === 'object' && value !== null) {
    if (value instanceof Map || value instanceof Set) {
      return value.size;
    } else {
      return Object.keys(value).length;
    }
  }
  return undefined;
}

/**
 * 工具函数：判断是否是有效的集合
 */
export function isValidCollection(collection: any): boolean {
  return Array.isArray(collection) || 
         collection instanceof Set || 
         (typeof collection === 'object' && collection !== null);
}

/**
 * 工具函数：获取集合的文本表示
 */
export function getCollectionText(collection: any[] | Set<any> | Record<string, any>): string {
  if (Array.isArray(collection)) {
    return `[${collection.join(', ')}]`;
  } else if (collection instanceof Set) {
    return `Set(${[...collection].join(', ')})`;
  } else if (typeof collection === 'object' && collection !== null) {
    return `{${Object.values(collection).join(', ')}}`;
  }
  return String(collection);
}