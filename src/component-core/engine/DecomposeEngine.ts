/**
 * DecomposeEngine — 拆解引擎（管线提取模式）
 *
 * 专门处理模板节点的字段拆解和分类
 *
 * 设计理念：
 * - 子组件自己处理配置，父组件只管 tag 节点
 * - 无 name 节点：props 和 attrs 直接写入 HTML
 * - 有 name 节点：props 和 attrs 保存到 meta
 * - 组件字段也拆分为 props、attrs、config
 *
 * 采用管线提取模式，将拆解过程分解为多个独立步骤
 *
 * @module DecomposeEngine
 */

import { HTML_PROPS, STYLE_PROPS, VOID_TAGS } from '../constants';
import { string } from '@qimenjs/utils';
import {
    DecomposeComponentOptionsResult,
    DecomposeContext,
    DecomposeResult,
    DecomposeStep,
    TplDecl,
} from '../types';
import { StyleHelper } from './StyleHelper';

/**
 * 步骤1：提取 style
 *
 * @param ctx - 拆解上下文
 */
/**
 * 步骤1：提取 style（扁平化）
 */
function _extract_style(ctx: DecomposeContext): void {
    const style = ctx.clone.style;
    if (!style) {
        delete ctx.clone.style;
        return;
    }

    StyleHelper.expand(style, ctx.attrDecl);
    delete ctx.clone.style;
}

/**
 * 步骤2：提取 hint（提示文本，支持 i18n）
 *
 * @param ctx - 拆解上下文
 */
function _extract_hint(ctx: DecomposeContext) {
    const hint = ctx.clone.hint;
    //给节点初始值
    if (ctx.tag === 'img') {
        ctx.attrDecl.alt = hint;
    } else {
        ctx.attrDecl.title = hint;
    }
    delete ctx.clone.hint;
}

/**
 * 步骤3：提取 cls（类名）
 *
 * @param ctx - 拆解上下文
 */
function _extract_cls(ctx: DecomposeContext): void {
    ctx.attrDecl.className = ctx.clone.className ?? ctx.clone.cls ?? ctx.clone.class;
    delete ctx.clone.cls;
    delete ctx.clone.className;
    delete ctx.clone.class;
}

/**
 * 步骤4：分类剩余字段
 *
 * @param ctx - 拆解上下文
 */
function _classify_remaining_fields(ctx: DecomposeContext): void {
    const coreKeys = ctx.coreKeys;
    for (const [key, val] of Object.entries(ctx.clone)) {
        if (coreKeys && coreKeys.has(key)) {
            ctx.nodeOptions![key] = val;
            continue;
        }

        if (STYLE_PROPS.has(key) || HTML_PROPS.has(key)) {
            ctx.attrDecl[key] = val;
            continue;
        }

        if (key.startsWith('data_') || key.startsWith('aria_')) {
            ctx.attrDecl[key.replace('_', '-')] = val;
            continue;
        }
        ctx.nodeOptions![key] = val;
    }
}

/**
 * 步骤5：构建 构建HTML
 *
 * @param ctx - 拆解上下文
 */
/**
 * 步骤5：构建 HTML
 */
/**
 * 步骤5：构建 HTML
 */
function _build_html(ctx: DecomposeContext): void {
    const tag = ctx.tag ?? 'div';

    const hasChildren = !!(ctx.node!.children && ctx.node!.children.length > 0);
    const placeholder = hasChildren ? '<!--q-children-->' : '';

    if (ctx.hasName) {
        ctx.html = `<${tag}>${placeholder}</${tag}>`;
        return;
    }

    const attrs = ctx.attrDecl;
    const attrParts: string[] = [];
    const styleParts: string[] = [];

    for (const [key, val] of Object.entries(attrs)) {
        // 跳过 undefined/null
        if (val === undefined || val === null) continue;

        // 1. className
        if (key === 'className' || key === 'class') {
            attrParts.push(`class="${string.escapeHtml(val)}"`);
            continue;
        }

        // 2. 样式属性 → 收集到 styleParts
        if (STYLE_PROPS.has(key)) {
            const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            const cssVal =
                typeof val === 'number' && !['zIndex', 'opacity', 'flex'].includes(key)
                    ? `${val}px`
                    : val;
            styleParts.push(`${cssKey}: ${cssVal}`);
            continue;
        }

        // 3. hidden
        if (key === 'hidden' && val === true) {
            attrParts.push('hidden');
            continue;
        }

        // 4. 其他属性
        if (val === true) {
            attrParts.push(string.escapeHtml(key));
        } else if (val !== false && val !== null) {
            attrParts.push(`${string.escapeHtml(key)}="${string.escapeHtml(String(val))}"`);
        }
    }

    // 添加 style
    if (styleParts.length > 0) {
        attrParts.push(`style="${string.escapeHtml(styleParts.join('; '))}"`);
    }

    const attrStr = attrParts.length > 0 ? ' ' + attrParts.join(' ') : '';
    const text = ctx.text ? string.escapeHtml(ctx.text) : '';
    const inner = text + placeholder;

    ctx.html = VOID_TAGS.has(tag.toLowerCase())
        ? `<${tag}${attrStr} />`
        : `<${tag}${attrStr}>${inner}</${tag}>`;
}

/** 拆解管线步骤列表 */
const DECOMPOSE_NODE_STEPS: DecomposeStep[] = [
    _extract_style,
    _extract_hint,
    _extract_cls,
    _classify_remaining_fields,
];

/**
 * 拆解引擎
 *
 * 两个入口：
 * 1. decompose(node) - 编译时拆解 TplDecl，生成 HTML
 * 2. decomposeComponentOptions(options, coreKeys) - 运行时拆解组件选项
 */
export class DecomposeEngine {
    /**
     * 从 TplDecl 拆解（编译时）
     *
     * 生成 HTML + 分类属性
     */
    static decompose(node: TplDecl): DecomposeResult {
        const ctx = this.initContext(node);
        // 2. 如果是组件节点，特殊处理
        if (ctx.isComponent) {
            // 移除不需要的字段
            delete ctx.clone.children;

            // 剩余所有字段作为 nodeOptions 传给子组件
            ctx.nodeOptions = {
                ...ctx.clone,
                text: ctx.text,
                hidden: ctx.hidden,
                hiddenMode: ctx.hiddenMode,
                contentMode: ctx.contentMode,
                action: ctx.action,
            };

            // 组件节点用骨架占位
            ctx.html = `<div class="q-skeleton"></div>`;

            return ctx;
        }

        this.runStep(ctx);
        _build_html(ctx);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { node: nodeTep, clone, coreKeys, ...result } = ctx;
        return result;
    }

    /**
     * 从 ComponentOptions 拆解（运行时）
     *
     * 只分类属性，不生成 HTML
     */
    static decomposeComponentOptions(
        node: Record<string, any>,
        coreKeys?: string[]
    ): DecomposeComponentOptionsResult {
        const ctx = this.initContext(node);
        if (coreKeys) {
            ctx.coreKeys = new Set(coreKeys);
        }

        this.runStep(ctx);

        ctx.nodeOptions.text = ctx.text;
        ctx.nodeOptions.hidden = ctx.hidden;
        ctx.nodeOptions.hiddenMode = ctx.hiddenMode;
        ctx.nodeOptions.contentMode = ctx.contentMode;
        ctx.nodeOptions.action = ctx.action;

        return { attrDecl: ctx.attrDecl, options: ctx.attrDecl } as DecomposeComponentOptionsResult;
    }

    /**
     * 初始化上下文
     */
    private static initContext(node: TplDecl): DecomposeContext {
        const clone = { ...node };
        const ctx: DecomposeContext = {
            node,
            html: '',
            hasName: false,
            isComponent: false,
            clone,
            attrDecl: {},
            nodeOptions: {},
        };
        const name = ctx.clone.name;
        ctx.name = name;
        ctx.hasName = !!name;
        ctx.tag = ctx.clone.tag;
        ctx.type = ctx.clone.type;
        ctx.hidden = ctx.clone.hidden;
        ctx.hiddenMode = ctx.clone.hiddenMode;
        ctx.contentMode = ctx.clone.contentMode;
        ctx.action = ctx.clone.action;
        ctx.i18n = ctx.clone.i18n;
        ctx.permission = ctx.clone.permission;
        ctx.text = ctx.clone.text;
        delete ctx.clone.name;
        delete ctx.clone.tag;
        delete ctx.clone.type;
        delete ctx.clone.hidden;
        delete ctx.clone.hiddenMode;
        delete ctx.clone.contentMode;
        delete ctx.clone.action;
        delete ctx.clone.i18n;
        delete ctx.clone.permission;
        delete ctx.clone.text;
        return ctx;
    }

    /**
     * 执行拆解步骤
     */
    private static runStep(ctx: DecomposeContext) {
        for (const step of DECOMPOSE_NODE_STEPS) {
            step(ctx);
        }
    }
}
