/**
 * 🎯 Repository类未找到错误
 * 当指定的仓库类不存在时抛出
 */
import { ErrorBase } from '../../error';

export class RepositoryClassNotFoundError extends ErrorBase {
  /**
   * 构造函数
   * @param repositoryName 导致错误的仓库名称
   * @param context 上下文信息（可选）
   */
  constructor(
    public readonly repositoryName: string,
    context?: Record<string, any>
  ) {
    const message = `"${repositoryName}" not found. Did you forget to register it?`;
    const code = 'REPO_CLASS_NOT_FOUND';
    
    super(message, code, context);
    
    // 维护正确的原型链
    Object.setPrototypeOf(this, RepositoryClassNotFoundError.prototype);
  }
}