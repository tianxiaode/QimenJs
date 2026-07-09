import { HtmlTemplateRegistrarName } from '../types';
import { RegistrarBase } from './RegistrarBase';
import { Logger } from '@qimenjs/logger';

/**
 * HTML模板注册器
 * 管理HTML模板字符串的注册和检索
 *
 * 用于存储和管理预定义的HTML模板，
 * 支持按ID快速检索和复用HTML模板内容。
 *
 * 优化：首次 getFragment() 时懒创建 <template> 元素缓存，
 * 后续调用通过 cloneNode(true) 返回 DocumentFragment，
 * 跳过 innerHTML 的 HTML 解析开销。
 */
export class HtmlTemplateRegistrar extends RegistrarBase<Map<string, string>> {
    public readonly name = HtmlTemplateRegistrarName;
    protected storage = new Map<string, string>();
    private logger = Logger.for(HtmlTemplateRegistrar);

    /**
     * 模板元素缓存
     * 首次 getFragment 时按需创建，避免启动时解析所有模板
     */
    private templateCache = new Map<string, HTMLTemplateElement>();

    /**
     * 注册HTML模板
     *
     * @param id - 模板唯一标识符
     * @param template - HTML模板字符串
     */
    register(id: string, template: string): void {
        this.checkLock();
        this.storage.set(id, template);
        // 缓存失效，下次 getFragment 时重新创建
        this.templateCache.delete(id);
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
     * 首次调用时从 storage 中的 HTML 字符串创建 <template> 缓存，
     * 后续调用通过 cloneNode(true) 复制缓存，跳过 HTML 解析。
     *
     * @param id - 模板ID
     * @returns 克隆的 DocumentFragment，模板不存在时返回空 DocumentFragment
     */
    getFragment(id: string): DocumentFragment {
        let tpl = this.templateCache.get(id);
        if (!tpl) {
            const html = this.storage.get(id);
            if (!html) {
                this.logger.warn(`template "${id}" not found`);
                return document.createDocumentFragment();
            }
            tpl = document.createElement('template');
            tpl.innerHTML = html;
            this.templateCache.set(id, tpl);
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
