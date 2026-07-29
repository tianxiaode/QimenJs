import { CommonPropsAbility } from '@/component-core/abilities/CommonPropsAbility';

describe('CommonPropsAbility', () => {
    describe('Layer 1: root 属性', () => {
        describe('基础属性', () => {
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
        });

        describe('属性 getter/setter 行为', () => {
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

            it('order setter', () => {
                const instance = { _markNodeDirty: jest.fn() };
                CommonPropsAbility.order.set.call(instance, 5);
                expect(instance._markNodeDirty).toHaveBeenCalledWith('root', { order: 5 });
            });

            it('style getter/setter', () => {
                const instance = {
                    _getNodeProp: jest.fn().mockReturnValue('color: red'),
                    _markNodeDirty: jest.fn(),
                };
                expect(CommonPropsAbility.style.get.call(instance)).toBe('color: red');
                CommonPropsAbility.style.set.call(instance, 'color: blue');
                expect(instance._markNodeDirty).toHaveBeenCalledWith('root', {
                    style: 'color: blue',
                });
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
        });

        describe('ARIA 属性', () => {
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

            it('ariaChecked getter/setter', () => {
                const instance = {
                    _getNodeProp: jest.fn().mockReturnValue('true'),
                    _markNodeDirty: jest.fn(),
                };
                expect(CommonPropsAbility.ariaChecked.get.call(instance)).toBe('true');
                CommonPropsAbility.ariaChecked.set.call(instance, 'false');
                expect(instance._markNodeDirty).toHaveBeenCalledWith('root', {
                    ariaChecked: 'false',
                });
            });

            it('ariaDisabled getter/setter', () => {
                const instance = {
                    _getNodeProp: jest.fn().mockReturnValue('false'),
                    _markNodeDirty: jest.fn(),
                };
                expect(CommonPropsAbility.ariaDisabled.get.call(instance)).toBe('false');
                CommonPropsAbility.ariaDisabled.set.call(instance, 'true');
                expect(instance._markNodeDirty).toHaveBeenCalledWith('root', {
                    ariaDisabled: 'true',
                });
            });

            it('ariaExpanded getter/setter', () => {
                const instance = {
                    _getNodeProp: jest.fn().mockReturnValue('true'),
                    _markNodeDirty: jest.fn(),
                };
                expect(CommonPropsAbility.ariaExpanded.get.call(instance)).toBe('true');
                CommonPropsAbility.ariaExpanded.set.call(instance, 'false');
                expect(instance._markNodeDirty).toHaveBeenCalledWith('root', {
                    ariaExpanded: 'false',
                });
            });

            it('ariaSelected getter/setter', () => {
                const instance = {
                    _getNodeProp: jest.fn().mockReturnValue('true'),
                    _markNodeDirty: jest.fn(),
                };
                expect(CommonPropsAbility.ariaSelected.get.call(instance)).toBe('true');
                CommonPropsAbility.ariaSelected.set.call(instance, 'false');
                expect(instance._markNodeDirty).toHaveBeenCalledWith('root', {
                    ariaSelected: 'false',
                });
            });

            it('ariaHidden getter/setter', () => {
                const instance = {
                    _getNodeProp: jest.fn().mockReturnValue('false'),
                    _markNodeDirty: jest.fn(),
                };
                expect(CommonPropsAbility.ariaHidden.get.call(instance)).toBe('false');
                CommonPropsAbility.ariaHidden.set.call(instance, 'true');
                expect(instance._markNodeDirty).toHaveBeenCalledWith('root', {
                    ariaHidden: 'true',
                });
            });

            it('hint getter/setter', () => {
                const instance = {
                    _getNodeProp: jest.fn().mockReturnValue('tooltip'),
                    _markNodeDirty: jest.fn(),
                };
                expect(CommonPropsAbility.hint.get.call(instance)).toBe('tooltip');
                CommonPropsAbility.hint.set.call(instance, 'new-hint');
                expect(instance._markNodeDirty).toHaveBeenCalledWith('root', { hint: 'new-hint' });
            });
        });

        describe('布局属性', () => {
            it('width getter/setter', () => {
                const instance = {
                    _getNodeProp: jest.fn().mockReturnValue('100px'),
                    _markNodeDirty: jest.fn(),
                };
                expect(CommonPropsAbility.width.get.call(instance)).toBe('100px');
                CommonPropsAbility.width.set.call(instance, '200px');
                expect(instance._markNodeDirty).toHaveBeenCalledWith('root', { width: '200px' });
            });

            it('height getter/setter', () => {
                const instance = {
                    _getNodeProp: jest.fn().mockReturnValue('50px'),
                    _markNodeDirty: jest.fn(),
                };
                expect(CommonPropsAbility.height.get.call(instance)).toBe('50px');
                CommonPropsAbility.height.set.call(instance, '100px');
                expect(instance._markNodeDirty).toHaveBeenCalledWith('root', { height: '100px' });
            });

            it('x getter/setter', () => {
                const instance = {
                    _getNodeProp: jest.fn().mockReturnValue('10px'),
                    _markNodeDirty: jest.fn(),
                };
                expect(CommonPropsAbility.x.get.call(instance)).toBe('10px');
                CommonPropsAbility.x.set.call(instance, '20px');
                expect(instance._markNodeDirty).toHaveBeenCalledWith('root', { x: '20px' });
            });

            it('y getter/setter', () => {
                const instance = {
                    _getNodeProp: jest.fn().mockReturnValue('15px'),
                    _markNodeDirty: jest.fn(),
                };
                expect(CommonPropsAbility.y.get.call(instance)).toBe('15px');
                CommonPropsAbility.y.set.call(instance, '25px');
                expect(instance._markNodeDirty).toHaveBeenCalledWith('root', { y: '25px' });
            });

            it('margin getter/setter', () => {
                const instance = {
                    _getNodeProp: jest.fn().mockReturnValue('10px'),
                    _markNodeDirty: jest.fn(),
                };
                expect(CommonPropsAbility.margin.get.call(instance)).toBe('10px');
                CommonPropsAbility.margin.set.call(instance, '20px');
                expect(instance._markNodeDirty).toHaveBeenCalledWith('root', { margin: '20px' });
            });

            it('padding getter/setter', () => {
                const instance = {
                    _getNodeProp: jest.fn().mockReturnValue('5px'),
                    _markNodeDirty: jest.fn(),
                };
                expect(CommonPropsAbility.padding.get.call(instance)).toBe('5px');
                CommonPropsAbility.padding.set.call(instance, '10px');
                expect(instance._markNodeDirty).toHaveBeenCalledWith('root', { padding: '10px' });
            });
        });

        describe('样式属性', () => {
            it('fontSize getter/setter', () => {
                const instance = {
                    _getNodeProp: jest.fn().mockReturnValue('14px'),
                    _markNodeDirty: jest.fn(),
                };
                expect(CommonPropsAbility.fontSize.get.call(instance)).toBe('14px');
                CommonPropsAbility.fontSize.set.call(instance, '16px');
                expect(instance._markNodeDirty).toHaveBeenCalledWith('root', { fontSize: '16px' });
            });

            it('color getter/setter', () => {
                const instance = {
                    _getNodeProp: jest.fn().mockReturnValue('#333'),
                    _markNodeDirty: jest.fn(),
                };
                expect(CommonPropsAbility.color.get.call(instance)).toBe('#333');
                CommonPropsAbility.color.set.call(instance, '#666');
                expect(instance._markNodeDirty).toHaveBeenCalledWith('root', { color: '#666' });
            });

            it('bg getter/setter', () => {
                const instance = {
                    _getNodeProp: jest.fn().mockReturnValue('#fff'),
                    _markNodeDirty: jest.fn(),
                };
                expect(CommonPropsAbility.bg.get.call(instance)).toBe('#fff');
                CommonPropsAbility.bg.set.call(instance, '#f0f0f0');
                expect(instance._markNodeDirty).toHaveBeenCalledWith('root', { bg: '#f0f0f0' });
            });

            it('cursor getter/setter', () => {
                const instance = {
                    _getNodeProp: jest.fn().mockReturnValue('pointer'),
                    _markNodeDirty: jest.fn(),
                };
                expect(CommonPropsAbility.cursor.get.call(instance)).toBe('pointer');
                CommonPropsAbility.cursor.set.call(instance, 'default');
                expect(instance._markNodeDirty).toHaveBeenCalledWith('root', { cursor: 'default' });
            });

            it('border getter/setter', () => {
                const instance = {
                    _getNodeProp: jest.fn().mockReturnValue('1px solid #ccc'),
                    _markNodeDirty: jest.fn(),
                };
                expect(CommonPropsAbility.border.get.call(instance)).toBe('1px solid #ccc');
                CommonPropsAbility.border.set.call(instance, '2px solid #999');
                expect(instance._markNodeDirty).toHaveBeenCalledWith('root', {
                    border: '2px solid #999',
                });
            });
        });
    });

    describe('Layer 1+2: 方法', () => {
        describe('addCls', () => {
            it('添加 CSS 类', () => {
                const el = document.createElement('div');
                const instance = {
                    _resolveNodeTarget: jest.fn().mockReturnValue({ el, component: undefined }),
                };
                CommonPropsAbility.addCls.call(instance, 'active');
                expect(el.classList.contains('active')).toBe(true);
            });

            it('委托子组件', () => {
                const component = { addCls: jest.fn() };
                const instance = {
                    _resolveNodeTarget: jest.fn().mockReturnValue({ el: undefined, component }),
                };
                CommonPropsAbility.addCls.call(instance, 'active');
                expect(component.addCls).toHaveBeenCalledWith('active');
            });

            it('多个类名用空格分隔', () => {
                const el = document.createElement('div');
                const instance = {
                    _resolveNodeTarget: jest.fn().mockReturnValue({ el, component: undefined }),
                };
                CommonPropsAbility.addCls.call(instance, 'a b c');
                expect(el.classList.contains('a')).toBe(true);
                expect(el.classList.contains('b')).toBe(true);
                expect(el.classList.contains('c')).toBe(true);
            });

            it('子组件有 el 时使用 component.el', () => {
                const el = document.createElement('div');
                const component = { el };
                const instance = {
                    _resolveNodeTarget: jest.fn().mockReturnValue({ el: undefined, component }),
                };
                CommonPropsAbility.addCls.call(instance, 'active');
                expect(el.classList.contains('active')).toBe(true);
            });
        });

        describe('removeCls', () => {
            it('移除 CSS 类', () => {
                const el = document.createElement('div');
                el.classList.add('active');
                const instance = {
                    _resolveNodeTarget: jest.fn().mockReturnValue({ el, component: undefined }),
                };
                CommonPropsAbility.removeCls.call(instance, 'active');
                expect(el.classList.contains('active')).toBe(false);
            });

            it('委托子组件', () => {
                const component = { removeCls: jest.fn() };
                const instance = {
                    _resolveNodeTarget: jest.fn().mockReturnValue({ el: undefined, component }),
                };
                CommonPropsAbility.removeCls.call(instance, 'active');
                expect(component.removeCls).toHaveBeenCalledWith('active');
            });
        });

        describe('toggleCls', () => {
            it('切换 CSS 类', () => {
                const el = document.createElement('div');
                const instance = {
                    _resolveNodeTarget: jest.fn().mockReturnValue({ el, component: undefined }),
                };
                CommonPropsAbility.toggleCls.call(instance, 'active');
                expect(el.classList.contains('active')).toBe(true);
                CommonPropsAbility.toggleCls.call(instance, 'active');
                expect(el.classList.contains('active')).toBe(false);
            });

            it('force 为 string 时视为 nodeName', () => {
                const el = document.createElement('div');
                const instance = {
                    _resolveNodeTarget: jest.fn().mockReturnValue({ el, component: undefined }),
                };
                CommonPropsAbility.toggleCls.call(instance, 'active', 'icon');
                expect(instance._resolveNodeTarget).toHaveBeenCalledWith('icon');
            });

            it('委托子组件', () => {
                const component = { toggleCls: jest.fn() };
                const instance = {
                    _resolveNodeTarget: jest.fn().mockReturnValue({ el: undefined, component }),
                };
                CommonPropsAbility.toggleCls.call(instance, 'active', true);
                expect(component.toggleCls).toHaveBeenCalledWith('active', true);
            });

            it('强制添加类名', () => {
                const el = document.createElement('div');
                const instance = {
                    _resolveNodeTarget: jest.fn().mockReturnValue({ el, component: undefined }),
                };
                CommonPropsAbility.toggleCls.call(instance, 'active', true);
                expect(el.classList.contains('active')).toBe(true);
            });

            it('强制移除类名', () => {
                const el = document.createElement('div');
                el.classList.add('active');
                const instance = {
                    _resolveNodeTarget: jest.fn().mockReturnValue({ el, component: undefined }),
                };
                CommonPropsAbility.toggleCls.call(instance, 'active', false);
                expect(el.classList.contains('active')).toBe(false);
            });
        });

        describe('containsCls', () => {
            it('类名存在时返回 true', () => {
                const el = document.createElement('div');
                el.classList.add('active');
                const instance = {
                    _resolveNodeTarget: jest.fn().mockReturnValue({ el, component: undefined }),
                };
                expect(CommonPropsAbility.containsCls.call(instance, 'active')).toBe(true);
            });

            it('类名不存在时返回 false', () => {
                const el = document.createElement('div');
                const instance = {
                    _resolveNodeTarget: jest.fn().mockReturnValue({ el, component: undefined }),
                };
                expect(CommonPropsAbility.containsCls.call(instance, 'active')).toBe(false);
            });

            it('委托子组件', () => {
                const component = { containsCls: jest.fn().mockReturnValue(true) };
                const instance = {
                    _resolveNodeTarget: jest.fn().mockReturnValue({ el: undefined, component }),
                };
                expect(CommonPropsAbility.containsCls.call(instance, 'active')).toBe(true);
                expect(component.containsCls).toHaveBeenCalledWith('active');
            });

            it('子组件有 el 时使用 component.el', () => {
                const el = document.createElement('div');
                el.classList.add('active');
                const component = { el };
                const instance = {
                    _resolveNodeTarget: jest.fn().mockReturnValue({ el: undefined, component }),
                };
                expect(CommonPropsAbility.containsCls.call(instance, 'active')).toBe(true);
            });

            it('无 target 时返回 false', () => {
                const instance = {
                    _resolveNodeTarget: jest
                        .fn()
                        .mockReturnValue({ el: undefined, component: undefined }),
                };
                expect(CommonPropsAbility.containsCls.call(instance, 'active')).toBe(false);
            });

            it('指定 nodeName', () => {
                const el = document.createElement('div');
                el.classList.add('active');
                const instance = {
                    _resolveNodeTarget: jest.fn().mockReturnValue({ el, component: undefined }),
                };
                CommonPropsAbility.containsCls.call(instance, 'active', 'icon');
                expect(instance._resolveNodeTarget).toHaveBeenCalledWith('icon');
            });

            it('nodeName 默认为 root', () => {
                const el = document.createElement('div');
                const instance = {
                    _resolveNodeTarget: jest.fn().mockReturnValue({ el, component: undefined }),
                };
                CommonPropsAbility.containsCls.call(instance, 'active');
                expect(instance._resolveNodeTarget).toHaveBeenCalledWith('root');
            });
        });

        describe('setAttr', () => {
            it('设置 HTML 属性', () => {
                const el = document.createElement('div');
                const instance = {
                    _resolveNodeTarget: jest.fn().mockReturnValue({ el, component: undefined }),
                };
                CommonPropsAbility.setAttr.call(instance, 'data-id', '123');
                expect(el.getAttribute('data-id')).toBe('123');
            });

            it('委托子组件', () => {
                const component = { setAttr: jest.fn() };
                const instance = {
                    _resolveNodeTarget: jest.fn().mockReturnValue({ el: undefined, component }),
                };
                CommonPropsAbility.setAttr.call(instance, 'data-id', '123');
                expect(component.setAttr).toHaveBeenCalledWith('data-id', '123');
            });
        });

        describe('removeAttr', () => {
            it('移除 HTML 属性', () => {
                const el = document.createElement('div');
                el.setAttribute('data-id', '123');
                const instance = {
                    _resolveNodeTarget: jest.fn().mockReturnValue({ el, component: undefined }),
                };
                CommonPropsAbility.removeAttr.call(instance, 'data-id');
                expect(el.hasAttribute('data-id')).toBe(false);
            });

            it('委托子组件', () => {
                const component = { removeAttr: jest.fn() };
                const instance = {
                    _resolveNodeTarget: jest.fn().mockReturnValue({ el: undefined, component }),
                };
                CommonPropsAbility.removeAttr.call(instance, 'data-id');
                expect(component.removeAttr).toHaveBeenCalledWith('data-id');
            });
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

        it('setNodeAriaChecked 委托 _markNodeDirty', () => {
            const instance = { _markNodeDirty: jest.fn() };
            CommonPropsAbility.setNodeAriaChecked.call(instance, 'true', 'icon');
            expect(instance._markNodeDirty).toHaveBeenCalledWith('icon', { ariaChecked: 'true' });
        });

        it('setNodeAriaDisabled 委托 _markNodeDirty', () => {
            const instance = { _markNodeDirty: jest.fn() };
            CommonPropsAbility.setNodeAriaDisabled.call(instance, 'true', 'icon');
            expect(instance._markNodeDirty).toHaveBeenCalledWith('icon', { ariaDisabled: 'true' });
        });

        it('setNodeAriaExpanded 委托 _markNodeDirty', () => {
            const instance = { _markNodeDirty: jest.fn() };
            CommonPropsAbility.setNodeAriaExpanded.call(instance, 'true', 'icon');
            expect(instance._markNodeDirty).toHaveBeenCalledWith('icon', { ariaExpanded: 'true' });
        });

        it('setNodeAriaSelected 委托 _markNodeDirty', () => {
            const instance = { _markNodeDirty: jest.fn() };
            CommonPropsAbility.setNodeAriaSelected.call(instance, 'true', 'icon');
            expect(instance._markNodeDirty).toHaveBeenCalledWith('icon', { ariaSelected: 'true' });
        });

        it('setNodeAriaHidden 委托 _markNodeDirty', () => {
            const instance = { _markNodeDirty: jest.fn() };
            CommonPropsAbility.setNodeAriaHidden.call(instance, 'true', 'icon');
            expect(instance._markNodeDirty).toHaveBeenCalledWith('icon', { ariaHidden: 'true' });
        });

        it('setNodeHint 委托 _markNodeDirty', () => {
            const instance = { _markNodeDirty: jest.fn() };
            CommonPropsAbility.setNodeHint.call(instance, 'tooltip', 'icon');
            expect(instance._markNodeDirty).toHaveBeenCalledWith('icon', { hint: 'tooltip' });
        });

        it('setNodeWidth 委托 _markNodeDirty', () => {
            const instance = { _markNodeDirty: jest.fn() };
            CommonPropsAbility.setNodeWidth.call(instance, '100px', 'icon');
            expect(instance._markNodeDirty).toHaveBeenCalledWith('icon', { width: '100px' });
        });

        it('setNodeHeight 委托 _markNodeDirty', () => {
            const instance = { _markNodeDirty: jest.fn() };
            CommonPropsAbility.setNodeHeight.call(instance, '50px', 'icon');
            expect(instance._markNodeDirty).toHaveBeenCalledWith('icon', { height: '50px' });
        });

        it('setNodeX 委托 _markNodeDirty', () => {
            const instance = { _markNodeDirty: jest.fn() };
            CommonPropsAbility.setNodeX.call(instance, '10px', 'icon');
            expect(instance._markNodeDirty).toHaveBeenCalledWith('icon', { x: '10px' });
        });

        it('setNodeY 委托 _markNodeDirty', () => {
            const instance = { _markNodeDirty: jest.fn() };
            CommonPropsAbility.setNodeY.call(instance, '20px', 'icon');
            expect(instance._markNodeDirty).toHaveBeenCalledWith('icon', { y: '20px' });
        });

        it('setNodeMargin 委托 _markNodeDirty', () => {
            const instance = { _markNodeDirty: jest.fn() };
            CommonPropsAbility.setNodeMargin.call(instance, '10px', 'icon');
            expect(instance._markNodeDirty).toHaveBeenCalledWith('icon', { margin: '10px' });
        });

        it('setNodePadding 委托 _markNodeDirty', () => {
            const instance = { _markNodeDirty: jest.fn() };
            CommonPropsAbility.setNodePadding.call(instance, '5px', 'icon');
            expect(instance._markNodeDirty).toHaveBeenCalledWith('icon', { padding: '5px' });
        });

        it('setNodeFontSize 委托 _markNodeDirty', () => {
            const instance = { _markNodeDirty: jest.fn() };
            CommonPropsAbility.setNodeFontSize.call(instance, '14px', 'icon');
            expect(instance._markNodeDirty).toHaveBeenCalledWith('icon', { fontSize: '14px' });
        });

        it('setNodeColor 委托 _markNodeDirty', () => {
            const instance = { _markNodeDirty: jest.fn() };
            CommonPropsAbility.setNodeColor.call(instance, '#333', 'icon');
            expect(instance._markNodeDirty).toHaveBeenCalledWith('icon', { color: '#333' });
        });

        it('setNodeBg 委托 _markNodeDirty', () => {
            const instance = { _markNodeDirty: jest.fn() };
            CommonPropsAbility.setNodeBg.call(instance, '#fff', 'icon');
            expect(instance._markNodeDirty).toHaveBeenCalledWith('icon', { bg: '#fff' });
        });

        it('setNodeCursor 委托 _markNodeDirty', () => {
            const instance = { _markNodeDirty: jest.fn() };
            CommonPropsAbility.setNodeCursor.call(instance, 'pointer', 'icon');
            expect(instance._markNodeDirty).toHaveBeenCalledWith('icon', { cursor: 'pointer' });
        });

        it('setNodeBorder 委托 _markNodeDirty', () => {
            const instance = { _markNodeDirty: jest.fn() };
            CommonPropsAbility.setNodeBorder.call(instance, '1px solid #ccc', 'icon');
            expect(instance._markNodeDirty).toHaveBeenCalledWith('icon', {
                border: '1px solid #ccc',
            });
        });

        it('setNodeStyle 默认 nodeName 为 root', () => {
            const instance = { _markNodeDirty: jest.fn() };
            CommonPropsAbility.setNodeStyle.call(instance, 'color: red');
            expect(instance._markNodeDirty).toHaveBeenCalledWith('root', { style: 'color: red' });
        });

        it('setNodeHidden 默认 nodeName 为 root', () => {
            const instance = { _markNodeDirty: jest.fn() };
            CommonPropsAbility.setNodeHidden.call(instance, true);
            expect(instance._markNodeDirty).toHaveBeenCalledWith('root', { hidden: true });
        });

        it('setNodeDisabled 默认 nodeName 为 root', () => {
            const instance = { _markNodeDirty: jest.fn() };
            CommonPropsAbility.setNodeDisabled.call(instance, true);
            expect(instance._markNodeDirty).toHaveBeenCalledWith('root', { disabled: true });
        });

        it('setNodeProp 默认 nodeName 为 root', () => {
            const instance = { _markNodeDirty: jest.fn() };
            CommonPropsAbility.setNodeProp.call(instance, 'cls', 'active');
            expect(instance._markNodeDirty).toHaveBeenCalledWith('root', { cls: 'active' });
        });

        it('setNodeX 默认 nodeName 为 root', () => {
            const instance = { _markNodeDirty: jest.fn() };
            CommonPropsAbility.setNodeX.call(instance, '10px');
            expect(instance._markNodeDirty).toHaveBeenCalledWith('root', { x: '10px' });
        });

        it('setNodeY 默认 nodeName 为 root', () => {
            const instance = { _markNodeDirty: jest.fn() };
            CommonPropsAbility.setNodeY.call(instance, '20px');
            expect(instance._markNodeDirty).toHaveBeenCalledWith('root', { y: '20px' });
        });

        it('setNodeMargin 默认 nodeName 为 root', () => {
            const instance = { _markNodeDirty: jest.fn() };
            CommonPropsAbility.setNodeMargin.call(instance, '10px');
            expect(instance._markNodeDirty).toHaveBeenCalledWith('root', { margin: '10px' });
        });

        it('setNodePadding 默认 nodeName 为 root', () => {
            const instance = { _markNodeDirty: jest.fn() };
            CommonPropsAbility.setNodePadding.call(instance, '5px');
            expect(instance._markNodeDirty).toHaveBeenCalledWith('root', { padding: '5px' });
        });

        it('setNodeFontSize 默认 nodeName 为 root', () => {
            const instance = { _markNodeDirty: jest.fn() };
            CommonPropsAbility.setNodeFontSize.call(instance, '14px');
            expect(instance._markNodeDirty).toHaveBeenCalledWith('root', { fontSize: '14px' });
        });

        it('setNodeColor 默认 nodeName 为 root', () => {
            const instance = { _markNodeDirty: jest.fn() };
            CommonPropsAbility.setNodeColor.call(instance, '#333');
            expect(instance._markNodeDirty).toHaveBeenCalledWith('root', { color: '#333' });
        });

        it('setNodeBg 默认 nodeName 为 root', () => {
            const instance = { _markNodeDirty: jest.fn() };
            CommonPropsAbility.setNodeBg.call(instance, '#fff');
            expect(instance._markNodeDirty).toHaveBeenCalledWith('root', { bg: '#fff' });
        });

        it('setNodeCursor 默认 nodeName 为 root', () => {
            const instance = { _markNodeDirty: jest.fn() };
            CommonPropsAbility.setNodeCursor.call(instance, 'pointer');
            expect(instance._markNodeDirty).toHaveBeenCalledWith('root', { cursor: 'pointer' });
        });

        it('setNodeBorder 默认 nodeName 为 root', () => {
            const instance = { _markNodeDirty: jest.fn() };
            CommonPropsAbility.setNodeBorder.call(instance, '1px solid #ccc');
            expect(instance._markNodeDirty).toHaveBeenCalledWith('root', {
                border: '1px solid #ccc',
            });
        });

        it('addCls 无 target 时不报错', () => {
            const instance = {
                _resolveNodeTarget: jest
                    .fn()
                    .mockReturnValue({ el: undefined, component: undefined }),
            };
            expect(() => CommonPropsAbility.addCls.call(instance, 'active')).not.toThrow();
        });

        it('removeCls 无 target 时不报错', () => {
            const instance = {
                _resolveNodeTarget: jest
                    .fn()
                    .mockReturnValue({ el: undefined, component: undefined }),
            };
            expect(() => CommonPropsAbility.removeCls.call(instance, 'active')).not.toThrow();
        });

        it('toggleCls 无 target 时不报错', () => {
            const instance = {
                _resolveNodeTarget: jest
                    .fn()
                    .mockReturnValue({ el: undefined, component: undefined }),
            };
            expect(() => CommonPropsAbility.toggleCls.call(instance, 'active')).not.toThrow();
        });

        it('setAttr 无 target 时不报错', () => {
            const instance = {
                _resolveNodeTarget: jest
                    .fn()
                    .mockReturnValue({ el: undefined, component: undefined }),
            };
            expect(() => CommonPropsAbility.setAttr.call(instance, 'data-id', '123')).not.toThrow();
        });

        it('removeAttr 无 target 时不报错', () => {
            const instance = {
                _resolveNodeTarget: jest
                    .fn()
                    .mockReturnValue({ el: undefined, component: undefined }),
            };
            expect(() => CommonPropsAbility.removeAttr.call(instance, 'data-id')).not.toThrow();
        });

        it('removeCls 委托子组件', () => {
            const component = { removeCls: jest.fn() };
            const instance = {
                _resolveNodeTarget: jest.fn().mockReturnValue({ el: undefined, component }),
            };
            CommonPropsAbility.removeCls.call(instance, 'active', 'icon');
            expect(instance._resolveNodeTarget).toHaveBeenCalledWith('icon');
        });

        it('addCls 指定 nodeName', () => {
            const el = document.createElement('div');
            const instance = {
                _resolveNodeTarget: jest.fn().mockReturnValue({ el, component: undefined }),
            };
            CommonPropsAbility.addCls.call(instance, 'active', 'icon');
            expect(instance._resolveNodeTarget).toHaveBeenCalledWith('icon');
        });

        it('setAttr 指定 nodeName', () => {
            const el = document.createElement('div');
            const instance = {
                _resolveNodeTarget: jest.fn().mockReturnValue({ el, component: undefined }),
            };
            CommonPropsAbility.setAttr.call(instance, 'data-id', '123', 'icon');
            expect(instance._resolveNodeTarget).toHaveBeenCalledWith('icon');
        });

        it('removeAttr 指定 nodeName', () => {
            const el = document.createElement('div');
            el.setAttribute('data-id', '123');
            const instance = {
                _resolveNodeTarget: jest.fn().mockReturnValue({ el, component: undefined }),
            };
            CommonPropsAbility.removeAttr.call(instance, 'data-id', 'icon');
            expect(instance._resolveNodeTarget).toHaveBeenCalledWith('icon');
        });
    });
});
