"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaRegistrar = exports.SchemaRegistrarName = void 0;
const registry_1 = require("@/registry"); // 更新导入语句为 '@/registry'
const errors_1 = require("../errors");
/**
 * SchemaRegistrar 名称常量
 */
exports.SchemaRegistrarName = 'schema';
/**
 * SchemaRegistrar 类用于管理模式和字段定义的注册与检索
 * 提供了灵活的注册方式，支持实体模式和字段组的注册
 *
 * 设计特点：
 * - 支持两种不同的注册模式：实体模式和字段组模式
 * - 使用两个独立的存储来分别管理实体模式和字段定义
 * - 提供统一的API来访问不同类型的数据
 */
class SchemaRegistrar extends registry_1.RegistrarBase {
    constructor() {
        super(...arguments);
        this.name = exports.SchemaRegistrarName;
        // 内部划分两个私有仓库
        /**
         * 实体模式存储，用于存储实体模式定义
         * key: 实体名称
         * value: RegistrSchema对象
         */
        this.schemaStorage = new Map();
        /**
         * 字段定义存储，用于存储字段组定义
         * key: 字段组名称
         * value: FieldDefinition数组
         */
        this.fieldStorage = new Map();
        // 必须实现基类的 storage（可以指向主仓库或仅作为占位）
        this.storage = this.schemaStorage;
    }
    /**
     * 统一注册入口的实际实现
     * 根据参数类型决定是注册字段组还是实体模式
     * @param arg1 参数1，可能是字符串（字段组名称）或RegistrSchema（实体模式）
     * @param arg2 参数2（可选），当arg1是字符串时提供字段定义数组
     */
    register(arg1, arg2) {
        this.checkLock();
        if (typeof arg1 === 'string' && Array.isArray(arg2)) {
            // 注册字段组
            this.fieldStorage.set(arg1, arg2);
        }
        else {
            // 注册实体模式
            const entry = arg1;
            this.schemaStorage.set(entry.name, entry);
        }
    }
    /**
     * 删除注册项
     * 从两个存储中都尝试删除，确保完全移除
     * @param id 要删除的注册项ID
     */
    unregister(id) {
        this.checkLock();
        this.schemaStorage.delete(id);
        this.fieldStorage.delete(id);
    }
    /**
     * 获取指定名称的注册项
     * @param name 要获取的项的名称
     * @param type 获取类型（schema 或 field），默认为 schema
     * @returns 对应的注册项
     */
    get(name, type = 'schema') {
        if (type === 'field') {
            const fieldDef = this.fieldStorage.get(name);
            if (!fieldDef) {
                throw new errors_1.SchemaRegistrarError(`Field template with name "${name}" not found.`, errors_1.KernelErrorCode.SCHEMA_NOT_FOUND, { fieldName: name, type: 'field' });
            }
            return fieldDef;
        }
        const entry = this.schemaStorage.get(name);
        if (!entry) {
            throw new errors_1.SchemaRegistrarError(`Schema with name "${name}" not found.`, errors_1.KernelErrorCode.SCHEMA_NOT_FOUND, { schemaName: name, type: 'schema' });
        }
        return entry;
    }
    /**
     * 专门获取字段的快捷接口
     * @param groupName 字段组名称
     * @returns 对应的字段定义数组
     */
    getField(groupName) {
        return this.get(groupName, 'field');
    }
    /**
     * 清空所有注册项
     * 同时清空实体模式存储和字段定义存储
     */
    clear() {
        this.checkLock();
        this.schemaStorage.clear();
        this.fieldStorage.clear();
    }
    /**
     * 输出内部状态
     * 用于调试目的，显示当前注册的所有字段组和实体
     */
    doInspect() {
        console.log('%c--- Field Templates ---', 'color: #4CAF50; font-weight: bold');
        console.table(Object.fromEntries(this.fieldStorage));
        console.log('%c--- Business Entities ---', 'color: #2196F3; font-weight: bold');
        console.table(Array.from(this.schemaStorage.values()));
    }
}
exports.SchemaRegistrar = SchemaRegistrar;
//# sourceMappingURL=SchemaRegistrar.js.map