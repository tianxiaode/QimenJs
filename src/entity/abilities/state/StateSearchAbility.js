"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateSearchAbility = void 0;
const composable_1 = require("../../composable");
const utils_1 = require("@orbitjs/utils");
class StateSearchAbility extends composable_1.AbilityBase {
    expose() {
        const host = this.host;
        if (!host.search || Object.keys(host.search).length === 0) {
            host.search = this.getDefaultSearch();
        }
        return {
            toParams: () => this.toParams(),
            filter: (text) => (host.search.keyword = text),
            searchBy: (search) => (host.search = { ...host.search, ...search }),
            matchKeyword: (item) => this.matchKeyword(item),
            applySort: (list) => this.applySort(list),
            sort: (field, order = 'asc') => ((host.search.sortBy = field),
                (host.search.sortOrder = order)),
        };
    }
    getDefaultSearch() {
        const host = this.host;
        const { schema } = host;
        const parentIdField = schema.parentIdField || 'parentId';
        const search = {
            keyword: '',
            sortBy: schema.defaultSortBy || '',
            order: schema.defaultSortOrder || 'asc',
        };
        if (schema.isRemote && !schema.isTree) {
            search.page = 1;
        }
        if (schema.isTree) {
            search[parentIdField] = null;
            search.depth = 1;
        }
        return search;
    }
    toParams() {
        const host = this.host;
        const { schema } = host;
        const params = {};
        const search = host.search;
        Object.keys(search).forEach(key => {
            const value = search[key];
            // 1. 过滤掉无意义的参数
            if (value === undefined || value === null || value === '') {
                return;
            }
            // 2. 特殊处理：数组通常需要转换为逗号分隔或特定的格式
            if (Array.isArray(value)) {
                params[key] = value.join(',');
                return;
            }
            // 3. 默认赋值
            params[key] = value;
        });
        if (!schema.isTree) {
            params.page = host.page || 1;
            params.pageSize = host.pageSize || 20;
        }
        else {
            params.parentId = params.parentId || host.root || null;
        }
        return params;
    }
    matchKeyword(node) {
        const host = this.host;
        const { schema } = host;
        const searchFields = schema.searchFields || [];
        const keyword = host.search.keyword;
        if (!keyword)
            return false;
        const k = keyword.toLowerCase();
        // 使用 some：只要有一个字段匹配就返回 true
        return searchFields.some(field => {
            const value = node[field];
            return typeof value === 'string' && value.toLowerCase().includes(k);
        });
    }
    applySort(list) {
        const host = this.host;
        // 确保 search 对象已初始化且存在排序字段
        const { sortBy, sortOrder } = host.search || {};
        if (!sortBy || !list || list.length <= 1) {
            return list;
        }
        return utils_1.array.orderBy(list, [
            {
                by: sortBy,
                order: (sortOrder || 'asc'),
            },
        ]);
    }
}
exports.StateSearchAbility = StateSearchAbility;
//# sourceMappingURL=StateSearchAbility.js.map