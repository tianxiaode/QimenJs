"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtmlTemplateRegistrar = void 0;
const types_1 = require("../types");
const RegistrarBase_1 = require("./RegistrarBase");
/**
 * HTML模板注册器
 * 管理HTML模板字符串的注册和检索
 *
 * 用于存储和管理预定义的HTML模板，
 * 支持按ID快速检索和复用HTML模板内容
 */
class HtmlTemplateRegistrar extends RegistrarBase_1.RegistrarBase {
    constructor() {
        super(...arguments);
        this.name = types_1.HtmlTemplateRegistrarName; // 简洁的名称
        this.storage = new Map();
    }
    /**
     * 注册HTML模板
     *
     * @param id - 模板唯一标识符
     * @param template - HTML模板字符串
     */
    register(id, template) {
        this.checkLock();
        this.storage.set(id, template);
    }
    /**
     * 注销HTML模板
     * 从存储中删除指定ID的模板
     *
     * @param id - 要删除的模板ID
     */
    unregister(id) {
        this.checkLock();
        this.storage.delete(id);
    }
    /**
     * 获取HTML模板
     *
     * @param id - 模板ID
     * @returns 对应的HTML模板字符串
     */
    get(id) {
        return this.storage.get(id);
    }
    /**
     * 输出HTML模板注册器的状态信息
     * 显示当前存储的所有模板ID和对应的模板内容
     *
     * @protected
     */
    doInspect() {
        // 子类只需要这一行，外壳基类已经穿好了
        console.table(Object.fromEntries(this.storage));
    }
}
exports.HtmlTemplateRegistrar = HtmlTemplateRegistrar;
//# sourceMappingURL=HtmlTemplateRegistrar.js.map