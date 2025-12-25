// 导入基础错误类，作为自定义错误类型的基类
import { BaseError } from "@/error";

/**
 * 验证类型未定义错误
 * 当请求使用一个未定义或不存在的验证类型时抛出此错误
 * 
 * 通常发生在以下情况：
 * 1. 尝试使用尚未注册的验证器类型
 * 2. 验证配置中指定了无效的验证类型名称
 * 3. 验证规则引用了不存在的验证类型
 */
export class ValidationTypeNotDefinedError extends BaseError {
  /**
   * 构造函数 - 创建一个新的验证类型未定义错误实例
   * 
   * @param message - 错误的详细描述信息，说明具体是什么验证类型未定义
   * @param context - 可选的上下文信息对象，可用于传递额外的调试信息，
   *                  如验证器名称、配置详情等
   */
  constructor(
    message: string,
    context?: Record<string, any>
  ) {
    // 调用父类构造函数，设置固定的错误代码 'VALIDATION_RULE_ERROR'
    // 这有助于统一识别此类错误
    super(message, 'VALIDATION_RULE_ERROR', context);
  }
}