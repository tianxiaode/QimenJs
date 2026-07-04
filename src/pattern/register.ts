/**
 * 自动注册验证所需模式
 *
 * 引入 @orbit-js/pattern 时自动执行，将 ValidationPatternType 枚举中
 * 全部 19 个模式注册到 PatternRegistrar，确保验证不出错
 */

import { PatternRegistrar } from './PatternRegistrar';
import { VALIDATION_PATTERNS } from './presets';

/**
 * 注册验证所需模式到 PatternRegistrar
 *
 * @param extra - 额外的模式映射，与 VALIDATION_PATTERNS 合并注册
 */
export function registerValidationPatterns(extra?: Record<string, RegExp>): void {
    const registrar = PatternRegistrar.getInstance();
    registrar.register(VALIDATION_PATTERNS);
    if (extra) {
        registrar.register(extra);
    }
}

// 自动注册验证所需模式
registerValidationPatterns();
