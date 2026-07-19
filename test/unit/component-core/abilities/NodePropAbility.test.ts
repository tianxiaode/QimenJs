jest.mock('@/events', () => ({
    COMPONENT_LIFECYCLE_EVENTS: {
        INIT: 'init',
        MOUNTED: 'mounted',
        BEFORE_UNMOUNT: 'beforeunmount',
        DISPOSE: 'dispose',
        UPDATED: 'updated',
        RESIZE: 'resize',
        HIDDEN_CHANGE: 'hiddenchange',
    },
}));

import { NodePropAbility } from '@/component-core/abilities/NodePropAbility';

describe('NodePropAbility', () => {
    it('提供核心方法', () => {
        expect(typeof NodePropAbility._getNodeProp).toBe('function');
        expect(typeof NodePropAbility._setNodeProp).toBe('function');
        expect(typeof NodePropAbility._updateNode).toBe('function');
        expect(typeof NodePropAbility._markNodeDirty).toBe('function');
        expect(typeof NodePropAbility._flushNodeProps).toBe('function');
    });

    it('_updateNode 应用 cls 属性', () => {
        const el = document.createElement('div');
        const instance = { _resolveNodeEl: () => el, nodeMap: { root: { _state: {} } } };
        NodePropAbility._updateNode.call(instance, 'root', { cls: 'active' });
        expect(el.className).toBe('active');
    });

    it('_updateNode 更新 _state 快照', () => {
        const el = document.createElement('div');
        const node = { _state: {} };
        const instance = { _resolveNodeEl: () => el, nodeMap: { root: node } };
        NodePropAbility._updateNode.call(instance, 'root', { cls: 'test' });
        expect(node._state.cls).toBe('test');
    });

    it('hidden 变化时发送 hiddenchange 事件', () => {
        const el = document.createElement('div');
        const emitSpy = jest.fn();
        const node = { _state: { hidden: false } };
        const instance = {
            _resolveNodeEl: () => el,
            nodeMap: { root: node },
            emit: emitSpy,
            _emitLifecycleEvent: NodePropAbility._emitLifecycleEvent,
        };
        NodePropAbility._updateNode.call(instance, 'root', { hidden: true });
        expect(emitSpy).toHaveBeenCalledWith('hiddenchange', { hidden: true, previous: false });
    });
});
