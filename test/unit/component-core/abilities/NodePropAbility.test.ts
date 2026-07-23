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
import { LifecycleAbility } from '@/component-core/abilities/LifecycleAbility';

describe('NodePropAbility', () => {
    it('提供核心方法', () => {
        expect(typeof NodePropAbility._getNodeProp).toBe('function');
        expect(typeof NodePropAbility._setNodeProp).toBe('function');
        expect(typeof NodePropAbility._updateNode).toBe('function');
        expect(typeof NodePropAbility._markNodeDirty).toBe('function');
        expect(typeof NodePropAbility._flushNodeProps).toBe('function');
        expect(typeof NodePropAbility._resolveNodeEl).toBe('function');
        expect(typeof NodePropAbility._resolveNodeTarget).toBe('function');
    });

    it('_updateNode 应用 cls 属性', () => {
        const el = document.createElement('div');
        const instance = {
            _resolveNodeTarget: () => ({ el, component: undefined }),
            nodeMap: { root: { _state: {} } },
        };
        NodePropAbility._updateNode.call(instance, 'root', { cls: 'active' });
        expect(el.className).toBe('active');
    });

    it('_updateNode 更新 _state 快照', () => {
        const el = document.createElement('div');
        const node = { _state: {} as Record<string, any> };
        const instance = {
            _resolveNodeTarget: () => ({ el, component: undefined }),
            nodeMap: { root: node },
        };
        NodePropAbility._updateNode.call(instance, 'root', { cls: 'test' });
        expect(node._state.cls).toBe('test');
    });

    it('hidden 变化时发送 hiddenchange 事件', () => {
        const el = document.createElement('div');
        const emitSpy = jest.fn();
        const node = { _state: { hidden: false } as Record<string, any> };
        const instance = {
            _resolveNodeTarget: () => ({ el, component: undefined }),
            nodeMap: { root: node },
            emit: emitSpy,
            _emitLifecycleEvent: LifecycleAbility._emitLifecycleEvent,
        };
        NodePropAbility._updateNode.call(instance, 'root', { hidden: true });
        expect(emitSpy).toHaveBeenCalledWith('hiddenchange', { hidden: true, previous: false });
    });

    it('_updateNode 子组件委托属性系统', () => {
        const componentEl = document.createElement('div');
        const component = { el: componentEl, cls: '', hidden: false };
        const node = { _state: {} as Record<string, any>, component };
        const instance = {
            _resolveNodeTarget: () => ({ el: undefined, component }),
            nodeMap: { icon: node },
        };
        NodePropAbility._updateNode.call(instance, 'icon', { cls: 'active', hidden: true });
        expect(component.cls).toBe('active');
        expect(component.hidden).toBe(true);
        expect(node._state.cls).toBe('active');
        expect(node._state.hidden).toBe(true);
    });

    it('_setNodeProp 子组件有同名属性时委托', () => {
        const component = { cls: '', hidden: false };
        const instance = { _resolveNodeTarget: () => ({ el: undefined, component }) };
        NodePropAbility._setNodeProp.call(instance, 'icon', 'cls', 'active');
        expect(component.cls).toBe('active');
    });

    it('_getNodeProp 子组件有同名属性时委托', () => {
        const component = { cls: 'existing' };
        const instance = { _resolveNodeTarget: () => ({ el: undefined, component }) };
        const result = NodePropAbility._getNodeProp.call(instance, 'icon', 'cls');
        expect(result).toBe('existing');
    });

    it('_flushNodeProps 委托 _updateNode', () => {
        const component = { cls: '', hidden: false };
        const node = { _state: {} as Record<string, any>, component };
        const instance = {
            _resolveNodeTarget: () => ({ el: undefined, component }),
            _updateNode: jest.fn(),
            _dirtyNodes: { icon: { cls: 'active', hidden: true } },
            debounce: jest.fn(),
        };
        NodePropAbility._flushNodeProps.call(instance);
        expect(instance._updateNode).toHaveBeenCalledWith('icon', { cls: 'active', hidden: true });
    });
});
