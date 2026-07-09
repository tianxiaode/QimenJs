import { HtmlTemplateRegistrarName } from '../types';
import { RegistrarBase } from './RegistrarBase';

/**
 * HTML模板注册器
 * 管理HTML模板字符串的注册和检索
 *
 * 用于存储和管理预定义的HTML模板，
 * 支持按ID快速检索和复用HTML模板内容。
 *
 * 优化：register 时预创建 <template> 元素缓存，
 * getFragment() 通过 cloneNode(true) 返回 DocumentFragment，
 * 跳过 innerHTML 的 HTML 解析开销。
 */
export class HtmlTemplateRegistrar extends RegistrarBase<Map<string, string>> {
    public readonly name = HtmlTemplateRegistrarName;
    protected storage = new Map<string, string>();

    /**
     * 模板元素缓存
     * register 时同步创建，避免 getFragment 时重复解析 HTML
     */
    private templateCache = new Map<string, HTMLTemplateElement>();

    /**
     * 注册HTML模板
     *
     * 同时预创建 <template> 元素缓存，供 getFragment 使用。
     *
     * @param id - 模板唯一标识符
     * @param template - HTML模板字符串
     */
    register(id: string, template: string): void {
        this.checkLock();
        this.storage.set(id, template);

        const tpl = document.createElement('template');
        tpl.innerHTML = template;
        this.templateCache.set(id, tpl);
    }

    /**
     * 注销HTML模板
     * 从存储和缓存中删除指定ID的模板
     *
     * @param id - 要删除的模板ID
     */
    unregister(id: string): void {
        this.checkLock();
        this.storage.delete(id);
        this.templateCache.delete(id);
    }

    /**
     * 获取HTML模板字符串
     *
     * @param id - 模板ID
     * @returns 对应的HTML模板字符串
     */
    get(id: string): string {
        return this.storage.get(id)!;
    }

    /**
     * 获取克隆的 DocumentFragment
     *
     * 通过 cloneNode(true) 复制缓存的 <template>.content，
     * 跳过 innerHTML 的 HTML 解析，性能优于 get() + innerHTML。
     *
     * @param id - 模板ID
     * @returns 克隆的 DocumentFragment
     * @throws 模板不存在时抛出错误
     */
    getFragment(id: string): DocumentFragment {
        const tpl = this.templateCache.get(id);
        if (!tpl) {
            throw new Error(`[HtmlTemplateRegistrar] template "${id}" not found`);
        }
        return tpl.content.cloneNode(true) as DocumentFragment;
    }

    /**
     * 清空所有已注册的模板和缓存
     */
    override clear(): void {
        this.checkLock();
        this.storage.clear();
        this.templateCache.clear();
    }

    /**
     * 输出HTML模板注册器的状态信息
     * 显示当前存储的所有模板ID和对应的模板内容
     *
     * @protected
     */
    protected doInspect(): void {
        console.table(Object.fromEntries(this.storage));
    }
}
