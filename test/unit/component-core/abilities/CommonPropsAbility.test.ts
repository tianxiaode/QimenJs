import { CommonPropsAbility } from '@/component-core/abilities/CommonPropsAbility';

describe('CommonPropsAbility', () => {
    describe('Layer 1: root 属性', () => {
        it('提供 hidden getter/setter', () => {
            expect(typeof CommonPropsAbility.hidden.get).toBe('function');
            expect(typeof CommonPropsAbility.hidden.set).toBe('function');
        });

        it('提供 disabled getter/setter', () => {
            expect(typeof CommonPropsAbility.disabled.get).toBe('function');
            expect(typeof CommonPropsAbility.disabled.set).toBe('function');
        });

        it('提供 cls getter/setter', () => {
            expect(typeof CommonPropsAbility.cls.get).toBe('function');
            expect(typeof CommonPropsAbility.cls.set).toBe('function');
        });

        it('提供 style getter/setter', () => {
            expect(typeof CommonPropsAbility.style.get).toBe('function');
            expect(typeof CommonPropsAbility.style.set).toBe('function');
        });

        it('hidden setter 调用 _markNodeDirty', () => {
            const markSpy = jest.fn();
            const instance = { _markNodeDirty: markSpy };
            CommonPropsAbility.hidden.set.call(instance, true);
            expect(markSpy).toHaveBeenCalledWith('root', { hidden: true });
        });

        it('hidden getter 调用 _getNodeProp', () => {
            const getSpy = jest.fn(() => false);
            const instance = { _getNodeProp: getSpy };
            const result = CommonPropsAbility.hidden.get.call(instance);
            expect(getSpy).toHaveBeenCalledWith('root', 'hidden');
            expect(result).toBe(false);
        });

        it('cls getter/setter', () => {
            const instance = {
                _getNodeProp: jest.fn().mockReturnValue('active'),
                _markNodeDirty: jest.fn(),
            };
            expect(CommonPropsAbility.cls.get.call(instance)).toBe('active');
            CommonPropsAbility.cls.set.call(instance, 'new-cls');
            expect(instance._markNodeDirty).toHaveBeenCalledWith('root', { cls: 'new-cls' });
        });

        it('disabled getter/setter', () => {
            const instance = {
                _getNodeProp: jest.fn().mockReturnValue(false),
                _markNodeDirty: jest.fn(),
            };
            expect(CommonPropsAbility.disabled.get.call(instance)).toBe(false);
            CommonPropsAbility.disabled.set.call(instance, true);
            expect(instance._markNodeDirty).toHaveBeenCalledWith('root', { disabled: true });
        });

        it('order getter 返回默认值 0', () => {
            const instance = { _getNodeProp: jest.fn().mockReturnValue(undefined) };
            expect(CommonPropsAbility.order.get.call(instance)).toBe(0);
        });

        it('style getter/setter', () => {
            const instance = {
                _getNodeProp: jest.fn().mockReturnValue('color: red'),
                _markNodeDirty: jest.fn(),
            };
            expect(CommonPropsAbility.style.get.call(instance)).toBe('color: red');
            CommonPropsAbility.style.set.call(instance, 'color: blue');
            expect(instance._markNodeDirty).toHaveBeenCalledWith('root', { style: 'color: blue' });
        });

        it('role getter/setter', () => {
            const instance = {
                _getNodeProp: jest.fn().mockReturnValue('button'),
                _markNodeDirty: jest.fn(),
            };
            expect(CommonPropsAbility.role.get.call(instance)).toBe('button');
            CommonPropsAbility.role.set.call(instance, 'link');
            expect(instance._markNodeDirty).toHaveBeenCalledWith('root', { role: 'link' });
        });

        it('ariaLabel getter/setter', () => {
            const instance = {
                _getNodeProp: jest.fn().mockReturnValue('label'),
                _markNodeDirty: jest.fn(),
            };
            expect(CommonPropsAbility.ariaLabel.get.call(instance)).toBe('label');
            CommonPropsAbility.ariaLabel.set.call(instance, 'new-label');
            expect(instance._markNodeDirty).toHaveBeenCalledWith('root', {
                ariaLabel: 'new-label',
            });
        });
    });

    describe('Layer 1+2: 方法', () => {
        it('addCls 添加 CSS 类', () => {
            const el = document.createElement('div');
            const instance = {
                _resolveNodeTarget: jest.fn().mockReturnValue({ el, component: undefined }),
            };
            CommonPropsAbility.addCls.call(instance, 'active');
            expect(el.classList.contains('active')).toBe(true);
        });

        it('addCls 委托子组件', () => {
            const component = { addCls: jest.fn() };
            const instance = {
                _resolveNodeTarget: jest.fn().mockReturnValue({ el: undefined, component }),
            };
            CommonPropsAbility.addCls.call(instance, 'active');
            expect(component.addCls).toHaveBeenCalledWith('active');
        });

        it('removeCls 移除 CSS 类', () => {
            const el = document.createElement('div');
            el.classList.add('active');
            const instance = {
                _resolveNodeTarget: jest.fn().mockReturnValue({ el, component: undefined }),
            };
            CommonPropsAbility.removeCls.call(instance, 'active');
            expect(el.classList.contains('active')).toBe(false);
        });

        it('removeCls 委托子组件', () => {
            const component = { removeCls: jest.fn() };
            const instance = {
                _resolveNodeTarget: jest.fn().mockReturnValue({ el: undefined, component }),
            };
            CommonPropsAbility.removeCls.call(instance, 'active');
            expect(component.removeCls).toHaveBeenCalledWith('active');
        });

        it('toggleCls 切换 CSS 类', () => {
            const el = document.createElement('div');
            const instance = {
                _resolveNodeTarget: jest.fn().mockReturnValue({ el, component: undefined }),
            };
            CommonPropsAbility.toggleCls.call(instance, 'active');
            expect(el.classList.contains('active')).toBe(true);
            CommonPropsAbility.toggleCls.call(instance, 'active');
            expect(el.classList.contains('active')).toBe(false);
        });

        it('toggleCls force 为 string 时视为 nodeName', () => {
            const el = document.createElement('div');
            const instance = {
                _resolveNodeTarget: jest.fn().mockReturnValue({ el, component: undefined }),
            };
            CommonPropsAbility.toggleCls.call(instance, 'active', 'icon');
            expect(instance._resolveNodeTarget).toHaveBeenCalledWith('icon');
        });

        it('setAttr 设置 HTML 属性', () => {
            const el = document.createElement('div');
            const instance = {
                _resolveNodeTarget: jest.fn().mockReturnValue({ el, component: undefined }),
            };
            CommonPropsAbility.setAttr.call(instance, 'data-id', '123');
            expect(el.getAttribute('data-id')).toBe('123');
        });

        it('removeAttr 移除 HTML 属性', () => {
            const el = document.createElement('div');
            el.setAttribute('data-id', '123');
            const instance = {
                _resolveNodeTarget: jest.fn().mockReturnValue({ el, component: undefined }),
            };
            CommonPropsAbility.removeAttr.call(instance, 'data-id');
            expect(el.hasAttribute('data-id')).toBe(false);
        });

        it('addCls 多个类名用空格分隔', () => {
            const el = document.createElement('div');
            const instance = {
                _resolveNodeTarget: jest.fn().mockReturnValue({ el, component: undefined }),
            };
            CommonPropsAbility.addCls.call(instance, 'a b c');
            expect(el.classList.contains('a')).toBe(true);
            expect(el.classList.contains('b')).toBe(true);
            expect(el.classList.contains('c')).toBe(true);
        });

        it('setAttr 委托子组件', () => {
            const component = { setAttr: jest.fn() };
            const instance = {
                _resolveNodeTarget: jest.fn().mockReturnValue({ el: undefined, component }),
            };
            CommonPropsAbility.setAttr.call(instance, 'data-id', '123');
            expect(component.setAttr).toHaveBeenCalledWith('data-id', '123');
        });

        it('removeAttr 委托子组件', () => {
            const component = { removeAttr: jest.fn() };
            const instance = {
                _resolveNodeTarget: jest.fn().mockReturnValue({ el: undefined, component }),
            };
            CommonPropsAbility.removeAttr.call(instance, 'data-id');
            expect(component.removeAttr).toHaveBeenCalledWith('data-id');
        });
    });

    describe('Layer 2: 子节点属性方法', () => {
        it('setNodeProp 委托 _markNodeDirty', () => {
            const instance = { _markNodeDirty: jest.fn() };
            CommonPropsAbility.setNodeProp.call(instance, 'cls', 'active', 'icon');
            expect(instance._markNodeDirty).toHaveBeenCalledWith('icon', { cls: 'active' });
        });

        it('setNodeCls 委托 _markNodeDirty', () => {
            const instance = { _markNodeDirty: jest.fn() };
            CommonPropsAbility.setNodeCls.call(instance, 'active', 'icon');
            expect(instance._markNodeDirty).toHaveBeenCalledWith('icon', { cls: 'active' });
        });

        it('setNodeHidden 委托 _markNodeDirty', () => {
            const instance = { _markNodeDirty: jest.fn() };
            CommonPropsAbility.setNodeHidden.call(instance, true, 'icon');
            expect(instance._markNodeDirty).toHaveBeenCalledWith('icon', { hidden: true });
        });

        it('setNodeDisabled 委托 _markNodeDirty', () => {
            const instance = { _markNodeDirty: jest.fn() };
            CommonPropsAbility.setNodeDisabled.call(instance, true, 'icon');
            expect(instance._markNodeDirty).toHaveBeenCalledWith('icon', { disabled: true });
        });

        it('setNodeStyle 委托 _markNodeDirty', () => {
            const instance = { _markNodeDirty: jest.fn() };
            CommonPropsAbility.setNodeStyle.call(instance, 'color: red', 'icon');
            expect(instance._markNodeDirty).toHaveBeenCalledWith('icon', { style: 'color: red' });
        });

        it('setNodeHtml 委托 _markNodeDirty', () => {
            const instance = { _markNodeDirty: jest.fn() };
            CommonPropsAbility.setNodeHtml.call(instance, '<span>hi</span>', 'icon');
            expect(instance._markNodeDirty).toHaveBeenCalledWith('icon', {
                html: '<span>hi</span>',
            });
        });

        it('nodeName 默认为 root', () => {
            const instance = { _markNodeDirty: jest.fn() };
            CommonPropsAbility.setNodeCls.call(instance, 'active');
            expect(instance._markNodeDirty).toHaveBeenCalledWith('root', { cls: 'active' });
        });

        it('setNodeRole 委托 _markNodeDirty', () => {
            const instance = { _markNodeDirty: jest.fn() };
            CommonPropsAbility.setNodeRole.call(instance, 'button', 'icon');
            expect(instance._markNodeDirty).toHaveBeenCalledWith('icon', { role: 'button' });
        });

        it('setNodeAriaLabel 委托 _markNodeDirty', () => {
            const instance = { _markNodeDirty: jest.fn() };
            CommonPropsAbility.setNodeAriaLabel.call(instance, 'label', 'icon');
            expect(instance._markNodeDirty).toHaveBeenCalledWith('icon', { ariaLabel: 'label' });
        });
    });
});
