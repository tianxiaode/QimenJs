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

/** 角标节点操作能力，提供 badge 文本更新、显示/隐藏与切换 */
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

    /**
     * 构建 badge 浮层节点
     *
     * 遍历 nodeMetas 中声明了 badge 的节点，为每个节点创建绝对定位的 badge DOM 元素，
     * 挂载到锚点元素的父容器上，并注册进 nodeMap。
     *
     * badge 节点名格式为 `{anchorName}:badge`，可通过 CommonPropsAbility 操作：
     *   this.setNodeHidden(true, 'icon:badge')
     *   this.addCls('q-badge--dot', 'icon:badge')
     *
     * @remarks
     * - 仅在 buildDOM() 内部调用，在 _buildNodeMap 之后
     * - badge 元素使用绝对定位，不影响文档流和 indexPath
     * - 锚点元素需要 position: relative 才能正确定位
     */
    // _buildBadgeOverlays(): void {
    //     const mgr = this.nodeMapMgr;
    //     const metas = mgr.getMetas();
    //     for (const [name, meta] of Object.entries(metas)) {
    //         if (meta.badge == null) continue;

    //         const anchorNode = this._map[name];
    //         if (!anchorNode?.el) continue;

    //         const cfg: BadgeQuickConfig =
    //             typeof meta.badge === 'string' || typeof meta.badge === 'number'
    //                 ? { text: String(meta.badge) }
    //                 : meta.badge;

    //         const badgeEl = document.createElement('span');
    //         badgeEl.className = 'q-badge';
    //         badgeEl.style.position = 'absolute';
    //         badgeEl.style.top = '0';
    //         badgeEl.style.right = '0';
    //         badgeEl.style.transform = 'translate(50%, -50%)';

    //         if (cfg.text != null) {
    //             badgeEl.textContent = String(cfg.text);
    //         }

    //         if (cfg.visible === false) {
    //             badgeEl.style.display = 'none';
    //         }

    //         const anchorEl = anchorNode.el as HTMLElement;
    //         if (!anchorEl.style.position || anchorEl.style.position === 'static') {
    //             anchorEl.style.position = 'relative';
    //         }

    //         anchorEl.appendChild(badgeEl);

    //         const badgeName = `${name}:badge`;
    //         this._map[badgeName] = { name: badgeName, tag: 'span', el: badgeEl };
    //     }
    // },
} as AbilityDefinition;
