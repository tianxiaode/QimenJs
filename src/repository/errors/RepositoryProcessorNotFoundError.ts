/**
 * 🎯 Repository处理器未找到错误
 * 当指定的CRUD操作没有可用的处理器时抛出
 */
import { ErrorBase } from '../../error';

export class RepositoryProcessorNotFoundError extends ErrorBase {
  /**
   * 构造函数
   * @param action 导致错误的CRUD操作
   * @param context 上下文信息（可选）
   */
  constructor(
    public readonly action: string,
    context?: Record<string, any>
  ) {
    const message = `[Repo Error]: Action "${action}" 没有任何可用的处理器。`;
    const code = 'REPO_PROCESSOR_NOT_FOUND';
    
    super(message, code, context);
    
    // 维护正确的原型链
    Object.setPrototypeOf(this, RepositoryProcessorNotFoundError.prototype);
  }
}