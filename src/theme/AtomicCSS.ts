/**
 * 原子化 CSS 按需生成器
 *
 * 根据语义化 class 名（如 `q-flex`、`q-gap-sm`）自动生成对应的 CSS 规则并注入 `<style>` 标签。
 * 不引入外部依赖，按需生成，不预生成全量。
 *
 * @example
 * ```typescript
 * const acss = AtomicCSS.getInstance();
 * acss.resolve('q-flex q-items-center q-gap-sm');
 * // 生成 3 条 CSS 规则并注入 <style id="q-atomic-css">
 * ```
 */

import { atomicRules } from './presets/atomic-rules';

/** CSS class 名前缀 */
const CLASS_PREFIX = 'q-';

/** 注入的 style 标签 ID */
const STYLE_ID = 'q-atomic-css';

/**
 * 原子化 CSS 生成器
 *
 * 单例模式，按需生成 CSS 规则并注入到 `<style>` 标签
 */
export class AtomicCSS {
    private static instance: AtomicCSS;

    /** 已生成的 class 名集合，避免重复注入 */
    private readonly generated = new Set<string>();

    /** 自定义规则映射（可扩展） */
    private readonly customRules = new Map<string, Record<string, string>>();

    private constructor() {}

    /**
     * 获取单例实例
     */
    static getInstance(): AtomicCSS {
        if (!AtomicCSS.instance) {
            AtomicCSS.instance = new AtomicCSS();
        }
        return AtomicCSS.instance;
    }

    /**
     * 注册自定义原子化规则
     *
     * @param className - class 名（不含 `q-` 前缀）
     * @param declarations - CSS 声明对象
     */
    registerRule(className: string, declarations: Record<string, string>): void {
        this.customRules.set(className, declarations);
    }

    /**
     * 解析 class 名，生成 CSS 规则并注入
     *
     * @param className - 空格分隔的 class 名列表
     * @returns 实际生效的 class 名（跳过未匹配的）
     */
    resolve(className: string): string {
        if (!className) return '';

        const names = className.trim().split(/\s+/);
        const validNames: string[] = [];
        const newRules: string[] = [];

        for (const name of names) {
            // 去掉 q- 前缀查找规则
            const ruleKey = name.startsWith(CLASS_PREFIX)
                ? name.slice(CLASS_PREFIX.length)
                : name;

            // 查找规则：先查自定义，再查预定义
            const declarations = this.customRules.get(ruleKey) || atomicRules[ruleKey];

            if (!declarations) {
                // 不匹配的 class 名静默跳过，保留原样
                validNames.push(name);
                continue;
            }

            // 已生成过则跳过
            if (this.generated.has(name)) {
                validNames.push(name);
                continue;
            }

            // 生成 CSS 规则
            const cssRule = this.buildCSSRule(name, declarations);
            newRules.push(cssRule);
            this.generated.add(name);
            validNames.push(name);
        }

        // 注入新的 CSS 规则
        if (newRules.length > 0) {
            this.injectStyles(newRules.join('\n'));
        }

        return validNames.join(' ');
    }

    /**
     * 批量解析，生成完整样式表
     *
     * @param classNames - class 名数组
     * @returns 生成的完整样式表文本
     */
    generate(classNames: string[]): string {
        const allRules: string[] = [];

        for (const name of classNames) {
            const ruleKey = name.startsWith(CLASS_PREFIX)
                ? name.slice(CLASS_PREFIX.length)
                : name;

            const declarations = this.customRules.get(ruleKey) || atomicRules[ruleKey];
            if (declarations && !this.generated.has(name)) {
                allRules.push(this.buildCSSRule(name, declarations));
                this.generated.add(name);
            }
        }

        const css = allRules.join('\n');
        if (css) {
            this.injectStyles(css);
        }

        return css;
    }

    /**
     * 构建 CSS 规则文本
     *
     * @param selector - CSS 选择器（class 名）
     * @param declarations - CSS 声明对象
     * @returns CSS 规则文本
     */
    private buildCSSRule(selector: string, declarations: Record<string, string>): string {
        const props = Object.entries(declarations)
            .map(([prop, value]) => `  ${prop}: ${value};`)
            .join('\n');
        return `.${selector} {\n${props}\n}`;
    }

    /**
     * 注入 CSS 规则到 `<style>` 标签
     *
     * @param css - CSS 规则文本
     */
    private injectStyles(css: string): void {
        if (typeof document === 'undefined') return;

        let styleEl = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = STYLE_ID;
            styleEl.setAttribute('data-q-atomic', 'true');
            document.head.appendChild(styleEl);
        }

        styleEl.textContent += css + '\n';
    }

    /**
     * 清除所有已生成的规则（测试用）
     */
    clear(): void {
        this.generated.clear();
        if (typeof document !== 'undefined') {
            const styleEl = document.getElementById(STYLE_ID);
            if (styleEl) {
                styleEl.textContent = '';
            }
        }
    }
}
