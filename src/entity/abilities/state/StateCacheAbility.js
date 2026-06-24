"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateCacheAbility = void 0;
const composable_1 = require("../../composable");
const cache_1 = require("../../cache");
class StateCacheAbility extends composable_1.AbilityBase {
    constructor() {
        super(...arguments);
        this._provider = null;
    }
    expose() {
        return {
            /**
             * 缓存键：Getter 模式
             * 逻辑：如果 schema 定义了名称，则使用 schema 名，否则回退
             */
            cacheKey: { get: () => this.getCacheKey() },
            /**
             * 尝试获取缓存
             */
            tryGetCache: async () => {
                const provider = await this.getProvider();
                return await provider.get(this.getCacheKey());
            },
            /**
             * 设置缓存
             */
            setCache: async (data) => {
                const provider = await this.getProvider();
                await provider.set(this.getCacheKey(), data, this.host.cacheTTL);
            },
            /**
             * 清理缓存
             */
            clearCache: async () => {
                const provider = await this.getProvider();
                await provider.remove(this.getCacheKey());
            },
        };
    }
    getCacheKey() {
        const host = this.host;
        const { schema } = host;
        const domain = schema.domain || 'default';
        // 基础键直接使用 Schema 的名称（比如 'User', 'Project'）
        const base = `${domain}:${schema.name}`;
        // 1. 本地模式：直接返回名称，不需要任何参数后缀
        // 这样下次进入页面，tryGetCache('User') 就能直接拿到全量数据
        if (host.isRemote) {
            return base;
        }
        // 2. 远程模式：需要区分不同的查询结果集
        const params = host.toParams ? host.toParams() : {};
        // 如果没有参数（如首屏默认请求），返回基础名
        if (Object.keys(params).length === 0) {
            return `${base}:root`;
        }
        // 否则根据参数生成摘要，防止 Key 过长
        const queryStr = Object.keys(params)
            .sort()
            .map(key => `${key}=${params[key]}`)
            .join('&');
        return `${base}:q:${this.simpleHash(queryStr)}`;
    }
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = (hash << 5) - hash + str.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash).toString(36);
    }
    async getProvider() {
        var _a;
        const { schema } = this.host;
        if (this._provider)
            return this._provider;
        this._provider = await cache_1.CacheFactory.create(((_a = schema.cache) === null || _a === void 0 ? void 0 : _a.type) || 'memory');
        return this._provider;
    }
    onDispose() {
        var _a;
        if (this._provider) {
            cache_1.CacheFactory.release((_a = this._provider) === null || _a === void 0 ? void 0 : _a.id, true);
        }
        this._provider = null;
    }
}
exports.StateCacheAbility = StateCacheAbility;
//# sourceMappingURL=StateCacheAbility.js.map