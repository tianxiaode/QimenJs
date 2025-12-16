import { ValidationRuleError } from "./types";
import { globalConfig } from '../../config'

/**
 * 默认错误消息处理器实现
 * - 如果错误消息存在，则直接返回
 * - 否则，使用全局配置的错误消息处理器处理
 * @param error 错误对象
 * @param customMessage 自定义消息
 * @returns 错误消息
 */ 
export function getValidationMessage(error: ValidationRuleError, customMessage?: string): string {
    // 如果已经有自定义错误消息，直接返回
    if (error.errorMessage) {
      return error.errorMessage;
    }
    
    // 返回错误代码作为默认消息
    const messageHandler = globalConfig.getErrorHandling();
    return messageHandler?.getValidationMessage(error, customMessage) ||  error.errorCode || 'VALIDATION_FAILED';
  }

  /**
   * 默认格式化错误消息处理器实现
   * - 如果有自定义格式化消息处理器，则使用
   * - 否则，使用全局配置的格式化消息处理器处理
   * @param errors 错误列表
   * @param customMessage 自定义消息
   * @returns 格式化后的错误消息
   */
  export function getValidationFormattedMessage(errors: ValidationRuleError[], customMessage?: string): string {
    // 如果有自定义消息，优先使用
    if (customMessage) {
      return customMessage;
    }
    
    // 获取所有错误消息
    const errorMessages = errors
      .map(error => getValidationMessage(error))
      .filter(Boolean);
    
      const messageHandler = globalConfig.getErrorHandling();
      if(messageHandler?.getValidationFormattedMessage) {
        return messageHandler.getValidationFormattedMessage(errors, customMessage);
      }
    // 组合错误消息
    return errorMessages.length > 0 
      ? errorMessages.join('; ') 
      : '验证失败';
    
  }


