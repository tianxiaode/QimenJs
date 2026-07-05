/**
 * @qimenjs/pattern - 模式注册器
 *
 * 提供命名正则表达式注册器，管理验证所需的模式。
 * 引入即自动注册 ValidationPatternType 枚举中全部 19 个模式。
 *
 * @example
 * ```typescript
 * import '@qimenjs/pattern';
 *
 * // 使用 PatternRegistrar
 * import { PatternRegistrar } from '@qimenjs/pattern';
 * const emailRegex = PatternRegistrar.getInstance().get('email');
 * emailRegex.test('user@example.com'); // true
 * ```
 */

// PatternRegistrar 核心
export { PatternRegistrar, PatternRegistrarName } from './PatternRegistrar';

// 预定义模式常量
export { FORMAT_PATTERNS, PASSWORD_PATTERNS, VALIDATION_PATTERNS } from './presets';

// 自动注册（必须在最后，触发 registerValidationPatterns）
export { registerValidationPatterns } from './register';
