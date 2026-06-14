"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseEntityManager = void 0;
const errors_1 = require("../errors");
const CoreEntityManager_1 = require("./CoreEntityManager");
class BaseEntityManager extends CoreEntityManager_1.CoreEntityManager {
    async fetch(action, options) {
        this.state.loading = true;
        this.emit(`${action}:loading`, true);
        try {
            const task = this.request(action, options);
            const ctx = await task.context;
            if (ctx.metadata.hasError) {
                const error = ctx.metadata.error;
                this.emit(`${action}:error`, ctx);
                this.logger.error('Fetch failed: ', error);
                throw new errors_1.EntityError(error.message, errors_1.KernelErrorCode.ENTITY_FETCH_FAILED, ctx);
            }
            this.populateResponseData(ctx);
            await this.onAfterFetch(action, ctx);
            this.emit(`${action}:success`, ctx.data);
            this.logger.debug('Fetch success: ', ctx.data);
            return ctx;
        }
        finally {
            this.state.loading = false;
            this.emit(`${action}:loading`, false);
        }
    }
    async buildOptions(action, params = {}, body = null, extra = {}) {
        const schema = this.getSchema();
        const fields = schema.fields || [];
        // 1. 基础结构
        let options = {
            domain: this.domain,
            params: { ...params }, // 浅拷贝一份原始参数
            body: body,
            ...extra,
        };
        // 2. 字段映射加工 (仅针对 Body)
        if (options.body) {
            options.body = Array.isArray(options.body)
                ? options.body.map(item => this.processItem(action, options, item, fields))
                : this.processItem(action, options, options.body, fields);
        }
        return await this.onBeforeFetch(action, options);
    }
    processItem(action, options, data, fields) {
        const result = {};
        fields.forEach(field => {
            if (typeof field.mapping === 'function')
                return;
            const value = data[field.name];
            const processedValue = this.onPrepareField(field, value, data, action, options);
            const targetKey = typeof field.mapping === 'string' ? field.mapping : field.name;
            if (processedValue !== undefined) {
                result[targetKey] = processedValue;
            }
        });
        // 保留原数据中不在 schema 里的部分（如隐藏 ID），同时覆盖 schema 定义的转换结果
        return { ...data, ...result };
    }
    onPrepareField(field, value, rawData, action, options) {
        return value;
    }
    async onBeforeFetch(action, options) {
        this.logger.debug('onBeforeFetch', action, options);
        return options;
    }
    populateResponseData(context) {
        const fields = this.getSchema().fields || [];
        if (context.data.list) {
            context.data.list = context.data.list.map(item => this.processEntity(context, item, fields));
        }
        if (context.data.item) {
            context.data.item = this.processEntity(context, context.data.item, fields);
        }
    }
    processEntity(context, entity, fields = []) {
        if (!entity)
            return entity;
        fields.forEach(field => {
            if (!field.mapping)
                return;
            // 情况 A：字符串映射 -> 别名对齐
            if (typeof field.mapping === 'string') {
                if (field.mapping in entity && field.mapping !== field.name) {
                    entity[field.name] = entity[field.mapping];
                }
            }
            // 情况 B：函数映射 -> 计算属性注入
            else if (typeof field.mapping === 'function') {
                // 传入整个实体，由函数计算出该字段的值
                entity[field.name] = field.mapping(entity);
            }
        });
        // 依然保留手动增强钩子
        return this.onPopulateEntity(context, entity);
    }
    onPopulateEntity(context, entity) {
        return entity;
    }
    async onAfterFetch(action, context) {
        this.logger.debug('onAfterFetch', action, context);
    }
    dispose() {
        var _a;
        // 1. 先处理当前类的资源
        // 释放状态机，清理 state 内部的缓存或监听
        this.state.dispose();
        this.state = null;
        // 2. 如果你有 Ability 系统，应该在这里释放它们
        // 因为 Abilities 是挂载在当前 host 上的
        (_a = this.disposeAbilities) === null || _a === void 0 ? void 0 : _a.call(this);
        // 3. 最后调用父类的销毁
        // CoreEntityManager 可能负责切断网络连接、销毁全局事件监听等
        super.dispose();
    }
}
exports.BaseEntityManager = BaseEntityManager;
//# sourceMappingURL=BaseEntityManager.js.map