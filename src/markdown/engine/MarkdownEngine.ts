/**
 * MarkdownEngine Markdown 解析引擎
 *
 * 零依赖的 Markdown → HTML 解析器，采用规则管道架构：
 * 1. 块级解析（block）：将原始文本拆分为块级元素（标题/代码块/列表/引用/段落等）
 * 2. 内联解析（inline）：在每个块级元素内部解析内联语法（加粗/斜体/链接/图片/行内代码等）
 *
 * 引擎可独立使用，不依赖任何 UI 组件。
 *
 * @example
 * ```ts
 * const engine = new MarkdownEngine();
 * const html = engine.render('# Hello **World**');
 * // => '<h1>Hello <strong>World</strong></h1>'
 *
 * // 自定义规则
 * engine.addBlockRule(myBlockRule);
 * engine.addInlineRule(myInlineRule);
 * ```
 */

import { blockRules } from './rules';
import { inlineRules } from './rules';
import type { BlockRule, InlineRule, BlockToken } from './rules';

export interface MarkdownEngineOptions {
    html?: boolean;
    breaks?: boolean;
    linkify?: boolean;
}

export class MarkdownEngine {
    private _blockRules: BlockRule[];
    private _inlineRules: InlineRule[];
    private _options: Required<MarkdownEngineOptions>;

    constructor(options?: MarkdownEngineOptions) {
        this._options = {
            html: options?.html ?? false,
            breaks: options?.breaks ?? false,
            linkify: options?.linkify ?? false,
        };
        this._blockRules = [...blockRules];
        this._inlineRules = [...inlineRules];
    }

    render(src: string): string {
        if (!src) return '';
        const tokens = this._parseBlock(src);
        return this._renderTokens(tokens);
    }

    parse(src: string): BlockToken[] {
        if (!src) return [];
        return this._parseBlock(src);
    }

    addBlockRule(rule: BlockRule): void {
        this._blockRules.push(rule);
        this._blockRules.sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100));
    }

    addInlineRule(rule: InlineRule): void {
        this._inlineRules.push(rule);
        this._inlineRules.sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100));
    }

    private _parseBlock(src: string): BlockToken[] {
        const tokens: BlockToken[] = [];
        const lines = src.split('\n');
        let i = 0;

        while (i < lines.length) {
            let matched = false;

            for (const rule of this._blockRules) {
                const result = rule.match(lines, i);
                if (result) {
                    tokens.push(result.token);
                    i = result.nextIndex;
                    matched = true;
                    break;
                }
            }

            if (!matched) {
                const paraLines: string[] = [];
                while (i < lines.length && lines[i].trim() !== '') {
                    let isOtherBlock = false;
                    for (const rule of this._blockRules) {
                        if (rule.match(lines, i)) {
                            isOtherBlock = true;
                            break;
                        }
                    }
                    if (isOtherBlock) break;
                    paraLines.push(lines[i]);
                    i++;
                }
                if (paraLines.length > 0) {
                    tokens.push({
                        type: 'paragraph',
                        raw: paraLines.join('\n'),
                        text: paraLines.join(this._options.breaks ? '<br>' : '\n'),
                    });
                } else {
                    i++;
                }
            }
        }

        return tokens;
    }

    private _renderTokens(tokens: BlockToken[]): string {
        return tokens.map(token => this._renderBlockToken(token)).join('\n');
    }

    private _renderBlockToken(token: BlockToken): string {
        const content = token.text ? this._parseInline(token.text) : '';

        switch (token.type) {
            case 'heading':
                return `<h${token.depth}>${content}</h${token.depth}>`;
            case 'paragraph':
                return `<p>${content}</p>`;
            case 'code_block':
                return `<pre><code${token.lang ? ` class="language-${token.lang}"` : ''}>${this._escapeHtml(token.text ?? '')}</code></pre>`;
            case 'blockquote':
                return `<blockquote>${this._renderTokens(token.children ?? [])}</blockquote>`;
            case 'list':
                return token.ordered
                    ? `<ol>${(token.items ?? []).map(item => `<li>${this._parseInline(item)}</li>`).join('')}</ol>`
                    : `<ul>${(token.items ?? []).map(item => `<li>${this._parseInline(item)}</li>`).join('')}</ul>`;
            case 'hr':
                return '<hr>';
            case 'html':
                return this._options.html ? (token.text ?? '') : this._escapeHtml(token.text ?? '');
            default:
                return `<p>${content}</p>`;
        }
    }

    private _parseInline(text: string): string {
        let result = text;

        for (const rule of this._inlineRules) {
            result = rule.replace(result);
        }

        return result;
    }

    private _escapeHtml(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
}
