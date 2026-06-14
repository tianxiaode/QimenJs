"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeManagerAbility = void 0;
const composable_1 = require("../../../composable");
class TreeManagerAbility extends composable_1.DebounceAbilityBase {
    expose() {
        const state = this.host.state;
        return {
            // 基础操作
            expand: (id) => this.expand(id),
            collapse: (id) => this.setExpandState(id, false),
            // 结构操作
            move: (id, targetPid) => this.host.moveNode(id, targetPid),
            // 数据获取与同步
            refresh: (pid) => this.refreshChildren(pid),
            getSubTree: (pid) => this.host.state.getChildren(pid),
            isDirty: (currentItem) => state.isDirty(currentItem),
            edit: (item) => state.edit(item),
            roolback: () => state.rollback(),
        };
    }
    /**
     * 设置展开/折叠状态
     */
    setExpandState(id, expanded) {
        const host = this.host;
        const state = host.state;
        state.toggleExpand(id, expanded);
        state.refreshView();
    }
    async expand(id) {
        const host = this.host;
        const state = host.state;
        // 1. 核心判断：是否已经加载过子节点？
        // 注意：即使 node.leaf 是 true，如果业务允许它动态变目录，
        // 我们也可以在这里只根据 isLoaded 判断。
        if (!state.isLoaded(id)) {
            await this.refreshChildren(id);
            state.toggleExpand(id, true);
        }
        else {
            state.toggleExpand(id, true);
            state.refreshView();
        }
    }
    /**
     * 核心方法：刷新子节点
     * 替代了之前在 fetch 里的 updater 回调逻辑
     */
    async refreshChildren(pid) {
        const host = this.host;
        const state = host.state;
        // 1. 远程获取（fetch 内部已移除了 updater，职责更清爽）
        const options = await host.buildOptions('list', { [host.parentIdField]: pid }, null, {});
        const context = await host.fetch('list', options);
        state.syncChildren(pid, context.data.list);
        // 3. 覆盖写入与路径重算
        state.updateData(context.data.list);
        if (pid !== null) {
            host.setLoaded(pid, true);
        }
        state.refreshView();
    }
    async moveNode(id, targetPid) {
        const host = this.host;
        const state = host.state;
        const parentIdField = host.parentIdField;
        const options = await host.buildOptions('update', { [state.idField]: id }, { [parentIdField]: targetPid }, {});
        const context = await host.fetch('update', options);
        state.moveNode(id, targetPid);
        state.refreshView();
    }
}
exports.TreeManagerAbility = TreeManagerAbility;
//# sourceMappingURL=TreeManagerAbility.js.map