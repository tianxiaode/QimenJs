/**
 * 🎯 Repository访问被拒绝错误
 * 当指定的操作没有权限时抛出
 */
import { ErrorBase } from '../../error';

export class RepositoryAccessDeniedError extends ErrorBase {
  /**
   * 构造函数
   * @param basePath 导致错误的API路径
   * @param action 导致错误的操作类型
   * @param context 上下文信息（可选）
   */
  constructor(
    public readonly basePath: string,
    public readonly action: string,
    context?: Record<string, any>
  ) {
    const message = `PERMISSION_DENIED: ${basePath} -> ${action}`;
    const code = 'REPO_ACCESS_DENIED';
    
    super(message, code, context);
    
    // 维护正确的原型链
    Object.setPrototypeOf(this, RepositoryAccessDeniedError.prototype);
  }
}