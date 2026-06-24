"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryProvider = void 0;
const BaseCacheProvider_1 = require("./BaseCacheProvider");
class MemoryProvider extends BaseCacheProvider_1.BaseCacheProvider {
    constructor() {
        super();
        this.storage = new Map();
        this.type = 'memory';
    }
    async rawGet(key) {
        return this.storage.get(key) || null;
    }
    async rawSet(key, entry) {
        this.storage.set(key, entry);
    }
    async has(key) {
        return this.storage.has(this.resolveKey(key));
    }
    async remove(key) {
        this.storage.delete(this.resolveKey(key));
    }
    async clear() {
        this.storage.clear();
    }
}
exports.MemoryProvider = MemoryProvider;
//# sourceMappingURL=MemoryProvider.js.map