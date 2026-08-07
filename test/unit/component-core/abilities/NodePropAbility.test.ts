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
import { NodeQueryAbility } from '@/component-core/abilities/NodeQueryAbility';
import { LifecycleAbility } from '@/component-core/abilities/LifecycleAbility';

describe('NodePropAbility', () => {
    describe('核心方法存在性', () => {
        it('提供核心方法', () => {
            expect(typeof NodePropAbility._getNodeProp).toBe('function');
            expect(typeof NodePropAbility._setNodeProp).toBe('function');
            expect(typeof NodePropAbility._updateNode).toBe('function');
            expect(typeof NodePropAbility._markNodeDirty).toBe('function');
            expect(typeof NodePropAbility._flushNodeProps).toBe('function');
            expect(typeof NodeQueryAbility._resolveNodeEl).toBe('function');
            expect(typeof NodeQueryAbility._resolveNodeTarget).toBe('function');
        });
    });

    describe('_resolveNodeEl', () => {
        it('节点不存在时返回 undefined', () => {
            const instance = { nodeMap: {} };
            const result = NodeQueryAbility._resolveNodeEl.call(instance, 'nonexistent');
            expect(result).toBeUndefined();
        });

        it('节点有 component 时返回 component.el', () => {
            const el = document.createElement('div');
            const component = { el };
            const instance = { nodeMap: { icon: { component } } };
            const result = NodeQueryAbility._resolveNodeEl.call(instance, 'icon');
            expect(result).toBe(el);
        });

        it('节点无 component 时返回 node.el', () => {
            const el = document.createElement('div');
            const instance = { nodeMap: { icon: { el } } };
            const result = NodeQueryAbility._resolveNodeEl.call(instance, 'icon');
            expect(result).toBe(el);
        });
    });

    describe('_resolveNodeTarget', () => {
        it('节点不存在时返回空对象', () => {
            const instance = { nodeMap: {} };
            const result = NodeQueryAbility._resolveNodeTarget.call(instance, 'nonexistent');
            expect(result).toEqual({});
        });

        it('返回节点的 el 和 component', () => {
            const el = document.createElement('div');
            const component = { cls: 'test' };
            const instance = { nodeMap: { icon: { el, component } } };
            const result = NodeQueryAbility._resolveNodeTarget.call(instance, 'icon');
            expect(result).toEqual({ el, component });
        });
    });

    describe('_getNodeProp', () => {
        it('优先从脏追踪缓存读取', () => {
            const instance: any = {
                _dirtyNodes: { root: { hidden: true } },
                _resolveNodeTarget: jest.fn(),
            };
            const result = NodePropAbility._getNodeProp.call(instance, 'root', 'hidden');
            expect(result).toBe(true);
            expect(instance._resolveNodeTarget).not.toHaveBeenCalled();
        });

        it('子组件有同名属性时返回子组件属性', () => {
            const component = { hidden: true };
            const instance = {
                _resolveNodeTarget: () => ({ el: undefined, component }),
            };
            const result = NodePropAbility._getNodeProp.call(instance, 'icon', 'hidden');
            expect(result).toBe(true);
        });

        it('节点不存在时返回 undefined', () => {
            const instance = {
                _resolveNodeTarget: () => ({ el: undefined, component: undefined }),
            };
            const result = NodePropAbility._getNodeProp.call(instance, 'nonexistent', 'hidden');
            expect(result).toBeUndefined();
        });

        it('属性定义不存在时返回 undefined', () => {
            const el = document.createElement('div');
            const instance = {
                _resolveNodeTarget: () => ({ el, component: undefined }),
            };
            const result = NodePropAbility._getNodeProp.call(instance, 'root', 'nonexistentProp');
            expect(result).toBeUndefined();
        });

        it('cssProp 属性从 style 读取', () => {
            const el = document.createElement('div');
            el.style.width = '100px';
            const instance = {
                _resolveNodeTarget: () => ({ el, component: undefined }),
            };
            const result = NodePropAbility._getNodeProp.call(instance, 'root', 'width');
            expect(result).toBe('100px');
        });

        it('attr 属性从 getAttribute 读取', () => {
            const el = document.createElement('div');
            el.setAttribute('role', 'button');
            const instance = {
                _resolveNodeTarget: () => ({ el, component: undefined }),
            };
            const result = NodePropAbility._getNodeProp.call(instance, 'root', 'role');
            expect(result).toBe('button');
        });

        it('domAttr 属性直接读取', () => {
            const el = document.createElement('div');
            el.hidden = true;
            const instance = {
                _resolveNodeTarget: () => ({ el, component: undefined }),
            };
            const result = NodePropAbility._getNodeProp.call(instance, 'root', 'hidden');
            expect(result).toBe(true);
        });

        it('target 不存在时返回 undefined', () => {
            const instance = {
                _resolveNodeTarget: () => ({ el: undefined, component: {} }),
            };
            const result = NodePropAbility._getNodeProp.call(instance, 'root', 'hidden');
            expect(result).toBeUndefined();
        });
    });

    describe('_setNodeProp', () => {
        it('节点不存在时直接返回', () => {
            const instance = {
                _resolveNodeTarget: () => ({ el: undefined, component: undefined }),
            };
            expect(() =>
                NodePropAbility._setNodeProp.call(instance, 'root', 'hidden', true)
            ).not.toThrow();
        });

        it('子组件有同名属性时设置子组件属性', () => {
            const component = { hidden: false };
            const instance = {
                _resolveNodeTarget: () => ({ el: undefined, component }),
            };
            NodePropAbility._setNodeProp.call(instance, 'icon', 'hidden', true);
            expect(component.hidden).toBe(true);
        });

        it('属性定义不存在时不执行操作', () => {
            const el = document.createElement('div');
            const instance = {
                _resolveNodeTarget: () => ({ el, component: undefined }),
            };
            expect(() =>
                NodePropAbility._setNodeProp.call(instance, 'root', 'nonexistent', 'value')
            ).not.toThrow();
        });

        it('设置 hidden 属性到 DOM', () => {
            const el = document.createElement('div');
            const instance = {
                _resolveNodeTarget: () => ({ el, component: undefined }),
            };
            NodePropAbility._setNodeProp.call(instance, 'root', 'hidden', true);
            expect(el.hidden).toBe(true);
        });

        it('target 不存在时直接返回', () => {
            const instance = {
                _resolveNodeTarget: () => ({ el: undefined, component: {} }),
            };
            expect(() =>
                NodePropAbility._setNodeProp.call(instance, 'root', 'hidden', true)
            ).not.toThrow();
        });
    });

    describe('_updateNode', () => {
        it('应用 cls 属性', () => {
            const el = document.createElement('div');
            const instance = {
                _resolveNodeTarget: () => ({ el, component: undefined }),
                nodeMap: { root: { _state: {} } },
            };
            NodePropAbility._updateNode.call(instance, 'root', { cls: 'active' });
            expect(el.className).toBe('active');
        });

        it('更新 _state 快照', () => {
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
            expect(emitSpy).toHaveBeenCalledWith(
                'hiddenchange',
                expect.objectContaining({ data: { hidden: true, previous: false } })
            );
        });

        it('子组件委托属性系统', () => {
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

        it('应用 flex 布局', () => {
            const el = document.createElement('div');
            const instance = {
                _resolveNodeTarget: () => ({ el, component: undefined }),
                nodeMap: { root: { _state: {} } },
            };
            NodePropAbility._updateNode.call(instance, 'root', {
                flex: { direction: 'column', gap: 10, align: 'center', pack: 'start', wrap: true },
            });
            expect(el.style.display).toBe('flex');
            expect(el.style.flexDirection).toBe('column');
            expect(el.style.gap).toBe('10px');
            expect(el.style.alignItems).toBe('center');
            expect(el.style.justifyContent).toBe('flex-start');
            expect(el.style.flexWrap).toBe('wrap');
        });

        it('应用 grid 布局', () => {
            const el = document.createElement('div');
            const instance = {
                _resolveNodeTarget: () => ({ el, component: undefined }),
                nodeMap: { root: { _state: {} } },
            };
            NodePropAbility._updateNode.call(instance, 'root', {
                grid: { columns: 3, gap: 20 },
            });
            expect(el.style.display).toBe('flex');
            expect(el.style.flexWrap).toBe('wrap');
            expect(el.style.gridTemplateColumns).toBe('repeat(3, 1fr)');
            expect(el.style.gap).toBe('20px');
        });

        it('应用 style 字符串', () => {
            const el = document.createElement('div');
            const instance = {
                _resolveNodeTarget: () => ({ el, component: undefined }),
                nodeMap: { root: { _state: {} } },
            };
            NodePropAbility._updateNode.call(instance, 'root', {
                style: 'color: red; font-size: 14px',
            });
            expect(el.getAttribute('style')).toBe('color: red; font-size: 14px');
        });

        it('应用 style 对象', () => {
            const el = document.createElement('div');
            const instance = {
                _resolveNodeTarget: () => ({ el, component: undefined }),
                nodeMap: { root: { _state: {} } },
            };
            NodePropAbility._updateNode.call(instance, 'root', {
                style: { color: 'red', fontSize: '14px' },
            });
            expect(el.style.color).toBe('red');
            expect(el.style.fontSize).toBe('14px');
        });

        it('应用 role 属性', () => {
            const el = document.createElement('div');
            const instance = {
                _resolveNodeTarget: () => ({ el, component: undefined }),
                nodeMap: { root: { _state: {} } },
            };
            NodePropAbility._updateNode.call(instance, 'root', { role: 'button' });
            expect(el.getAttribute('role')).toBe('button');
        });

        it('移除 role 属性', () => {
            const el = document.createElement('div');
            el.setAttribute('role', 'button');
            const instance = {
                _resolveNodeTarget: () => ({ el, component: undefined }),
                nodeMap: { root: { _state: {} } },
            };
            NodePropAbility._updateNode.call(instance, 'root', { role: false });
            expect(el.hasAttribute('role')).toBe(false);
        });

        it('应用 attrs 批量属性', () => {
            const el = document.createElement('div');
            const instance = {
                _resolveNodeTarget: () => ({ el, component: undefined }),
                nodeMap: { root: { _state: {} } },
            };
            NodePropAbility._updateNode.call(instance, 'root', {
                attrs: { 'data-id': '123', 'data-name': 'test' },
            });
            expect(el.getAttribute('data-id')).toBe('123');
            expect(el.getAttribute('data-name')).toBe('test');
        });

        it('应用 hidden 默认模式', () => {
            const el = document.createElement('div');
            const instance = {
                _resolveNodeTarget: () => ({ el, component: undefined }),
                nodeMap: { root: { _state: {} } },
                _emitLifecycleEvent: jest.fn(),
            };
            NodePropAbility._updateNode.call(instance, 'root', { hidden: true });
            expect(el.hidden).toBe(true);
        });

        it('应用 hidden visibility 模式', () => {
            const el = document.createElement('div');
            const instance = {
                _resolveNodeTarget: () => ({ el, component: undefined }),
                nodeMap: { root: { _state: {} } },
                _emitLifecycleEvent: jest.fn(),
            };
            NodePropAbility._updateNode.call(instance, 'root', {
                hidden: true,
                hiddenMode: 'visibility',
            });
            expect(el.style.visibility).toBe('hidden');
        });

        it('应用 hidden opacity 模式', () => {
            const el = document.createElement('div');
            const instance = {
                _resolveNodeTarget: () => ({ el, component: undefined }),
                nodeMap: { root: { _state: {} } },
                _emitLifecycleEvent: jest.fn(),
            };
            NodePropAbility._updateNode.call(instance, 'root', {
                hidden: true,
                hiddenMode: 'opacity',
            });
            expect(el.style.opacity).toBe('0');
        });

        it('取消隐藏时恢复样式', () => {
            const el = document.createElement('div');
            el.hidden = true;
            el.style.visibility = 'hidden';
            el.style.opacity = '0';
            const instance = {
                _resolveNodeTarget: () => ({ el, component: undefined }),
                nodeMap: { root: { _state: { hidden: true } } },
                _emitLifecycleEvent: jest.fn(),
            };
            NodePropAbility._updateNode.call(instance, 'root', { hidden: false });
            expect(el.hidden).toBe(false);
            expect(el.style.visibility).toBe('');
            expect(el.style.opacity).toBe('');
        });

        it('无 nodeMap 时直接应用属性', () => {
            const el = document.createElement('div');
            const component = { el };
            const instance = {
                _resolveNodeTarget: () => ({ el: undefined, component }),
                nodeMap: undefined,
            };
            NodePropAbility._updateNode.call(instance, 'icon', { cls: 'test' });
            expect(el.className).toBe('test');
        });

        it('playLeave 动画后应用属性', async () => {
            const el = document.createElement('div');
            const playLeaveSpy = jest.fn(() => Promise.resolve());
            const node = { _state: { hidden: false } as Record<string, any> };
            const instance = {
                _resolveNodeTarget: () => ({ el, component: undefined }),
                nodeMap: { root: node },
                playLeave: playLeaveSpy,
                _emitLifecycleEvent: jest.fn(),
            };
            NodePropAbility._updateNode.call(instance, 'root', { hidden: true });
            await new Promise(resolve => setTimeout(resolve, 0));
            expect(playLeaveSpy).toHaveBeenCalled();
            expect(el.hidden).toBe(true);
        });

        it('playEnter 动画', async () => {
            const el = document.createElement('div');
            const playEnterSpy = jest.fn();
            const node = { _state: { hidden: true } as Record<string, any> };
            const instance = {
                _resolveNodeTarget: () => ({ el, component: undefined }),
                nodeMap: { root: node },
                playEnter: playEnterSpy,
                _emitLifecycleEvent: jest.fn(),
            };
            NodePropAbility._updateNode.call(instance, 'root', { hidden: false });
            expect(playEnterSpy).toHaveBeenCalled();
            expect(el.hidden).toBe(false);
        });

        it('子组件属性无同名属性时应用到 el', () => {
            const el = document.createElement('div');
            const component = { el };
            const node = { _state: {} as Record<string, any>, component };
            const instance = {
                _resolveNodeTarget: () => ({ el: undefined, component }),
                nodeMap: { icon: node },
            };
            NodePropAbility._updateNode.call(instance, 'icon', { cls: 'active' });
            expect(el.className).toBe('active');
        });

        it('应用 flex 布局非对象值', () => {
            const el = document.createElement('div');
            const instance = {
                _resolveNodeTarget: () => ({ el, component: undefined }),
                nodeMap: { root: { _state: {} } },
            };
            NodePropAbility._updateNode.call(instance, 'root', { flex: true });
            expect(el.style.display).toBe('flex');
            expect(el.style.flexDirection).toBe('row');
        });

        it('应用 grid 布局非对象值', () => {
            const el = document.createElement('div');
            const instance = {
                _resolveNodeTarget: () => ({ el, component: undefined }),
                nodeMap: { root: { _state: {} } },
            };
            NodePropAbility._updateNode.call(instance, 'root', { grid: true });
            expect(el.style.display).toBe('flex');
            expect(el.style.flexWrap).toBe('wrap');
        });

        it('应用 flex 扩展属性（flex/minH/maxH/minW/maxW/height/width/overflow）', () => {
            const el = document.createElement('div');
            const instance = {
                _resolveNodeTarget: () => ({ el, component: undefined }),
                nodeMap: { root: { _state: {} } },
            };
            NodePropAbility._updateNode.call(instance, 'root', {
                flex: {
                    direction: 'column',
                    flex: 1,
                    minHeight: 100,
                    maxHeight: '50vh',
                    minWidth: 200,
                    maxWidth: '80%',
                    height: 300,
                    width: '400px',
                    overflow: 'auto',
                },
            });
            expect(el.style.flex).toContain('1');
            expect(el.style.minHeight).toBe('100px');
            expect(el.style.maxHeight).toBe('50vh');
            expect(el.style.minWidth).toBe('200px');
            expect(el.style.maxWidth).toBe('80%');
            expect(el.style.height).toBe('300px');
            expect(el.style.width).toBe('400px');
            expect(el.style.overflow).toBe('auto');
        });

        it('flex 扩展属性数字自动加 px', () => {
            const el = document.createElement('div');
            const instance = {
                _resolveNodeTarget: () => ({ el, component: undefined }),
                nodeMap: { root: { _state: {} } },
            };
            NodePropAbility._updateNode.call(instance, 'root', {
                flex: { flex: '0 0 200px', height: 500 },
            });
            expect(el.style.flex).toBe('0 0 200px');
            expect(el.style.height).toBe('500px');
        });

        it('子组件 value 为 undefined 时跳过', () => {
            const componentEl = document.createElement('div');
            const component = { el: componentEl, cls: '' };
            const node = { _state: {} as Record<string, any>, component };
            const instance = {
                _resolveNodeTarget: () => ({ el: undefined, component }),
                nodeMap: { icon: node },
            };
            NodePropAbility._updateNode.call(instance, 'icon', {
                cls: 'active',
                hidden: undefined,
            });
            expect(component.cls).toBe('active');
        });

        it('子组件无 el 且无同名属性时跳过', () => {
            const component = {};
            const node = { _state: {} as Record<string, any>, component };
            const instance = {
                _resolveNodeTarget: () => ({ el: undefined, component }),
                nodeMap: { icon: node },
            };
            expect(() =>
                NodePropAbility._updateNode.call(instance, 'icon', { cls: 'active' })
            ).not.toThrow();
        });

        it('hidden 相同值时不触发事件', () => {
            const el = document.createElement('div');
            const emitSpy = jest.fn();
            const node = { _state: { hidden: true } as Record<string, any> };
            const instance = {
                _resolveNodeTarget: () => ({ el, component: undefined }),
                nodeMap: { root: node },
                emit: emitSpy,
                _emitLifecycleEvent: jest.fn(),
            };
            NodePropAbility._updateNode.call(instance, 'root', { hidden: true });
            expect(emitSpy).not.toHaveBeenCalled();
        });

        it('非 root 节点 hidden 变化不触发事件', () => {
            const el = document.createElement('div');
            const emitSpy = jest.fn();
            const node = { _state: { hidden: false } as Record<string, any> };
            const instance = {
                _resolveNodeTarget: () => ({ el, component: undefined }),
                nodeMap: { icon: node },
                emit: emitSpy,
                _emitLifecycleEvent: jest.fn(),
            };
            NodePropAbility._updateNode.call(instance, 'icon', { hidden: true });
            expect(emitSpy).not.toHaveBeenCalled();
        });

        it('node 无 _state 时初始化 _state', () => {
            const el = document.createElement('div');
            const node = {} as any;
            const instance = {
                _resolveNodeTarget: () => ({ el, component: undefined }),
                nodeMap: { root: node },
            };
            NodePropAbility._updateNode.call(instance, 'root', { cls: 'test' });
            expect(node._state).toBeDefined();
            expect(node._state.cls).toBe('test');
        });
    });

    describe('_markNodeDirty', () => {
        it('初始化 _dirtyNodes', () => {
            const debounceSpy = jest.fn(() => () => {});
            const instance: any = { debounce: debounceSpy };
            NodePropAbility._markNodeDirty.call(instance, 'root', { hidden: true });
            expect(instance._dirtyNodes).toEqual({ root: { hidden: true } });
            expect(debounceSpy).toHaveBeenCalled();
        });

        it('合并多个脏属性', () => {
            const debounceSpy = jest.fn(() => () => {});
            const instance: any = {
                debounce: debounceSpy,
                _dirtyNodes: { root: { hidden: true } },
            };
            NodePropAbility._markNodeDirty.call(instance, 'root', { cls: 'active' });
            expect(instance._dirtyNodes.root).toEqual({ hidden: true, cls: 'active' });
        });
    });

    describe('_flushNodeProps', () => {
        it('委托 _updateNode', () => {
            const component = { cls: '', hidden: false };
            const node = { _state: {} as Record<string, any>, component };
            const instance = {
                _resolveNodeTarget: () => ({ el: undefined, component }),
                _updateNode: jest.fn(),
                _dirtyNodes: { icon: { cls: 'active', hidden: true } },
                debounce: jest.fn(),
            };
            NodePropAbility._flushNodeProps.call(instance);
            expect(instance._updateNode).toHaveBeenCalledWith('icon', {
                cls: 'active',
                hidden: true,
            });
        });

        it('清空脏节点', () => {
            const instance = {
                _resolveNodeTarget: jest.fn(),
                _updateNode: jest.fn(),
                _dirtyNodes: { root: { hidden: true } },
                debounce: jest.fn(),
            };
            NodePropAbility._flushNodeProps.call(instance);
            expect(instance._dirtyNodes).toEqual({});
        });

        it('无脏节点时不执行操作', () => {
            const instance = { _updateNode: jest.fn() };
            expect(() => NodePropAbility._flushNodeProps.call(instance)).not.toThrow();
        });
    });

    describe('_updateNode applyPropToEl 分支', () => {
        it('width 数字值自动加 px', () => {
            const el = document.createElement('div');
            const instance = {
                _resolveNodeTarget: () => ({ el, component: undefined }),
                nodeMap: { root: { _state: {} } },
            };
            NodePropAbility._updateNode.call(instance, 'root', { width: 100 });
            expect(el.style.width).toBe('100px');
        });

        it('ariaLabel 属性设置', () => {
            const el = document.createElement('div');
            const instance = {
                _resolveNodeTarget: () => ({ el, component: undefined }),
                nodeMap: { root: { _state: {} } },
            };
            NodePropAbility._updateNode.call(instance, 'root', { ariaLabel: 'test' });
            expect(el.getAttribute('aria-label')).toBe('test');
        });

        it('ariaLabel 值为 false 时移除属性', () => {
            const el = document.createElement('div');
            el.setAttribute('aria-label', 'test');
            const instance = {
                _resolveNodeTarget: () => ({ el, component: undefined }),
                nodeMap: { root: { _state: {} } },
            };
            NodePropAbility._updateNode.call(instance, 'root', { ariaLabel: false });
            expect(el.hasAttribute('aria-label')).toBe(false);
        });

        it('ariaLabel 值为 null 时移除属性', () => {
            const el = document.createElement('div');
            el.setAttribute('aria-label', 'test');
            const instance = {
                _resolveNodeTarget: () => ({ el, component: undefined }),
                nodeMap: { root: { _state: {} } },
            };
            NodePropAbility._updateNode.call(instance, 'root', { ariaLabel: null });
            expect(el.hasAttribute('aria-label')).toBe(false);
        });

        it('ariaLabel 值为 true 时设为空字符串', () => {
            const el = document.createElement('div');
            const instance = {
                _resolveNodeTarget: () => ({ el, component: undefined }),
                nodeMap: { root: { _state: {} } },
            };
            NodePropAbility._updateNode.call(instance, 'root', { ariaLabel: true });
            expect(el.getAttribute('aria-label')).toBe('');
        });

        it('disabled 属性设置', () => {
            const el = document.createElement('div');
            const instance = {
                _resolveNodeTarget: () => ({ el, component: undefined }),
                nodeMap: { root: { _state: {} } },
            };
            NodePropAbility._updateNode.call(instance, 'root', { disabled: true });
            expect((el as any).disabled).toBe(true);
        });

        it('margin 字符串值', () => {
            const el = document.createElement('div');
            const instance = {
                _resolveNodeTarget: () => ({ el, component: undefined }),
                nodeMap: { root: { _state: {} } },
            };
            NodePropAbility._updateNode.call(instance, 'root', { margin: '10px' });
            expect(el.style.margin).toBe('10px');
        });
    });
});
