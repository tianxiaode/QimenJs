"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeRemoteEntityState = void 0;
const logger_1 = require("@orbitjs/logger");
const abilities_1 = require("./abilities");
const RemoteEntityState_1 = require("./RemoteEntityState");
const TreeViewAbility_1 = require("./abilities/TreeViewAbility");
class TreeRemoteEntityState extends RemoteEntityState_1.RemoteEntityState {
    constructor(schema, cacheProvider, cacheTTL = 300000) {
        super(schema, cacheProvider, cacheTTL);
        this.nodes = new Map();
        this.hierarchy = new Map();
        this.logger = null;
        this.items = [];
        this.logger = logger_1.Logger.for(`${this.schema.name}.TreeRemoteEntityState`);
        new abilities_1.TreePathAbility().attach(this);
        new abilities_1.TreeLifecycleAbility().attach(this);
        new abilities_1.TreeSearchAbility().attach(this);
        new TreeViewAbility_1.TreeViewAbility().attach(this);
    }
    toParams() {
        const base = super.toParams();
        // 如果 parentId 为空，后端可能需要传 0 或者特殊的 ID
        if (!base.parentId) {
            base.parentId = this.root;
        }
        return base;
    }
    async updateData(data) {
        this.syncDataAndState(data);
        // 树模型下，items 已经是实时 walk 出来的，所以缓存 items 即可
        //await this.setCache(this.items);
    }
    async updateItem(item) {
        this.syncDataAndState(item);
        await super.updateItem(item);
        this.refreshView();
    }
    async delete(id) {
        const ids = Array.isArray(id) ? id : [id];
        ids.forEach(id => {
            this.removeNode(id);
        });
    }
    isLoaded(id) {
        const node = this.nodes.get(id);
        if (!node)
            return false;
        // 如果不是懒加载模式，默认就是已加载
        if (!this.isLazy)
            return true;
        return !!node._loaded;
    }
    setLoaded(id, loaded = true) {
        const node = this.nodes.get(id);
        if (node) {
            node._loaded = loaded;
        }
    }
    getCacheKey() {
        const params = this.toParams();
        // 将所有参数按 key 排序后序列化，确保缓存键的唯一性和稳定性
        const queryStr = Object.keys(params)
            .sort()
            .map(key => `${key}=${params[key]}`)
            .join('&');
        return `${this.schema.name}:${queryStr}`;
    }
    reset() {
        this.item = null;
        this.loading = false;
        this.snapshot = null;
        this.nodes.clear();
        this.hierarchy.clear();
        this.search = this.getDefaultSearch();
    }
    getDefaultSearch() {
        return {
            parentId: null,
            depth: 1,
            keyword: '',
            sortBy: this.schema.defaultSort || '',
            order: this.schema.defaultOrder || 'asc',
        };
    }
    syncDataAndState(data) {
        this.ingest(data);
        if (this.search.keyword) {
            this.applySearchExpansion();
        }
    }
    dispose() {
        this.reset();
        super.dispose();
    }
}
exports.TreeRemoteEntityState = TreeRemoteEntityState;
//# sourceMappingURL=TreeRemoteEntityState.js.map