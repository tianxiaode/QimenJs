"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MimeTypeRegistrar = void 0;
const RegistrarBase_1 = require("./RegistrarBase");
const types_1 = require("../types");
const errors_1 = require("./errors");
/**
 * MIME类型注册器
 * 管理文件扩展名与MIME类型之间的映射关系
 *
 * 支持正向和反向查找，可以：
 * 1. 根据文件扩展名查找对应的MIME类型
 * 2. 根据MIME类型查找对应的文件扩展名
 *
 * 适用于文件上传下载、内容类型识别等场景
 */
class MimeTypeRegistrar extends RegistrarBase_1.RegistrarBase {
    constructor() {
        super(...arguments);
        this.name = types_1.MimeTypeRegistrarName;
        /**
         * 存储扩展名到MIME类型的映射
         * 使用Map结构实现高效的键值对存储和检索
         * @protected
         */
        this.storage = new Map();
        /**
         * 反向映射：MIME类型到扩展名列表
         * 用于根据MIME类型查找对应的扩展名
         * 保证正向和反向映射的一致性
         */
        this.reverseStorage = new Map();
    }
    /**
     * 注册MIME类型映射
     * 支持两种注册模式：
     * 1. 单个注册: register('jpg', 'image/jpeg') 或 register('js', ['text/javascript', 'application/javascript'])
     * 2. 对象批量注册: register({ 'jpg': 'image/jpeg', 'png': 'image/png' })
     *
     * @param extOrObj - 扩展名或包含多个扩展名-MIME类型的对象
     * @param mimes - MIME类型或MIME类型数组（当第一个参数为扩展名时）
     * @throws RegistrarInvalidArgumentError - 当参数无效时
     */
    register(extOrObj, mimes) {
        this.checkLock();
        if (typeof extOrObj === 'object' && extOrObj !== null) {
            // 模式 2：对象批量注册
            for (const [ext, val] of Object.entries(extOrObj)) {
                this.doRegister(ext, val);
            }
        }
        else if (typeof extOrObj === 'string') {
            // 模式 1：单个注册
            if (mimes === undefined)
                throw new errors_1.RegistrarInvalidArgumentError(this.name, extOrObj);
            this.doRegister(extOrObj, mimes);
        }
    }
    /**
     * 内部私有方法，执行实际的注册操作
     * 同时更新正向和反向映射
     *
     * @param ext - 文件扩展名（不需要带点号）
     * @param mimes - MIME类型或MIME类型数组
     * @private
     */
    doRegister(ext, mimes) {
        const cleanExt = ext.startsWith('.') ? ext.slice(1) : ext;
        const mimeSet = this.storage.get(cleanExt) || new Set();
        const newMimes = Array.isArray(mimes) ? mimes : [mimes];
        // 更新正向映射
        newMimes.forEach(m => mimeSet.add(m));
        this.storage.set(cleanExt, mimeSet);
        // 更新反向映射
        newMimes.forEach(mime => {
            if (!this.reverseStorage.has(mime)) {
                this.reverseStorage.set(mime, new Set());
            }
            this.reverseStorage.get(mime).add(cleanExt);
        });
    }
    /**
     * 注销指定扩展名的MIME类型映射
     * 同时清理正向和反向映射中的相关条目
     *
     * @param ext - 要注销的扩展名
     */
    unregister(ext) {
        this.checkLock();
        const cleanExt = ext.startsWith('.') ? ext.slice(1) : ext;
        // 如果存在，则从反向映射中删除
        const existingMimes = this.storage.get(cleanExt);
        if (existingMimes) {
            for (const mime of existingMimes) {
                const exts = this.reverseStorage.get(mime);
                if (exts) {
                    exts.delete(cleanExt);
                    if (exts.size === 0) {
                        this.reverseStorage.delete(mime);
                    }
                }
            }
        }
        this.storage.delete(cleanExt);
    }
    get(query) {
        if (Array.isArray(query)) {
            const result = new Set();
            query.forEach(ext => {
                var _a;
                const cleanExt = ext.startsWith('.') ? ext.slice(1) : ext;
                (_a = this.storage.get(cleanExt)) === null || _a === void 0 ? void 0 : _a.forEach(m => result.add(m));
            });
            return result;
        }
        const cleanExt = query.startsWith('.') ? query.slice(1) : query;
        return Array.from(this.storage.get(cleanExt) || []);
    }
    /**
     * 根据 MIME 类型获取对应的扩展名
     * 返回找到的第一个扩展名
     *
     * @param mime - MIME类型字符串
     * @returns 匹配的扩展名，如果没有匹配项则返回空字符串
     */
    getByMime(mime) {
        const extSet = this.reverseStorage.get(mime);
        const extArray = Array.from(extSet || []);
        return extArray.length > 0 ? extArray[0] : '';
    }
    /**
     * 输出MIME类型注册器的状态信息
     * 显示当前存储的所有扩展名与MIME类型的映射关系
     *
     * @protected
     */
    doInspect() {
        console.group('📁 MIME Type Registry Status');
        const summary = {};
        this.storage.forEach((mimes, ext) => {
            summary[ext] = Array.from(mimes).join(', ');
        });
        console.table(summary);
        console.groupEnd();
    }
}
exports.MimeTypeRegistrar = MimeTypeRegistrar;
//# sourceMappingURL=MimeTypeRegistrar.js.map