import { RegistrarBase } from "./RegistrarBase";
/**
 * HTML模板注册器
 * 管理HTML模板字符串的注册和检索
 *
 * 用于存储和管理预定义的HTML模板，
 * 支持按ID快速检索和复用HTML模板内容
 */
export declare class HtmlTemplateRegistrar extends RegistrarBase<Map<string, string>> {
    readonly name: "html";
    protected storage: Map<string, string>;
    /**
     * 注册HTML模板
     *
     * @param id - 模板唯一标识符
     * @param template - HTML模板字符串
     */
    register(id: string, template: string): void;
    /**
     * 注销HTML模板
     * 从存储中删除指定ID的模板
     *
     * @param id - 要删除的模板ID
     */
    unregister(id: string): void;
    /**
     * 获取HTML模板
     *
     * @param id - 模板ID
     * @returns 对应的HTML模板字符串
     */
    get(id: string): string;
    /**
     * 输出HTML模板注册器的状态信息
     * 显示当前存储的所有模板ID和对应的模板内容
     *
     * @protected
     */
    protected doInspect(): void;
}
//# sourceMappingURL=HtmlTemplateRegistrar.d.ts.map