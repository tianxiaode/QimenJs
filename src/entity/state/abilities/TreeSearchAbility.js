"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeSearchAbility = void 0;
const composable_1 = require("../../../composable");
const utils_1 = require("@orbitjs/utils");
class TreeSearchAbility extends composable_1.AbilityBase {
    expose() {
        return {
            applySearchExpansion: () => this.applySearchExpansion(),
            applySort: (list) => this.applySort(list),
            matchKeyword: (node, keyword) => this.matchKeyword(node, keyword),
        };
    }
    applySearchExpansion() {
        const host = this.host;
        const expandedField = host.expandedField;
        const pidField = host.parentIdField;
        const keyword = host.search.keyword.toLowerCase();
        // 关键：必须按深度降序（从深到浅）
        const sortedNodes = Array.from(host.nodes.values()).sort((a, b) => (b._depth || 0) - (a._depth || 0));
        const parentIdsToExpand = new Set();
        sortedNodes.forEach((node) => {
            const id = node.id;
            const pid = node[pidField];
            // 如果我命中了，或者我的孩子命中了（即我在 Set 里）
            if (this.matchKeyword(node, keyword) || parentIdsToExpand.has(id)) {
                node[expandedField] = true;
                // 向上层传导：把父 ID 加入 Set
                if (pid && pid !== host.root) {
                    parentIdsToExpand.add(pid);
                }
            }
        });
    }
    applySort(list) {
        const host = this.host;
        if (!host.search.sortBy || list.length <= 1)
            return list;
        return utils_1.array.orderBy(list, [
            {
                by: host.search.sortBy,
                order: host.search.order,
            },
        ]);
    }
    matchKeyword(node, keyword) {
        const host = this.host;
        if (!keyword)
            return false;
        const k = keyword.toLowerCase();
        // 使用 some：只要有一个字段匹配就返回 true
        return host.searchFields.some(field => {
            const value = node[field];
            return typeof value === 'string' && value.toLowerCase().includes(k);
        });
    }
}
exports.TreeSearchAbility = TreeSearchAbility;
//# sourceMappingURL=TreeSearchAbility.js.map