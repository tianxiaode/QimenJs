"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlatRemoteEntityState = void 0;
const RemoteEntityState_1 = require("./RemoteEntityState");
class FlatRemoteEntityState extends RemoteEntityState_1.RemoteEntityState {
    constructor(schema, cacheProvider, chcheTTL = 300000, pageSize, pageSizes) {
        super(schema, cacheProvider, chcheTTL);
        this.items = [];
        this.total = 0;
        this.pages = 0;
        this.pageSizes = pageSizes || [10, 20, 50, 100];
        const initialPageSize = pageSize || this.pageSizes[0];
        this.search = this.getDefaultSearch(initialPageSize);
    }
    get page() {
        return this.search.page;
    }
    set page(page) {
        this.search.page = page;
    }
    get pageSize() {
        return this.search.pageSize;
    }
    set pageSize(pageSize) {
        this.search.pageSize = pageSize;
    }
    get sortBy() {
        return this.search.sortBy;
    }
    set sortBy(sortBy) {
        this.search.sortBy = sortBy;
    }
    get order() {
        return this.search.sortOrder;
    }
    set order(order) {
        this.search.sortOrder = order;
    }
    get filterBy() {
        return this.search.keyword;
    }
    set filterBy(filterBy) {
        this.search.keyword = filterBy;
    }
    get searchBy() {
        const result = { ...this.search };
        delete result.page;
        delete result.pageSize;
        delete result.sortBy;
        delete result.sortOrder;
        delete result.keyword;
        return result;
    }
    set searchBy(searchBy) {
        const oldOrderBy = this.sortBy;
        const oldOrder = this.order;
        const keyword = this.filterBy;
        this.search = {
            ...this.getDefaultSearch(this.pageSize),
            order: oldOrder,
            sortBy: oldOrderBy,
            keyword,
            ...searchBy,
        };
    }
    isValidPage(page) {
        return page >= 1 && (this.pages === 0 || page <= this.pages);
    }
    isValidPageSize(pageSize) {
        return this.pageSizes.includes(pageSize);
    }
    toParams() {
        const base = super.toParams();
        return {
            ...base,
            page: this.page || 1,
            limit: this.pageSize || 20,
        };
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
    async updateData(items, total) {
        this.items = items;
        this.total = total;
        this.pages = Math.ceil(total / this.pageSize);
        await this.setCache(items);
    }
    async updateItem(item) {
        const idField = this.idField;
        const index = this.items.findIndex(i => i[idField] === item[idField]);
        if (index >= 0) {
            // 使用解构赋值确保响应式触发
            const newItems = [...this.items];
            newItems[index] = item;
            this.items = newItems;
        }
        await super.updateItem(item);
    }
    async delete(id) {
        const idField = this.idField;
        const ids = Array.isArray(id) ? id : [id];
        const newItems = this.items.filter(item => !ids.includes(item[idField]));
        this.items = newItems;
        this.total = this.total - ids.length;
    }
    reset() {
        this.item = null;
        this.snapshot = null;
        this.items = [];
        this.total = 0;
        this.search = this.getDefaultSearch(this.pageSize);
    }
    getDefaultSearch(customPageSize) {
        return {
            page: 1,
            pageSize: customPageSize || this.pageSizes[0],
            keyword: '',
            sortBy: this.schema.defaultSort || '',
            order: this.schema.defaultOrder || 'asc',
        };
    }
    dispose() {
        this.reset();
        this.items = [];
        this.pageSizes = [];
        super.dispose();
    }
}
exports.FlatRemoteEntityState = FlatRemoteEntityState;
//# sourceMappingURL=FlatRemoteEntityState.js.map