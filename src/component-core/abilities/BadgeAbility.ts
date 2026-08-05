/**
 * BadgeAbility — 角标节点操作能力
 *
 * badge 不走浮动引擎，而是在 buildDOM 后由 NodeMapManager 创建绝对定位 DOM，
 * 注册为 `{nodeName}:badge` 节点。BadgeAbility 提供对该节点的便捷操作方法。
 *
 * 每个组件最多一个 badge，方法无需传 nodeName，自动定位唯一的 badge 节点。
 *
 * @example
 * // 模板声明
 * { name: 'icon', badge: '3' }
 * // → 自动生成 'icon:badge' 节点
 *
 * // 运行时操作
 * this.updateBadge('5');      // 更新文本
 * this.showBadge();           // 显示
 * this.hideBadge();           // 隐藏
 * this.toggleBadge();         // 切换显示/隐藏
 */

import type { AbilityDefinition } from '@/composable';

/**
 * 查找组件中唯一的 badge 节点名
 *
 * 遍历 nodeMap，返回以 `:badge` 结尾的节点名。
 * 组件最多一个 badge，找到即返回。
 */
function findBadgeName(self: any): string | undefined {
    const map = self.nodeMapMgr?.getAll();
    if (!map) return undefined;
    for (const name of Object.keys(map)) {
        if (name.endsWith(':badge')) return name;
    }
    return undefined;
}

export const BadgeAbility: AbilityDefinition = {
    /**
     * 更新 badge 文本内容
     *
     * @param text - 新的文本内容
     *
     * @example
     * this.updateBadge('5');
     * this.updateBadge(99);
     */
    updateBadge(text: string | number): void {
        const badgeName = findBadgeName(this);
        if (!badgeName) return;
        const node = this._resolveNodeEl(badgeName);
        if (node) node.textContent = String(text);
    },

    /**
     * 显示 badge
     *
     * @example
     * this.showBadge();
     */
    showBadge(): void {
        const badgeName = findBadgeName(this);
        if (!badgeName) return;
        this.setNodeHidden(false, badgeName);
    },

    /**
     * 隐藏 badge
     *
     * @example
     * this.hideBadge();
     */
    hideBadge(): void {
        const badgeName = findBadgeName(this);
        if (!badgeName) return;
        this.setNodeHidden(true, badgeName);
    },

    /**
     * 切换 badge 显示/隐藏
     *
     * @example
     * this.toggleBadge();
     */
    toggleBadge(): void {
        const badgeName = findBadgeName(this);
        if (!badgeName) return;
        const node = this._resolveNodeEl(badgeName);
        if (node) {
            node.hidden = !node.hidden;
        }
    },
} as AbilityDefinition;
