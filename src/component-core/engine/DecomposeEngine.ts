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

import type { TplNode } from '../types/tpl-node-types';
import { HTML_PROPS_SET } from '../constants/html-props-constants';
import { ARIA_PROPS_SET } from '../constants/aria-props-constants';
import { VOID_TAGS } from '../constants';
import { string } from '@qimenjs/utils';
import { DecomposeContext, DecomposeStep } from '../types';

const I18N_PREFIX = 'i18n:';

/**
 * 步骤1：提取 tag
 *
 * @param ctx - 拆解上下文
 */
function _extract_tag(ctx: DecomposeContext): void {
    ctx.meta.tag = ctx.clone.tag;
    delete ctx.clone.tag;
}

/**
 * 步骤2：提取 type（组件类型）
 *
 * @param ctx - 拆解上下文
 */
function _extract_type(ctx: DecomposeContext): void {
    ctx.meta.type = ctx.clone.type;
    ctx.isComponent = !!ctx.meta.type;
    delete ctx.clone.type;
}

/**
 * 步骤3：提取 contentMode
 *
 *  @param ctx - 拆解上下文
 */

function _extract_contentMode(ctx: DecomposeContext): void {
    ctx.meta.contentMode = ctx.clone.contentMode;
    delete ctx.clone.contentMode;
}

/**
 * 步骤4：提取 style
 *
 * @param ctx - 拆解上下文
 */
function _extract_style(ctx: DecomposeContext): void {
    ctx.meta.props!.style = ctx.clone.style;
    delete ctx.clone.style;
}

/**
 * 步骤4.5：提取 cssVars（自定义 CSS 变量）
 *
 * 将 cssVars 对象转为 CSS 变量声明，合并到 style 前部
 * （变量声明在前，后续样式可引用）。在 _extract_style 之后执行。
 *
 * @param ctx - 拆解上下文
 */
function _extract_cssVars(ctx: DecomposeContext): void {
    const cssVars = ctx.clone.cssVars;
    if (!cssVars) return;
    const varsStr = Object.entries(cssVars)
        .map(([k, v]) => `${k}: ${v}`)
        .join('; ');
    const existing = ctx.meta.props!.style;
    ctx.meta.props!.style =
        typeof existing === 'string' && existing ? `${varsStr}; ${existing}` : varsStr;
    delete ctx.clone.cssVars;
}
/**
 * 步骤5：提取 hidden 和 hiddenMode
 *
 * @param ctx - 拆解上下文
 */
function _extract_hidden(ctx: DecomposeContext): void {
    ctx.meta.props!.hidden = ctx.clone.hidden;
    ctx.meta.props!.hiddenMode = ctx.clone.hiddenMode;
    delete ctx.clone.hidden;
    delete ctx.clone.hiddenMode;
}

/**
 * 步骤6：提取 hint（提示文本，支持 i18n）
 *
 * @param ctx - 拆解上下文
 */
function _extract_hint(ctx: DecomposeContext) {
    const hint = ctx.clone.hint;
    //给节点初始值
    ctx.meta.props!.title = hint ?? undefined;
    //检查是否需要国际化
    if (typeof hint === 'string' && hint.startsWith(I18N_PREFIX)) {
        ctx.i18nKeys.push({ field: 'hint', i18nKey: hint.slice(I18N_PREFIX.length) });
    }
    delete ctx.clone.hint;
}

/**
 * 步骤7：提取 cls（类名）
 *
 * @param ctx - 拆解上下文
 */
function _extract_cls(ctx: DecomposeContext): void {
    ctx.meta.props!.className = ctx.clone.cls;
    delete ctx.clone.cls;
}

/**
 * 步骤8：提取 text（特殊处理 i18n）
 *
 * @param ctx - 拆解上下文
 */
function _extract_text(ctx: DecomposeContext): void {
    const text = ctx.clone.text;
    ctx.meta.text = text;

    // 检查 i18n 前缀
    if (typeof text === 'string' && text.startsWith(I18N_PREFIX)) {
        ctx.i18nKeys.push({ field: 'text', i18nKey: text.slice(I18N_PREFIX.length) });
    }

    delete ctx.clone.text;
}

/**
 * 步骤8：分类剩余字段
 *
 * @param ctx - 拆解上下文
 */
function _classify_remaining_fields(ctx: DecomposeContext): void {
    for (const [key, val] of Object.entries(ctx.clone)) {
        if (HTML_PROPS_SET.has(key)) {
            ctx.meta.props![key] = val;
            continue;
        }

        if (ARIA_PROPS_SET.has(key) || key.startsWith('data_')) {
            ctx.meta.attrs![key.replace('_', '-')] = val;
        }

        ctx.meta.config![key] = val;
        // 检查 i18n 前缀
        if (typeof val === 'string' && val.startsWith(I18N_PREFIX)) {
            ctx.i18nKeys.push({ field: key, i18nKey: val.slice(I18N_PREFIX.length) });
        }
    }
}

/**
 * 步骤9：构建 构建HTML
 *
 * @param ctx - 拆解上下文
 */
function _build_html(ctx: DecomposeContext): void {
    const tag = ctx.meta.tag ?? 'div';
    const meta = ctx.meta;

    if (ctx.isComponent) {
        ctx.html = `<cmp class="q-skeleton"></cmp>`;
        return;
    }

    const hasChildren = !!(ctx.node.children && ctx.node.children.length > 0);
    const placeholder = hasChildren ? '<!--q-children-->' : '';

    if (ctx.hasName) {
        ctx.html = `<${tag}>${placeholder}</${tag}>`;
        return;
    }

    const props = meta.props ?? {};
    const attrs = meta.attrs ?? {};
    const attrParts: string[] = [];

    if (props.className) {
        attrParts.push(`class="${string.escapeHtml(props.className)}"`);
    }

    if (props.style) {
        attrParts.push(`style="${string.escapeHtml(props.style)}"`);
    }

    if (props.hidden) {
        attrParts.push('hidden');
    }

    for (const [key, val] of Object.entries(attrs)) {
        if (val === true) {
            attrParts.push(string.escapeHtml(key));
        } else if (val !== false && val != null) {
            attrParts.push(`${string.escapeHtml(key)}="${string.escapeHtml(String(val))}"`);
        }
    }

    const attrStr = attrParts.length > 0 ? ' ' + attrParts.join(' ') : '';
    const text = meta.text ? string.escapeHtml(meta.text) : '';
    const inner = text + placeholder;

    ctx.html = VOID_TAGS.has(tag.toLowerCase())
        ? `<${tag}${attrStr} />`
        : `<${tag}${attrStr}>${inner}</${tag}>`;
}

/** 拆解管线步骤列表 */
const DECOMPOSE_STEPS: DecomposeStep[] = [
    _extract_tag,
    _extract_type,
    _extract_contentMode,
    _extract_style,
    _extract_cssVars,
    _extract_hidden,
    _extract_hint,
    _extract_cls,
    _extract_text,
    _classify_remaining_fields,
    _build_html,
];

/**
 * 拆解引擎
 */
// DecomposeEngine.ts
export class DecomposeEngine {
    static decompose(node: TplNode): DecomposeContext {
        const clone = { ...node };
        const name = clone.name ?? '';
        const ctx: DecomposeContext = {
            node,
            name,
            clone: clone,
            meta: { name, props: {}, attrs: {}, config: {}, action: clone.action },
            html: '',
            i18nKeys: [],
            hasPermission: !!name && !!clone.permission,
            hasName: !!clone.name,
            isComponent: false,
        };
        delete clone.name;
        delete clone.permission;
        delete clone.action;
        for (const step of DECOMPOSE_STEPS) {
            step(ctx);
        }

        return ctx;
    }
}
