"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseCacheProvider = void 0;
const utils_1 = require("@orbitjs/utils");
class BaseCacheProvider {
    constructor() {
        this.id = '';
        this.type = '';
        this.id = utils_1.string.getId(this.type + '-cache');
    }
    /**
     * 统一的获取逻辑（含过期检查）
     */
    async get(key) {
        const fullKey = this.resolveKey(key);
        const entry = await this.rawGet(fullKey);
        if (!entry)
            return null;
        // 检查是否过期
        if (entry.ttl > 0 && Date.now() - entry.timestamp > entry.ttl) {
            await this.remove(key);
            return null;
        }
        return entry.data;
    }
    /**
     * 统一的存储逻辑
     */
    async set(key, data, ttl = 0) {
        const fullKey = this.resolveKey(key);
        const entry = {
            data,
            timestamp: Date.now(),
            ttl,
        };
        await this.rawSet(fullKey, entry);
    }
    resolveKey(key) {
        return `${this.type}-cache:${String(key)}`;
    }
}
exports.BaseCacheProvider = BaseCacheProvider;
//# sourceMappingURL=BaseCacheProvider.js.map