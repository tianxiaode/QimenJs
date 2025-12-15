// src/utils/validation/errors/message-handler.ts
import { ErrorMessageHandler, ValidationError } from "../base";
/**
 * 默认错误消息处理器实现
 */
export class DefaultErrorMessageHandler implements ErrorMessageHandler {
  getMessage(error: ValidationError): string {
    // 如果已经有自定义错误消息，直接返回
    if (error.errorMessage) {
      return error.errorMessage;
    }
    
    // 返回错误代码作为默认消息
    return error.errorCode || 'VALIDATION_FAILED';
  }
  
  getFormattedMessage(errors: ValidationError[], customMessage?: string): string {
    // 如果有自定义消息，优先使用
    if (customMessage) {
      return customMessage;
    }
    
    // 获取所有错误消息
    const errorMessages = errors
      .map(error => this.getMessage(error))
      .filter(Boolean);
    
    // 组合错误消息
    return errorMessages.length > 0 
      ? errorMessages.join('; ') 
      : '验证失败';
  }
}

/**
 * 全局错误消息处理器实例
 */
let globalErrorMessageHandler: ErrorMessageHandler = new DefaultErrorMessageHandler();

/**
 * 设置全局错误消息处理器
 * @param handler 自定义错误消息处理器
 */
export function setGlobalErrorMessageHandler(handler: ErrorMessageHandler) {
  globalErrorMessageHandler = handler;
}

/**
 * 获取全局错误消息处理器
 * @returns 当前的错误消息处理器
 */
export function getGlobalErrorMessageHandler(): ErrorMessageHandler {
  return globalErrorMessageHandler;
}