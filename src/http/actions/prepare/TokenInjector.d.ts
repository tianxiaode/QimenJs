/**
 * TokenInjector - Token 注入处理器
 *
 * 职责：
 * - 从 DomainConfig 读取 token
 * - 根据 authInjector 配置注入到请求中
 */
import type { RequestContext } from '@orbitjs/context';
/**
 * TokenInjector 处理器
 */
export declare const TokenInjectorHandler: (context: RequestContext) => Promise<void>;
//# sourceMappingURL=TokenInjector.d.ts.map