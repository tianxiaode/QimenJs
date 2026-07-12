import { RegistrarBase } from '@qimenjs/registry';
import { RegistrarNotFoundError } from '@qimenjs/registry';
import type { LayoutNode } from '@/layout/LayoutNode';
import type { JsonTemplateNode } from '@/component-core/template-compiler';
import { jsonTemplateToHtml } from '@/component-core/template-compiler';

/**
 * 模板注册器名称
 */
export const TemplateRegistrarName = 'template' as const;

/**
 * 模板条目类型
 *
 * - string：HTML 模板字符串
 * - JsonTemplateNode[]：JSON 模板数组（自动转换为 HTML）
 * - LayoutNode：JSON 组件定义
 */
export type TemplateEntry = string | JsonTemplateNode[] | LayoutNode;

/**
 * 模板注册器
 *
 * 统一管理 HTML 模板和 JSON 组件定义的注册与检索。
 *
 * HTML 模板：通过 register(id, htmlString) 注册，getFragment(id) 获取 DocumentFragment。
 * JSON 定义：通过 registerJson(id, layoutNode) 注册，getJson(id) 获取 LayoutNode。
 *
 * 模板中可通过 data-json="DefinitionId" 声明子组件占位，
 * Renderer 扫描后从注册表取 JSON 定义，递归渲染子组件。
 *
 * 优化：首次 getFragment() 时懒创建 <template> 元素缓存，
 * 后续调用通过 cloneNode(true) 返回 DocumentFragment，
 * 跳过 innerHTML 的 HTML 解析开销。
 */
export class TemplateRegistrar extends RegistrarBase<Map<string, TemplateEntry>> {
    public readonly name = TemplateRegistrarName;
    protected storage = new Map<string, TemplateEntry>();

    /**
     * 模板元素缓存（仅 HTML 类型使用）
     * 首次 getFragment 时按需创建，避免启动时解析所有模板
     */
    private templateCache = new Map<string, HTMLTemplateElement>();

    // ─── HTML 模板 ───

    /**
     * 注册 HTML 模板
     *
     * @param id - 模板唯一标识符
     * @param template - HTML 模板字符串或 JSON 模板数组
     */
    register(id: string, template: string | JsonTemplateNode[]): void {
        this.checkLock();
        const html = typeof template === 'string' ? template : jsonTemplateToHtml(template);
        this.storage.set(id, html);
        // HTML 缓存失效，下次 getFragment 时重新创建
        this.templateCache.delete(id);
    }

    /**
     * 获取 HTML 模板字符串
     *
     * @param id - 模板 ID
     * @returns 对应的 HTML 模板字符串
     * @throws RegistrarNotFoundError - 模板不存在或不是 HTML 类型时抛出
     */
    get(id: string): string {
        const entry = this.storage.get(id);
        if (!entry) {
            throw new RegistrarNotFoundError(this.name, id);
        }
        if (typeof entry !== 'string') {
            throw new Error(`TemplateRegistrar: "${id}" is a JSON definition, not an HTML template. Use getJson() instead.`);
        }
        return entry;
    }

    /**
     * 获取克隆的 DocumentFragment
     *
     * 首次调用时从 storage 中的 HTML 字符串创建 <template> 缓存，
     * 后续调用通过 cloneNode(true) 复制缓存，跳过 HTML 解析。
     *
     * @param id - 模板 ID
     * @returns 克隆的 DocumentFragment
     * @throws RegistrarNotFoundError - 模板不存在或不是 HTML 类型时抛出
     */
    getFragment(id: string): DocumentFragment {
        const entry = this.storage.get(id);
        if (!entry) {
            throw new RegistrarNotFoundError(this.name, id);
        }
        if (typeof entry !== 'string') {
            throw new Error(`TemplateRegistrar: "${id}" is a JSON definition, not an HTML template. Use getJson() instead.`);
        }

        let tpl = this.templateCache.get(id);
        if (!tpl) {
            tpl = document.createElement('template');
            tpl.innerHTML = entry;
            this.templateCache.set(id, tpl);
        }
        return tpl.content.cloneNode(true) as DocumentFragment;
    }

    // ─── JSON 组件定义 ───

    /**
     * 注册 JSON 组件定义
     *
     * @param id - 定义唯一标识符
     * @param layout - LayoutNode 组件定义
     */
    registerJson(id: string, layout: LayoutNode): void {
        this.checkLock();
        this.storage.set(id, layout);
    }

    /**
     * 获取 JSON 组件定义
     *
     * @param id - 定义 ID
     * @returns 对应的 LayoutNode
     * @throws RegistrarNotFoundError - 定义不存在或不是 JSON 类型时抛出
     */
    getJson(id: string): LayoutNode {
        const entry = this.storage.get(id);
        if (!entry) {
            throw new RegistrarNotFoundError(this.name, id);
        }
        if (typeof entry === 'string') {
            throw new Error(`TemplateRegistrar: "${id}" is an HTML template, not a JSON definition. Use get() instead.`);
        }
        return entry;
    }

    // ─── 通用 ───

    /**
     * 检查指定 ID 是否已注册
     */
    has(id: string): boolean {
        return this.storage.has(id);
    }

    /**
     * 检查指定 ID 是否为 HTML 模板
     */
    isHtml(id: string): boolean {
        return typeof this.storage.get(id) === 'string';
    }

    /**
     * 检查指定 ID 是否为 JSON 组件定义
     */
    isJson(id: string): boolean {
        const entry = this.storage.get(id);
        return entry !== undefined && typeof entry !== 'string';
    }

    /**
     * 注销模板或定义
     *
     * @param id - 要删除的 ID
     */
    unregister(id: string): void {
        this.checkLock();
        this.storage.delete(id);
        this.templateCache.delete(id);
    }

    /**
     * 清空所有已注册的模板和定义
     */
    override clear(): void {
        this.checkLock();
        this.storage.clear();
        this.templateCache.clear();
    }

    /**
     * 输出注册器的状态信息
     */
    protected doInspect(): void {
        const entries: Record<string, { type: string; preview: string }> = {};
        for (const [id, entry] of this.storage) {
            if (typeof entry === 'string') {
                entries[id] = { type: 'html', preview: entry.slice(0, 80) + (entry.length > 80 ? '...' : '') };
            } else {
                entries[id] = { type: 'json', preview: `type: ${entry.type}` };
            }
        }
        console.table(entries);
    }
}
