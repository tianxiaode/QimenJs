/**
 * 🎯 EntityManager无效页码错误
 * 当请求的页码超出有效范围时抛出
 */
import { ErrorBase } from '../../error';

export class EntityManagerInvalidPageError extends ErrorBase {
  /**
   * 构造函数
   * @param page 请求的页码
   * @param totalPages 总页数
   * @param context 上下文信息（可选）
   */
  constructor(
    public readonly page: number,
    public readonly totalPages: number,
    context?: Record<string, any>
  ) {
    const message = `跳转页码 ${page} 超出范围 [1, ${totalPages}]`;
    const code = 'ENTITY_MANAGER_INVALID_PAGE';
    
    super(message, code, context);
    
    // 维护正确的原型链
    Object.setPrototypeOf(this, EntityManagerInvalidPageError.prototype);
  }
}