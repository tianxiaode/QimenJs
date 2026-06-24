"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheFactory = void 0;
const logger_1 = require("@orbitjs/logger");
const MemoryProvider_1 = require("./MemoryProvider");
class CacheFactory {
    static async create(type, _offline = false) {
        const logger = logger_1.Logger.for('CacheFactory');
        logger.debug('Creating cache provider', type);
        let provider = new MemoryProvider_1.MemoryProvider();
        this._instances.set(provider.id, provider);
        return provider;
    }
    static release(id, autoClear = false) {
        const provider = this._instances.get(id);
        if (!provider)
            return;
        if (autoClear) {
            provider.clear(); // 执行物理清理（如清空内存 Map）
        }
        // 销毁实例引用，让 GC 回收
        this._instances.delete(id);
    }
}
exports.CacheFactory = CacheFactory;
CacheFactory._instances = new Map();
//# sourceMappingURL=CacheFactory.js.map