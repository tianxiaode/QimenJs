import {
    ATTR_PREFIXES_KEYS,
    CHILDREN_PLACEHOLDER,
    CLASS_KEYS,
    HTML_KEYS,
    SKELETON_CLS,
    SPLIT_OPTIONS_IGNORE_KEYS,
    STYLE_KEYS,
    VOID_TAGS,
} from '../constants';
import {
    Attributes,
    NodeMeta,
    NodeOptions,
    SplitOptionsResult,
    TemplateDecl,
    TemplateCache,
} from '../types';
import { StyleHelper } from './StyleHelper';
import { string } from '@qimenjs/utils';

export class TemplateManager {
    private static tplCache = new Map<TemplateDecl, TemplateCache>();
    static get(tpl: TemplateDecl): TemplateCache {
        const cached = this.tplCache.get(tpl);
        if (cached) {
            return cached;
        }
        const newCached = this.compileTemplate(tpl);
        this.tplCache.set(tpl, newCached);
        return newCached;
    }

    static compileTemplate(tpl: TemplateDecl): TemplateCache {
        const cache: TemplateCache = {
            html: '',
            indexPath: {},
            exposeNames: [],
            i18nMap: {},
            permissionMap: {},
            nodeMetaMap: {},
            atttributesMap: {},
            components: [],
        };
        //先处理根节点
        const html = this.resolveNode(tpl, cache, [], true);
        cache.html = html;
        cache.templateCache = this.createTemplateElement(html);
        return cache;
    }

    static resolveNode(
        tpl: TemplateDecl,
        cache: TemplateCache,
        indexPath: number[],
        isRoot: boolean = false
    ): string {
        const name = isRoot ? 'root' : tpl.name;
        const { attributes, options } = this.splitOptions(tpl);
        let html = '';
        const hasChildren = (tpl.children && tpl.children.length > 0) || false;
        if (name) {
            const meta = this.createNodeMeta(tpl, options);
            meta.nodeIndex = indexPath;
            cache.nodeMetaMap[name] = meta;
            if (tpl.i18n) {
                cache.i18nMap[name] = tpl.i18n;
            }
            if (tpl.permission) {
                cache.permissionMap[name] = tpl.permission;
            }
            cache.atttributesMap[name] = attributes;
            cache.indexPath[name] = indexPath;
            if (meta.isComponent) {
                cache.components.push(name);
                return `<div class="${SKELETON_CLS}"></div>`;
            }
            html = this.buildNamedNodeHtml(meta.tag || 'div', hasChildren);
        } else {
            html = this.buildHtml(tpl, hasChildren);
        }
        if (tpl.children) {
            const childHtmls = [];
            for (let i = 0; i < tpl.children.length; i++) {
                const child = tpl.children[i];
                const newIndexPath = [...indexPath, i];
                childHtmls.push(this.resolveNode(child, cache, newIndexPath, false));
            }
            html = html.replace(CHILDREN_PLACEHOLDER, childHtmls.join(''));
        }
        return html;
    }

    static createNodeMeta(tpl: TemplateDecl, options: NodeOptions): NodeMeta {
        return {
            name: tpl.name,
            tag: tpl.tag,
            text: tpl.text,
            contentMode: tpl.contentMode,
            action: tpl.action,
            type: tpl.type,
            isComponent: !!tpl.type,
            options,
        };
    }

    static splitOptions(tpl: TemplateDecl, coreKeys?: Set<string>): SplitOptionsResult {
        const attributes: Attributes = {};
        const options: NodeOptions = {};
        const tag = tpl.tag;
        for (const [key, val] of Object.entries(tpl)) {
            if (SPLIT_OPTIONS_IGNORE_KEYS.has(key)) continue;

            //先提取组件核心属性
            if (coreKeys && coreKeys.has(key)) {
                options[key] = val;
                continue;
            }

            //对于hint，如果是dom节点，做特殊处理
            if (key === 'hint' && tag) {
                if (tag === 'img') {
                    attributes.alt = val;
                } else {
                    attributes.title = val;
                }
                continue;
            }

            const type = TemplateManager.getOptionType(key);
            //其他属性，根据类型做不同处理
            switch (type) {
                case 'class':
                    attributes.class += val + ' ';
                    break;
                case 'style':
                    StyleHelper.expand(val, attributes);
                    break;
                case 'attribute':
                    attributes[key] = val;
                    break;
                default:
                    options[key] = val;
                    break;
            }
        }
        return { attributes, options };
    }

    static getOptionType(key: string) {
        if (CLASS_KEYS.has(key)) return 'class';
        if (key === 'style') return 'style';
        if (STYLE_KEYS.has(key)) return 'attribute';
        // data-* / aria-* 都算 html
        if (ATTR_PREFIXES_KEYS.has(key)) return 'attribute';
        if (HTML_KEYS.has(key)) return 'attribute';
        return 'option';
    }

    static buildNamedNodeHtml(tag: string, hasChildren: boolean): string {
        const placeholder = hasChildren ? CHILDREN_PLACEHOLDER : '';
        return `<${tag}>${placeholder}</${tag}>`;
    }

    static buildHtml(tpl: TemplateDecl, hasChildren: boolean): string {
        const placeholder = hasChildren ? CHILDREN_PLACEHOLDER : '';
        const tag = tpl.tag ?? 'div';
        let style = '';
        let cls = '';
        const attrs = [];
        for (const [key, val] of Object.entries(tpl)) {
            if (val === undefined || val === null) continue;

            if (CLASS_KEYS.has(key)) {
                cls += val + ' ';
                continue;
            }

            if (key === 'style' || STYLE_KEYS.has(key)) {
                // ✅ 一行搞定
                style = StyleHelper.addStyle(key, val, style);
                continue;
            }

            if (key === 'hint' && tag) {
                if (tag === 'img') {
                    attrs.push(`alt="${val}"`);
                } else {
                    attrs.push(`title="${val}"`);
                }
                continue;
            }

            attrs.push(`${key}="${string.escapeHtml(val)}"`);
        }
        if (style.length > 0) {
            attrs.push(`style="${style}"`);
        }
        if (cls.length > 0) {
            attrs.push(`class="${cls.trim()}"`);
        }
        const attrStr = attrs.length > 0 ? ' ' + attrs.join(' ') : '';
        const text = tpl.text ? string.escapeHtml(tpl.text) : '';
        const inner = text + placeholder;

        return VOID_TAGS.has(tag.toLowerCase())
            ? `<${tag}${attrStr} />`
            : `<${tag}${attrStr}>${inner}</${tag}>`;
    }

    /**
     * 创建模板元素 — 预编译 HTML 到 HTMLTemplateElement
     *
     * @param html - HTML 字符串
     * @returns 预编译的模板元素（可 cloneNode 复用）
     */
    private static createTemplateElement(html: string): HTMLTemplateElement {
        const template = document.createElement('template');
        template.innerHTML = html;
        return template;
    }
}
