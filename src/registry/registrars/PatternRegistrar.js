"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatternRegistrar = void 0;
const types_1 = require("../types");
const RegistrarBase_1 = require("./RegistrarBase");
const errors_1 = require("./errors");
/**
 * 模式注册器
 * 管理命名正则表达式的注册和检索
 *
 * 用于集中管理应用程序中使用的各种正则表达式模式，
 * 如邮箱验证、手机号验证、URL验证等常用模式
 */
class PatternRegistrar extends RegistrarBase_1.RegistrarBase {
    constructor() {
        super(...arguments);
        this.name = types_1.PatternRegistrarName;
        // 存储，确保编码期和运行期共享
        this.storage = new Map();
    }
    /**
     * 注册模式：
     * 1. 单个: register('email', /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
     * 2. 对象: register({ 'uuid': /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/, 'zip': { regex: '^[0-9]{6}$', flags: 'g' } })
     *
     * @param nameOrObj - 模式名称或包含多个模式的对象
     * @param entry - 正则表达式对象（当第一个参数为模式名称时）
     * @throws RegistrarInvalidArgumentError - 当参数无效时
     */
    register(nameOrObj, entry) {
        this.checkLock();
        if (typeof nameOrObj === 'object' && !(nameOrObj instanceof RegExp)) {
            // 模式 2：批量注册对象
            for (const [name, val] of Object.entries(nameOrObj)) {
                this.doRegister(name, val);
            }
        }
        else if (typeof nameOrObj === 'string') {
            // 模式 1：单个注册
            if (!entry)
                throw new errors_1.RegistrarInvalidArgumentError(this.name, nameOrObj);
            this.doRegister(nameOrObj, entry);
        }
    }
    /**
     * 注销指定名称的模式
     * 从存储中删除指定名称的正则表达式
     *
     * @param name - 要注销的模式名称
     */
    unregister(name) {
        this.checkLock();
        this.storage.delete(name);
    }
    /**
     * 核心逻辑提取：负责将多种输入统一转化为 RegExp 并存入 Map
     *
     * @param name - 模式名称
     * @param entry - 正则表达式对象
     */
    doRegister(name, entry) {
        this.storage.set(name, entry);
    }
    /**
     * 根据名称获取正则表达式
     *
     * @param name - 模式名称
     * @returns 对应的正则表达式对象
     * @throws RegistrarNotFoundError - 当指定名称的模式不存在时
     */
    get(name) {
        const pattern = this.storage.get(name);
        if (!pattern)
            throw new errors_1.RegistrarNotFoundError(this.name, name);
        return pattern;
    }
    /**
     * 输出模式注册器的状态信息
     * 显示当前存储的所有模式名称和对应的正则表达式
     *
     * @protected
     */
    doInspect() {
        console.group('🔍 Registered Patterns');
        const info = {};
        this.storage.forEach((reg, name) => {
            info[name] = {
                source: reg.source,
                flags: reg.flags,
            };
        });
        console.table(info);
        console.groupEnd();
    }
}
exports.PatternRegistrar = PatternRegistrar;
//# sourceMappingURL=PatternRegistrar.js.map