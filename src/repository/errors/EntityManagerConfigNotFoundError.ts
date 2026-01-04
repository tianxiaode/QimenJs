/**
 * 🎯 EntityManager配置未找到错误
 * 当指定的配置域不存在时抛出
 */
import { ErrorBase } from '../../error';

export class EntityManagerConfigNotFoundError extends ErrorBase {
  /**
   * 构造函数
   * @param configName 导致错误的配置名称
   * @param context 上下文信息（可选）
   */
  constructor(
    public readonly configName: string,
    context?: Record<string, any>
  ) {
    const message = `Configuration domain "${configName}" not found.`;
    const code = 'ENTITY_MANAGER_CONFIG_NOT_FOUND';
    
    super(message, code, context);
    
    // 维护正确的原型链
    Object.setPrototypeOf(this, EntityManagerConfigNotFoundError.prototype);
  }
}