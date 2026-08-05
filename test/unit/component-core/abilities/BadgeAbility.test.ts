/**
 * BadgeAbility 单元测试
 * 目标覆盖率：80%+
 */

import { BadgeAbility } from '@/component-core/abilities/BadgeAbility';
import type { NodeMetadata } from '@/component-core/types/compiled-types';

function createMockInstance(badgeName?: string) {
    const map: Record<string, NodeMetadata> = {};
    if (badgeName) {
        const badgeEl = document.createElement('span');
        badgeEl.textContent = '3';
        badgeEl.hidden = false;
        map[badgeName] = { name: badgeName, tag: 'span', el: badgeEl };
    }

    const instance: any = {
        nodeMapMgr: {
            getAll: () => map,
        },
        _resolveNodeEl: jest.fn((name: string) => map[name]?.el),
        setNodeHidden: jest.fn((hidden: boolean, name: string) => {
            const node = map[name];
            if (node?.el) node.el.hidden = hidden;
        }),
    };

    return instance;
}

describe('BadgeAbility', () => {
    // ══════════════════════════════════════════════════════════════
    // updateBadge
    // ══════════════════════════════════════════════════════════════

    describe('updateBadge', () => {
        it('应更新 badge 文本内容', () => {
            const instance = createMockInstance('icon:badge');

            BadgeAbility.updateBadge.call(instance, '5');

            expect(instance._resolveNodeEl).toHaveBeenCalledWith('icon:badge');
            const el = instance.nodeMapMgr.getAll()['icon:badge'].el;
            expect(el.textContent).toBe('5');
        });

        it('应支持数字类型文本', () => {
            const instance = createMockInstance('icon:badge');

            BadgeAbility.updateBadge.call(instance, 99);

            const el = instance.nodeMapMgr.getAll()['icon:badge'].el;
            expect(el.textContent).toBe('99');
        });

        it('无 badge 节点时应静默返回', () => {
            const instance = createMockInstance();

            expect(() => BadgeAbility.updateBadge.call(instance, '5')).not.toThrow();
        });

        it('无 nodeMapMgr 时应静默返回', () => {
            const instance = { nodeMapMgr: null };

            expect(() => BadgeAbility.updateBadge.call(instance, '5')).not.toThrow();
        });
    });

    // ══════════════════════════════════════════════════════════════
    // showBadge
    // ══════════════════════════════════════════════════════════════

    describe('showBadge', () => {
        it('应调用 setNodeHidden(false)', () => {
            const instance = createMockInstance('icon:badge');

            BadgeAbility.showBadge.call(instance);

            expect(instance.setNodeHidden).toHaveBeenCalledWith(false, 'icon:badge');
        });

        it('无 badge 节点时应静默返回', () => {
            const instance = createMockInstance();

            expect(() => BadgeAbility.showBadge.call(instance)).not.toThrow();
            expect(instance.setNodeHidden).not.toHaveBeenCalled();
        });
    });

    // ══════════════════════════════════════════════════════════════
    // hideBadge
    // ══════════════════════════════════════════════════════════════

    describe('hideBadge', () => {
        it('应调用 setNodeHidden(true)', () => {
            const instance = createMockInstance('icon:badge');

            BadgeAbility.hideBadge.call(instance);

            expect(instance.setNodeHidden).toHaveBeenCalledWith(true, 'icon:badge');
        });

        it('无 badge 节点时应静默返回', () => {
            const instance = createMockInstance();

            expect(() => BadgeAbility.hideBadge.call(instance)).not.toThrow();
            expect(instance.setNodeHidden).not.toHaveBeenCalled();
        });
    });

    // ══════════════════════════════════════════════════════════════
    // toggleBadge
    // ══════════════════════════════════════════════════════════════

    describe('toggleBadge', () => {
        it('应切换 badge 显示状态', () => {
            const instance = createMockInstance('icon:badge');
            const el = instance.nodeMapMgr.getAll()['icon:badge'].el;
            el.hidden = false;

            BadgeAbility.toggleBadge.call(instance);

            expect(el.hidden).toBe(true);

            BadgeAbility.toggleBadge.call(instance);

            expect(el.hidden).toBe(false);
        });

        it('无 badge 节点时应静默返回', () => {
            const instance = createMockInstance();

            expect(() => BadgeAbility.toggleBadge.call(instance)).not.toThrow();
        });
    });

    // ══════════════════════════════════════════════════════════════
    // findBadgeName 辅助函数
    // ══════════════════════════════════════════════════════════════

    describe('findBadgeName', () => {
        it('应找到唯一的 :badge 节点', () => {
            const instance = createMockInstance('icon:badge');
            BadgeAbility.updateBadge.call(instance, 'test');

            expect(instance._resolveNodeEl).toHaveBeenCalledWith('icon:badge');
        });

        it('root:badge 也应被找到', () => {
            const instance = createMockInstance('root:badge');
            BadgeAbility.showBadge.call(instance);

            expect(instance.setNodeHidden).toHaveBeenCalledWith(false, 'root:badge');
        });

        it('空 nodeMap 时不应抛错', () => {
            const instance = { nodeMapMgr: { getAll: () => ({}) } };

            expect(() => BadgeAbility.updateBadge.call(instance, '5')).not.toThrow();
        });
    });
});
