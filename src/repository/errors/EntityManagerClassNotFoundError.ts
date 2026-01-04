/**
 * 🎯 EntityManager类未找到错误
 * 当指定的实体管理器类不存在时抛出
 */
import { ErrorBase } from '../../error';

export class EntityManagerClassNotFoundError extends ErrorBase {
  /**
   * 构造函数
   * @param entityManagerName 导致错误的实体管理器名称
   * @param context 上下文信息（可选）
   */
  constructor(
    public readonly entityManagerName: string,
    context?: Record<string, any>
  ) {
    const message = `"${entityManagerName}" not found. Did you forget to register it?`;
    const code = 'ENTITY_MANAGER_CLASS_NOT_FOUND';
    
    super(message, code, context);
    
    // 维护正确的原型链
    Object.setPrototypeOf(this, EntityManagerClassNotFoundError.prototype);
  }
}