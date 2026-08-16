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
    NodeAttributes,
    TemplateCache,
    NodeOptions,
    TemplateDecl,
    SplitOptionsResult,
    NodeStyle,
    NodeHTMLClass,
    NodeMeta,
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
            names: [],
            childComponents: [],
            i18ns: [],
            permissions: [],
            indexs: {},
            nodes: {},
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
        let html = '';
        const hasChildren = (tpl.children && tpl.children.length > 0) || false;
        const isComponent = !!tpl.type;
        if (name) {
            const meta = this.CreateNodeMeta(tpl);
            cache.names.push(name);
            cache.indexs[name] = indexPath;
            cache.nodes[name] = meta;
            if (isComponent) {
                const opts = { ...tpl };
                SPLIT_OPTIONS_IGNORE_KEYS.forEach(key => delete opts[key]);
                cache.childComponents.push(name);
                meta.options = opts;
                return `<div class="${SKELETON_CLS}"></div>`;
            }
            const { attributes, options, style, classes } = this.splitOptions(tpl);
            meta.attributes = attributes;
            meta.style = style;
            meta.classes = classes;
            meta.options = options;
            html = this.buildNamedNodeHtml(tpl.tag || 'div', hasChildren);
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

    /**
     * 创建节点元数据的静态方法
     * @param tpl 模板声明对象，包含节点的各种配置信息
     * @returns 返回一个包含节点元数据的对象
     */
    static CreateNodeMeta(tpl: TemplateDecl): NodeMeta {
        // 获取模板的类型
        const type = tpl.type;
        // 返回节点元数据对象，包含以下属性：
        return {
            // 节点的标签名
            tag: tpl.tag,
            // 节点的类型
            type: type,
            // 国际化配置
            i18n: tpl.i18n,
            // 权限配置
            permission: tpl.permission,
            // 是否为组件的标志，通过双重否定将type转换为布尔值
            isComponent: !!type,
        };
    }

    static splitOptions(tpl: TemplateDecl, coreKeys?: Set<string>): SplitOptionsResult {
        const attributes: NodeAttributes = {};
        const options: NodeOptions = {};
        const style: NodeStyle = {};
        const classes: NodeHTMLClass = [];
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
                    classes.push(val);
                    break;
                case 'style':
                    StyleHelper.expand(val, style);
                    break;
                case 'attribute':
                    attributes[key] = val;
                    break;
                default:
                    options[key] = val;
                    break;
            }
        }
        return { attributes, options, style, classes };
    }

    /**
     * 根据键名获取选项类型
     * @param key - 需要检查的键名
     * @return 返回选项类型，可以是'class'、'style'、'attribute'或'option'
     */
    static getOptionType(key: string) {
        // 检查是否为类相关的键
        if (CLASS_KEYS.has(key)) return 'class';
        // 检查是否为style键
        if (key === 'style') return 'style';
        // 检查是否为样式相关的键
        if (STYLE_KEYS.has(key)) return 'style';
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
                if (typeof val === 'string') {
                    cls += typeof val === '' + ' ';
                } else {
                    cls += val.join(' ') + ' ';
                }
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
