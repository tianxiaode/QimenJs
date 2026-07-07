/**
 * TemplateRegistry HTML 模板注册表
 *
 * 使用浏览器原生 <template> 标签 + cloneNode 实现模板复用
 */

export class TemplateRegistry {
    private static instance: TemplateRegistry;

    /** 模板存储：name → HTMLTemplateElement */
    private readonly templates = new Map<string, HTMLTemplateElement>();

    private constructor() {}

    /**
     * 获取单例实例
     */
    static getInstance(): TemplateRegistry {
        if (!TemplateRegistry.instance) {
            TemplateRegistry.instance = new TemplateRegistry();
        }
        return TemplateRegistry.instance;
    }

    /**
     * 注册 HTML 模板
     *
     * @param name - 模板名称
     * @param html - HTML 字符串
     */
    registerHTML(name: string, html: string): void {
        // XSS 风险提示
        if (html.includes('<script') || html.includes('javascript:')) {
            console.warn(`TemplateRegistry: template "${name}" may contain XSS risk content`);
        }

        if (typeof document === 'undefined') return;

        const template = document.createElement('template');
        template.innerHTML = html;
        this.templates.set(name, template);
    }

    /**
     * 注册模板元素
     *
     * @param name - 模板名称
     * @param template - HTMLTemplateElement
     */
    register(name: string, template: HTMLTemplateElement): void {
        this.templates.set(name, template);
    }

    /**
     * 获取模板（克隆）
     *
     * 每次获取模板必须克隆，返回独立的 DocumentFragment
     *
     * @param name - 模板名称
     * @returns 克隆的 DocumentFragment
     */
    get(name: string): DocumentFragment | undefined {
        const template = this.templates.get(name);
        if (!template) return undefined;
        return template.content.cloneNode(true) as DocumentFragment;
    }

    /**
     * 替换已有模板
     *
     * @param name - 模板名称
     * @param html - 新的 HTML 字符串
     */
    replace(name: string, html: string): void {
        this.registerHTML(name, html);
    }

    /**
     * 基于基础模板扩展
     *
     * @param baseName - 基础模板名称
     * @param newName - 新模板名称
     * @param operations - 扩展操作列表
     */
    extend(
        baseName: string,
        newName: string,
        operations: Array<{ action: 'prepend' | 'append' | 'replace' | 'insertBefore' | 'insertAfter'; selector?: string; html?: string }>
    ): void {
        const baseTemplate = this.templates.get(baseName);
        if (!baseTemplate) {
            throw new Error(`Template "${baseName}" not found`);
        }

        // 克隆基础模板
        const newTemplate = document.createElement('template');
        newTemplate.innerHTML = baseTemplate.innerHTML;

        // 应用操作
        for (const op of operations) {
            const content = newTemplate.content;
            if (!op.html) continue;

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = op.html;

            switch (op.action) {
                case 'prepend':
                    while (tempDiv.firstChild) {
                        content.insertBefore(tempDiv.firstChild, content.firstChild);
                    }
                    break;
                case 'append':
                    while (tempDiv.firstChild) {
                        content.appendChild(tempDiv.firstChild);
                    }
                    break;
                case 'replace': {
                    const target = op.selector ? content.querySelector(op.selector) : null;
                    if (target && tempDiv.firstChild) {
                        target.parentNode?.replaceChild(tempDiv.firstChild, target);
                    }
                    break;
                }
                case 'insertBefore': {
                    const ref = op.selector ? content.querySelector(op.selector) : null;
                    if (ref && tempDiv.firstChild) {
                        content.insertBefore(tempDiv.firstChild, ref);
                    }
                    break;
                }
                case 'insertAfter': {
                    const ref = op.selector ? content.querySelector(op.selector) : null;
                    if (ref && tempDiv.firstChild) {
                        ref.parentNode?.insertBefore(tempDiv.firstChild, ref.nextSibling);
                    }
                    break;
                }
            }
        }

        this.templates.set(newName, newTemplate);
    }

    /**
     * 检查模板是否存在
     */
    has(name: string): boolean {
        return this.templates.has(name);
    }

    /**
     * 移除模板
     */
    remove(name: string): void {
        this.templates.delete(name);
    }
}
