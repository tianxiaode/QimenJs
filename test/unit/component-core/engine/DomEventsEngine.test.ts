import { DomEventsEngine } from '@/component-core/engine/DomEventsEngine';
import type { DomEventsMap } from '@/component-core/types/tpl-events';

function makeEl() {
    return document.createElement('div');
}

/** 模拟 Button 构造函数（带 _type 用于类型查找） */
function ButtonCtor() {}
(ButtonCtor as any)._type = 'Button';

/** 创建一个 Button mock 组件 */
function makeButton(action: string = '') {
    const el = makeEl();
    return {
        el,
        action,
        nodeMap: {},
        constructor: ButtonCtor,
    };
}

function makeInstance(domEvents?: DomEventsMap) {
    const cleanups: (() => void)[] = [];
    const el = makeEl();
    const btnEl = makeEl();
    const actionBtnEl = makeEl();
    const headerEl = makeEl();
    headerEl.appendChild(actionBtnEl);
    el.appendChild(btnEl);
    el.appendChild(headerEl);
    const instance: any = {
        el,
        domEvents,
        nodeMap: {
            toolbar: {
                component: {
                    el: btnEl,
                    action: 'save',
                    nodeMap: {},
                },
            },
            header: {
                component: {
                    el: headerEl,
                    action: '',
                    nodeMap: {
                        action: {
                            component: {
                                el: actionBtnEl,
                                action: 'collapse',
                                nodeMap: {},
                                constructor: ButtonCtor,
                            },
                        },
                    },
                },
            },
        },
        nodeMapMgr: { getAll: () => instance.nodeMap },
        on: jest.fn(),
        off: jest.fn(),
        bind: jest.fn(),
        onCleanup: jest.fn((fn: () => void) => cleanups.push(fn)),
        emit: jest.fn(),
        bridgeEmit: jest.fn(),
        entityEmit: jest.fn(),
        routerEmit: jest.fn(),
        systemEmit: jest.fn(),
        bridgeKey: 'testBridge',
        entityKey: 'testEntity',
        routeKey: 'testRoute',
        constructor: { name: 'TestComponent' },
        _currentEventContext: undefined,
        _cleanups: cleanups,
    };
    return { instance, btnEl, actionBtnEl, cleanups };
}

/**
 * 模拟 Panel 组件：嵌了 Header 组件，Header 里有 action 按钮和 toolsLeft ItemGroup
 *
 * nodeMap 结构：
 *   Panel: { header: Header }
 *     Header: { action: Button, toolsLeft: ItemGroup }
 *       ItemGroup: { item-1: Button(action=save), item-2: Button(action=edit) }
 */
function makePanelInstance(domEvents?: DomEventsMap) {
    const cleanups: (() => void)[] = [];

    // action 按钮（Button 类型）
    const actionBtnEl = makeEl();
    const actionBtn = makeButton('');
    actionBtn.el = actionBtnEl;

    // toolsLeft ItemGroup 内的 save 按钮
    const saveBtnEl = makeEl();
    const saveBtn = makeButton('save');
    saveBtn.el = saveBtnEl;

    // toolsLeft ItemGroup 内的 edit 按钮
    const editBtnEl = makeEl();
    const editBtn = makeButton('edit');
    editBtn.el = editBtnEl;

    // toolsLeft ItemGroup（容器，isItemContainer=true）
    const toolsLeftEl = makeEl();
    toolsLeftEl.appendChild(saveBtnEl);
    toolsLeftEl.appendChild(editBtnEl);
    const toolsLeftItemGroup: any = {
        el: toolsLeftEl,
        action: '',
        isItemContainer: true,
        _items: [
            { component: saveBtn, el: saveBtnEl },
            { component: editBtn, el: editBtnEl },
        ],
        getTargetItem(target: Element) {
            for (const item of this._items) {
                if (item.component.containsElement?.('', target) || item.el.contains(target)) {
                    const ctor = item.component.constructor;
                    return {
                        component: item.component,
                        type: ctor?._type || '',
                        index: this._items.indexOf(item),
                    };
                }
            }
            return null;
        },
    };

    // Header 组件
    const headerEl = makeEl();
    headerEl.appendChild(actionBtnEl);
    headerEl.appendChild(toolsLeftEl);
    const headerComponent: any = {
        el: headerEl,
        action: '',
        nodeMap: {
            action: { component: actionBtn },
            toolsLeft: { component: toolsLeftItemGroup },
        },
    };
    headerComponent.nodeMapMgr = { getAll: () => headerComponent.nodeMap };

    // Panel 组件
    const panelEl = makeEl();
    panelEl.appendChild(headerEl);
    const instance: any = {
        el: panelEl,
        domEvents,
        nodeMap: {
            header: { component: headerComponent },
        },
        nodeMapMgr: { getAll: () => instance.nodeMap },
        on: jest.fn(),
        off: jest.fn(),
        bind: jest.fn(),
        onCleanup: jest.fn((fn: () => void) => cleanups.push(fn)),
        emit: jest.fn(),
        bridgeEmit: jest.fn(),
        entityEmit: jest.fn(),
        routerEmit: jest.fn(),
        systemEmit: jest.fn(),
        bridgeKey: 'testBridge',
        entityKey: 'testEntity',
        routeKey: 'testRoute',
        constructor: { name: 'PanelComponent' },
        _currentEventContext: undefined,
        _cleanups: cleanups,
    };

    return {
        instance,
        actionBtnEl,
        saveBtnEl,
        editBtnEl,
        toolsLeftEl,
        headerEl,
        panelEl,
        cleanups,
    };
}

/**
 * 模拟 Accordion → Panel → Header → action 的结构
 *
 * AccordionComponent (isItemContainer, _items=[Panel])
 *   Panel.nodeMap: { header: HeaderComponent }
 *     Header.nodeMap: { action: Button(action='collapse') }
 */
function makeAccordionInstance(domEvents?: DomEventsMap) {
    const cleanups: (() => void)[] = [];

    // action 按钮
    const actionBtnEl = makeEl();
    const actionBtn = makeButton('collapse');
    actionBtn.el = actionBtnEl;

    // Header 组件
    const headerEl = makeEl();
    headerEl.appendChild(actionBtnEl);
    const headerComp: any = {
        el: headerEl,
        action: '',
        nodeMap: { action: { component: actionBtn } },
    };
    headerComp.nodeMapMgr = { getAll: () => headerComp.nodeMap };

    // Panel 组件（构造函数带 _type='Panel'）
    function PanelCtor() {}
    (PanelCtor as any)._type = 'Panel';
    const panelEl = makeEl();
    panelEl.appendChild(headerEl);
    const panelComp: any = {
        el: panelEl,
        action: '',
        constructor: PanelCtor,
        nodeMap: { header: { component: headerComp } },
    };
    panelComp.nodeMapMgr = { getAll: () => panelComp.nodeMap };

    // Accordion 组件（isItemContainer, _items 含 Panel）
    const accordionEl = makeEl();
    accordionEl.appendChild(panelEl);
    const instance: any = {
        el: accordionEl,
        domEvents,
        nodeMap: { itemContainer: { el: makeEl() } },
        nodeMapMgr: { getAll: () => instance.nodeMap },
        isItemContainer: true,
        _items: [{ component: panelComp, el: panelEl }],
        getTargetItem(target: Element) {
            for (let i = 0; i < this._items.length; i++) {
                if (this._items[i].el.contains(target)) {
                    return { component: this._items[i].component, type: 'Panel', index: i };
                }
            }
            return null;
        },
        on: jest.fn(),
        off: jest.fn(),
        bind: jest.fn(),
        onCleanup: jest.fn((fn: () => void) => cleanups.push(fn)),
        emit: jest.fn(),
        bridgeEmit: jest.fn(),
        entityEmit: jest.fn(),
        routerEmit: jest.fn(),
        systemEmit: jest.fn(),
        bridgeKey: 'testBridge',
        entityKey: 'testEntity',
        routeKey: 'testRoute',
        constructor: { name: 'AccordionComponent' },
        _currentEventContext: undefined,
        _cleanups: cleanups,
    };

    return { instance, actionBtnEl, panelEl, accordionEl, cleanups };
}

describe('DomEventsEngine', () => {
    describe('compileDomEvents', () => {
        it('编译三层嵌套为扁平规则', () => {
            const domEvents: DomEventsMap = {
                click: {
                    'toolbar.Button': {
                        save: { handler: true, emits: ['save'] },
                    },
                },
            };
            const rules = DomEventsEngine.compileDomEvents(domEvents);
            expect(rules).toHaveLength(1);
            expect(rules[0].event).toBe('click');
            expect(rules[0].componentPath).toBe('toolbar.Button');
            expect(rules[0].action).toBe('save');
            expect(rules[0].handler).toBe(true);
            expect(rules[0].emits).toEqual(['save']);
        });

        it('多个事件多个路径编译为多条规则', () => {
            const domEvents: DomEventsMap = {
                click: {
                    'toolbar.Button': {
                        save: { handler: true },
                        create: { handler: true },
                    },
                },
                keypress: {
                    'toolbar.Button': {
                        save: { handler: true },
                    },
                },
            };
            const rules = DomEventsEngine.compileDomEvents(domEvents);
            expect(rules).toHaveLength(3);
        });

        it('空 action 的路径编译', () => {
            const domEvents: DomEventsMap = {
                click: {
                    header: {
                        '': { handler: true },
                    },
                },
            };
            const rules = DomEventsEngine.compileDomEvents(domEvents);
            expect(rules).toHaveLength(1);
            expect(rules[0].action).toBe('');
        });

        it('空 domEvents 返回空数组', () => {
            expect(DomEventsEngine.compileDomEvents({})).toEqual([]);
        });

        describe('隐式 root 简写（configKey + 基本类型值）', () => {
            it('{ handler: "method" } 自动推断为 root 委托', () => {
                const domEvents: DomEventsMap = {
                    input: { handler: '_onInput' },
                };
                const rules = DomEventsEngine.compileDomEvents(domEvents);
                expect(rules).toHaveLength(1);
                expect(rules[0].event).toBe('input');
                expect(rules[0].componentPath).toBe('root');
                expect(rules[0].action).toBe('');
                expect(rules[0].handler).toBe('_onInput');
                expect(rules[0].needsBinding).toBe(true);
            });

            it('{ handler: true } 自动推断为 root 委托', () => {
                const domEvents: DomEventsMap = {
                    click: { handler: true },
                };
                const rules = DomEventsEngine.compileDomEvents(domEvents);
                expect(rules).toHaveLength(1);
                expect(rules[0].componentPath).toBe('root');
                expect(rules[0].handler).toBe(true);
            });

            it('{ emits: ["close"] } 自动推断为 root 委托', () => {
                const domEvents: DomEventsMap = {
                    click: { emits: ['close'] },
                };
                const rules = DomEventsEngine.compileDomEvents(domEvents);
                expect(rules).toHaveLength(1);
                expect(rules[0].componentPath).toBe('root');
                expect(rules[0].emits).toEqual(['close']);
            });

            it('{ debounce: 300 } 自动推断为 root 委托', () => {
                const domEvents: DomEventsMap = {
                    input: { debounce: 300 },
                };
                const rules = DomEventsEngine.compileDomEvents(domEvents);
                expect(rules).toHaveLength(1);
                expect(rules[0].componentPath).toBe('root');
                expect(rules[0].debounce).toBe(300);
            });

            it('多个隐式 root 事件类型各自编译为独立规则', () => {
                const domEvents: DomEventsMap = {
                    input: { handler: '_onInput' },
                    keydown: { handler: '_onKeydown' },
                };
                const rules = DomEventsEngine.compileDomEvents(domEvents);
                expect(rules).toHaveLength(2);
                expect(rules[0].event).toBe('input');
                expect(rules[0].componentPath).toBe('root');
                expect(rules[0].handler).toBe('_onInput');
                expect(rules[1].event).toBe('keydown');
                expect(rules[1].componentPath).toBe('root');
                expect(rules[1].handler).toBe('_onKeydown');
            });

            it('与两层模式共存时互不干扰', () => {
                const domEvents: DomEventsMap = {
                    click: {
                        handler: '_onRootClick',          // 隐式 root 简写
                        closeBtn: { handler: true },     // 两层模式
                    },
                };
                const rules = DomEventsEngine.compileDomEvents(domEvents);
                expect(rules).toHaveLength(2);

                const rootRule = rules.find(r => r.componentPath === 'root');
                const closeBtnRule = rules.find(r => r.componentPath === 'closeBtn');
                expect(rootRule).toBeTruthy();
                expect(rootRule.handler).toBe('_onRootClick');
                expect(closeBtnRule).toBeTruthy();
                expect(closeBtnRule.handler).toBe(true);
            });

            it('与三层模式共存时互不干扰', () => {
                const domEvents: DomEventsMap = {
                    click: {
                        handler: '_onRootClick',                  // 隐式 root 简写
                        toolbar: { save: { handler: true } },      // 三层模式
                    },
                };
                const rules = DomEventsEngine.compileDomEvents(domEvents);
                expect(rules).toHaveLength(2);

                const rootRule = rules.find(r => r.componentPath === 'root');
                const saveRule = rules.find(r => r.action === 'save');
                expect(rootRule).toBeTruthy();
                expect(rootRule.handler).toBe('_onRootClick');
                expect(saveRule).toBeTruthy();
                expect(saveRule.componentPath).toBe('toolbar');
            });

            it('非配置键的字符串路径不受影响', () => {
                // 'closeBtn' 不是配置键，{ closeBtn: '_onClick' } 不应该被当作隐式 root
                // 但实际上 _isDomEventConfig('_onClick') 返回 false（不是 object）
                // 所以它会进入三层模式分支 — 这与改动前行为一致
                const domEvents: DomEventsMap = {
                    click: {
                        closeBtn: '_onCloseClick',
                    },
                };
                const rules = DomEventsEngine.compileDomEvents(domEvents);
                // 行为与改动前一致：closeBtn 被当作 componentPath，值是字符串
                // 进入三层模式，Object.entries('_onCloseClick') 产生多条规则
                expect(rules.length).toBeGreaterThan(0);
                // 验证至少有一条规则的 componentPath 是 'closeBtn'
                expect(rules[0].componentPath).toBe('closeBtn');
            });
        });
    });

    describe('bindDomEvents', () => {
        it('无 domEvents 时跳过', () => {
            const { instance } = makeInstance();
            expect(() => DomEventsEngine.bindDomEvents(instance)).not.toThrow();
        });

        it('绑定 DOM 事件并注册 onCleanup', () => {
            const domEvents: DomEventsMap = {
                click: {
                    'toolbar.Button': {
                        save: { handler: true },
                    },
                },
            };
            const { instance, cleanups } = makeInstance(domEvents);

            DomEventsEngine.bindDomEvents(instance);

            expect(instance.bind).toHaveBeenCalled();
            expect(instance.on).toHaveBeenCalled();
            expect(instance.onCleanup).toHaveBeenCalled();
        });

        it('focus/blur 用 capture', () => {
            const domEvents: DomEventsMap = {
                focus: {
                    'toolbar.Button': {
                        save: { handler: true },
                    },
                },
            };
            const { instance } = makeInstance(domEvents);

            DomEventsEngine.bindDomEvents(instance);

            expect(instance.bind).toHaveBeenCalledWith(instance.el, 'focus', {
                capture: true,
                delegated: true,
            });
        });
    });

    describe('handleDelegatedEvent', () => {
        it('匹配路径和 action 时调用 handler（方法名取路径首段 nodeName）', () => {
            const domEvents: DomEventsMap = {
                click: {
                    toolbar: {
                        save: { handler: true },
                    },
                },
            };
            const { instance, btnEl } = makeInstance(domEvents);
            instance.onToolbarSaveClick = jest.fn();

            DomEventsEngine.bindDomEvents(instance);

            const domEvt = { type: 'click', target: btnEl };
            const rules = instance.constructor._domEventRules;
            DomEventsEngine.handleDelegatedEvent(instance, domEvt, rules);

            expect(instance.onToolbarSaveClick).toHaveBeenCalled();
        });

        it('无 action 时方法名为 on{NodeName}{Event}', () => {
            const domEvents: DomEventsMap = {
                click: {
                    header: {
                        '': { handler: true },
                    },
                },
            };
            const { instance } = makeInstance(domEvents);
            instance.onHeaderClick = jest.fn();

            DomEventsEngine.bindDomEvents(instance);

            const headerEl = instance.nodeMap.header.component.el;
            const domEvt = { type: 'click', target: headerEl };
            const rules = instance.constructor._domEventRules;
            DomEventsEngine.handleDelegatedEvent(instance, domEvt, rules);

            expect(instance.onHeaderClick).toHaveBeenCalled();
        });

        it('target 不在子组件 el 内时不匹配', () => {
            const domEvents: DomEventsMap = {
                click: {
                    toolbar: {
                        save: { handler: true },
                    },
                },
            };
            const { instance } = makeInstance(domEvents);
            instance.onToolbarSaveClick = jest.fn();

            DomEventsEngine.bindDomEvents(instance);

            const otherEl = makeEl();
            const domEvt = { type: 'click', target: otherEl };
            const rules = instance.constructor._domEventRules;
            DomEventsEngine.handleDelegatedEvent(instance, domEvt, rules);

            expect(instance.onToolbarSaveClick).not.toHaveBeenCalled();
        });

        it('事件类型不匹配时不触发', () => {
            const domEvents: DomEventsMap = {
                click: {
                    toolbar: {
                        save: { handler: true },
                    },
                },
            };
            const { instance, btnEl } = makeInstance(domEvents);
            instance.onToolbarSaveClick = jest.fn();

            DomEventsEngine.bindDomEvents(instance);

            const domEvt = { type: 'keypress', target: btnEl };
            const rules = instance.constructor._domEventRules;
            DomEventsEngine.handleDelegatedEvent(instance, domEvt, rules);

            expect(instance.onToolbarSaveClick).not.toHaveBeenCalled();
        });

        it('无 target 时跳过', () => {
            const { instance } = makeInstance();
            const rules: any[] = [];
            expect(() => DomEventsEngine.handleDelegatedEvent(instance, {}, rules)).not.toThrow();
        });

        it('nodeMap 中找不到首段节点时不匹配', () => {
            const domEvents: DomEventsMap = {
                click: {
                    nonExistentNode: {
                        save: { handler: true },
                    },
                },
            };
            const { instance, btnEl } = makeInstance(domEvents);
            instance.onNonExistentNodeSaveClick = jest.fn();

            DomEventsEngine.bindDomEvents(instance);

            const domEvt = { type: 'click', target: btnEl };
            const rules = instance.constructor._domEventRules;
            DomEventsEngine.handleDelegatedEvent(instance, domEvt, rules);

            expect(instance.onNonExistentNodeSaveClick).not.toHaveBeenCalled();
        });
    });

    describe('_matchPath', () => {
        it('单段路径用 nodeMap 首段定位', () => {
            const { instance, btnEl } = makeInstance();
            const result = DomEventsEngine._matchPath(instance, 'toolbar', btnEl);
            expect(result).not.toBeNull();
            expect(result.el).toBe(btnEl);
        });

        it('首段不在 nodeMap 中返回 null', () => {
            const { instance, btnEl } = makeInstance();
            const result = DomEventsEngine._matchPath(instance, 'nonExistent', btnEl);
            expect(result).toBeNull();
        });

        it('target 不在组件 el 内返回 null', () => {
            const { instance } = makeInstance();
            const otherEl = makeEl();
            const result = DomEventsEngine._matchPath(instance, 'toolbar', otherEl);
            expect(result).toBeNull();
        });

        describe('多段路径跨组件遍历（Panel → Header → action Button）', () => {
            it('"header.action" 逐段 nodeMap 定位到嵌套按钮', () => {
                const { instance, actionBtnEl } = makePanelInstance();
                const result = DomEventsEngine._matchPath(instance, 'header.action', actionBtnEl);
                expect(result).not.toBeNull();
                expect(result.el).toBe(actionBtnEl);
            });

            it('中间段 nodeMap 找不到且类型也不匹配返回 null', () => {
                const { instance, actionBtnEl } = makePanelInstance();
                const result = DomEventsEngine._matchPath(instance, 'header.nonExistent', actionBtnEl);
                expect(result).toBeNull();
            });

            it('末段 target 不在 el 内返回 null', () => {
                const { instance } = makePanelInstance();
                const otherEl = makeEl();
                const result = DomEventsEngine._matchPath(instance, 'header.action', otherEl);
                expect(result).toBeNull();
            });
        });

        describe('按类型名查找（nodeMap 找不到时 fallback）', () => {
            it('"header.toolsLeft.Button" 按类型找到 ItemGroup 内的 Button', () => {
                const { instance, saveBtnEl } = makePanelInstance();
                const result = DomEventsEngine._matchPath(instance, 'header.toolsLeft.Button', saveBtnEl);
                expect(result).not.toBeNull();
                expect(result.el).toBe(saveBtnEl);
                expect(result.action).toBe('save');
            });

            it('类型不匹配返回 null', () => {
                const { instance, saveBtnEl } = makePanelInstance();
                const result = DomEventsEngine._matchPath(instance, 'header.toolsLeft.NonExistentType', saveBtnEl);
                expect(result).toBeNull();
            });
        });

        describe('单段路径深入查找容器（ItemGroup 子按钮）', () => {
            it('"header.toolsLeft" 深入查找到 save 按钮', () => {
                const { instance, saveBtnEl } = makePanelInstance();
                const result = DomEventsEngine._matchPath(instance, 'header.toolsLeft', saveBtnEl);
                expect(result).not.toBeNull();
                expect(result.el).toBe(saveBtnEl);
                expect(result.action).toBe('save');
            });

            it('"header.toolsLeft" 深入查找到 edit 按钮', () => {
                const { instance, editBtnEl } = makePanelInstance();
                const result = DomEventsEngine._matchPath(instance, 'header.toolsLeft', editBtnEl);
                expect(result).not.toBeNull();
                expect(result.el).toBe(editBtnEl);
                expect(result.action).toBe('edit');
            });

            it('target 是容器本身时返回容器', () => {
                const { instance, toolsLeftEl } = makePanelInstance();
                const result = DomEventsEngine._matchPath(instance, 'header.toolsLeft', toolsLeftEl);
                expect(result).not.toBeNull();
                expect(result.el).toBe(toolsLeftEl);
            });
        });
    });

    describe('Panel 使用 Header 场景 — handleDelegatedEvent', () => {
        it('多段路径：header.action 点击 → onHeaderActionClick', () => {
            const domEvents: DomEventsMap = {
                click: {
                    'header.action': { '': { handler: true } },
                },
            };
            const { instance, actionBtnEl } = makePanelInstance(domEvents);
            instance.onHeaderActionClick = jest.fn();

            DomEventsEngine.bindDomEvents(instance);
            const domEvt = { type: 'click', target: actionBtnEl };
            const rules = instance.constructor._domEventRules;
            DomEventsEngine.handleDelegatedEvent(instance, domEvt, rules);

            expect(instance.onHeaderActionClick).toHaveBeenCalled();
        });

        it('ItemGroup 深入查找：save 按钮 → onHeaderToolsLeftSaveClick', () => {
            const domEvents: DomEventsMap = {
                click: {
                    'header.toolsLeft': {
                        save: { handler: true },
                    },
                },
            };
            const { instance, saveBtnEl } = makePanelInstance(domEvents);
            instance.onHeaderToolsLeftSaveClick = jest.fn();

            DomEventsEngine.bindDomEvents(instance);
            const domEvt = { type: 'click', target: saveBtnEl };
            const rules = instance.constructor._domEventRules;
            DomEventsEngine.handleDelegatedEvent(instance, domEvt, rules);

            expect(instance.onHeaderToolsLeftSaveClick).toHaveBeenCalled();
        });

        it('ItemGroup 深入查找：edit 按钮 → onHeaderToolsLeftEditClick', () => {
            const domEvents: DomEventsMap = {
                click: {
                    'header.toolsLeft': {
                        edit: { handler: true },
                    },
                },
            };
            const { instance, editBtnEl } = makePanelInstance(domEvents);
            instance.onHeaderToolsLeftEditClick = jest.fn();

            DomEventsEngine.bindDomEvents(instance);
            const domEvt = { type: 'click', target: editBtnEl };
            const rules = instance.constructor._domEventRules;
            DomEventsEngine.handleDelegatedEvent(instance, domEvt, rules);

            expect(instance.onHeaderToolsLeftEditClick).toHaveBeenCalled();
        });

        it('ItemGroup 深入查找：点击容器本身（不匹配 action）不触发', () => {
            const domEvents: DomEventsMap = {
                click: {
                    'header.toolsLeft': {
                        save: { handler: true },
                    },
                },
            };
            const { instance, toolsLeftEl } = makePanelInstance(domEvents);
            instance.onHeaderToolsLeftSaveClick = jest.fn();

            DomEventsEngine.bindDomEvents(instance);
            const domEvt = { type: 'click', target: toolsLeftEl };
            const rules = instance.constructor._domEventRules;
            DomEventsEngine.handleDelegatedEvent(instance, domEvt, rules);

            // toolsLeft 容器的 action=''，不匹配 'save'
            expect(instance.onHeaderToolsLeftSaveClick).not.toHaveBeenCalled();
        });
    });

    describe('_invokeHandler — 方法名推导', () => {
        it('单段路径 + action → on{NodeName}{Action}{Event}', () => {
            const { instance } = makeInstance();
            instance.onToolbarSaveClick = jest.fn();
            DomEventsEngine._invokeHandler(instance, {
                event: 'click',
                componentPath: 'toolbar',
                action: 'save',
                needsBinding: true,
            }, { type: 'click' });
            expect(instance.onToolbarSaveClick).toHaveBeenCalled();
        });

        it('多段路径 → on{Path}{Action}{Event}（完整路径 pascalCase）', () => {
            const { instance } = makeInstance();
            instance.onHeaderActionClick = jest.fn();
            DomEventsEngine._invokeHandler(instance, {
                event: 'click',
                componentPath: 'header.action',
                action: '',
                needsBinding: true,
            }, { type: 'click' });
            expect(instance.onHeaderActionClick).toHaveBeenCalled();
        });

        it('多段路径 + action → on{Path}{Action}{Event}', () => {
            const { instance } = makeInstance();
            instance.onHeaderToolsLeftSaveClick = jest.fn();
            DomEventsEngine._invokeHandler(instance, {
                event: 'click',
                componentPath: 'header.toolsLeft',
                action: 'save',
                needsBinding: true,
            }, { type: 'click' });
            expect(instance.onHeaderToolsLeftSaveClick).toHaveBeenCalled();
        });

        it('无 action → on{Path}{Event}', () => {
            const { instance } = makeInstance();
            instance.onHeaderButtonClick = jest.fn();
            DomEventsEngine._invokeHandler(instance, {
                event: 'click',
                componentPath: 'header.Button',
                action: '',
                needsBinding: true,
            }, { type: 'click' });
            expect(instance.onHeaderButtonClick).toHaveBeenCalled();
        });

        it('方法不存在时不抛异常', () => {
            const { instance } = makeInstance();
            expect(() => DomEventsEngine._invokeHandler(instance, {
                event: 'click',
                componentPath: 'noSuchNode',
                action: '',
                needsBinding: true,
            }, { type: 'click' })).not.toThrow();
        });
    });

    describe('_dispatchRule — 转发', () => {
        it('emits 转发通过 EventForwarder', () => {
            const { instance } = makeInstance();
            const rule: any = {
                event: 'click',
                componentPath: 'toolbar.Button',
                action: 'save',
                emits: ['save'],
            };

            DomEventsEngine._dispatchRule(instance, rule, { type: 'click', target: makeEl() });
            expect(instance.emit).toHaveBeenCalledWith('save', expect.anything());
        });

        it('bridges 转发通过 EventForwarder', () => {
            const { instance } = makeInstance();
            const rule: any = {
                event: 'click',
                componentPath: 'toolbar.Button',
                action: 'save',
                bridges: ['save'],
            };

            DomEventsEngine._dispatchRule(instance, rule, { type: 'click', target: makeEl() });
            expect(instance.bridgeEmit).toHaveBeenCalled();
        });

        it('entities 转发通过 EventForwarder', () => {
            const { instance } = makeInstance();
            const rule: any = {
                event: 'click',
                componentPath: 'toolbar.Button',
                action: 'save',
                entities: 'delete',
            };

            DomEventsEngine._dispatchRule(instance, rule, { type: 'click', target: makeEl() });
            expect(instance.entityEmit).toHaveBeenCalled();
        });

        it('无 handler 且无转发时不调用任何方法', () => {
            const { instance } = makeInstance();
            const rule: any = {
                event: 'click',
                componentPath: 'toolbar.Button',
                action: 'save',
            };

            DomEventsEngine._dispatchRule(instance, rule, { type: 'click', target: makeEl() });
            expect(instance.emit).not.toHaveBeenCalled();
        });
    });

    describe('buildDomEvents — 动态构建与合并', () => {
        it('buildDomEvents 返回配置与静态 domEvents 合并', () => {
            const staticEvents: DomEventsMap = {
                click: {
                    toolbar: {
                        '': { handler: true },
                    },
                },
            };
            const { instance, btnEl } = makeInstance(staticEvents);

            instance.buildDomEvents = jest.fn((props: any) => ({
                click: {
                    toolbar: {
                        save: { handler: true, emits: ['saved'] },
                    },
                },
            }));

            DomEventsEngine.bindDomEvents(instance);

            expect(instance.buildDomEvents).toHaveBeenCalledWith(instance.props);

            // 编译后的 rules 应包含两条：静态的 '' 和动态的 'save'
            const rules = instance.constructor._domEventRules;
            expect(rules).toHaveLength(2);
            expect(rules[0].action).toBe('');
            expect(rules[1].action).toBe('save');
            expect(rules[1].emits).toEqual(['saved']);
        });

        it('buildDomEvents 返回新路径，与静态路径取并集', () => {
            const staticEvents: DomEventsMap = {
                click: {
                    toolbar: {
                        save: { handler: true },
                    },
                },
            };
            const { instance } = makeInstance(staticEvents);

            instance.buildDomEvents = jest.fn(() => ({
                click: {
                    header: {
                        collapse: { handler: true },
                    },
                },
            }));

            DomEventsEngine.bindDomEvents(instance);

            const rules = instance.constructor._domEventRules;
            expect(rules).toHaveLength(2);
            expect(rules.map((r: any) => r.componentPath).sort()).toEqual(['header', 'toolbar']);
        });

        it('buildDomEvents 返回新 domEvent 类型，取并集', () => {
            const staticEvents: DomEventsMap = {
                click: {
                    toolbar: { save: { handler: true } },
                },
            };
            const { instance } = makeInstance(staticEvents);

            instance.buildDomEvents = jest.fn(() => ({
                keydown: {
                    toolbar: { enter: { handler: true } },
                },
            }));

            DomEventsEngine.bindDomEvents(instance);

            const rules = instance.constructor._domEventRules;
            expect(rules).toHaveLength(2);
            expect(rules[0].event).toBe('click');
            expect(rules[1].event).toBe('keydown');
        });

        it('buildDomEvents 返回空对象时不影响', () => {
            const staticEvents: DomEventsMap = {
                click: {
                    toolbar: { save: { handler: true } },
                },
            };
            const { instance } = makeInstance(staticEvents);

            instance.buildDomEvents = jest.fn(() => ({}));

            DomEventsEngine.bindDomEvents(instance);

            const rules = instance.constructor._domEventRules;
            expect(rules).toHaveLength(1);
        });

        it('action 相同的动态配置覆盖静态配置', () => {
            const staticEvents: DomEventsMap = {
                click: {
                    toolbar: { save: { handler: true, emits: ['old'] } },
                },
            };
            const { instance } = makeInstance(staticEvents);

            instance.buildDomEvents = jest.fn(() => ({
                click: {
                    toolbar: { save: { handler: true, emits: ['new'] } },
                },
            }));

            DomEventsEngine.bindDomEvents(instance);

            const rules = instance.constructor._domEventRules;
            expect(rules).toHaveLength(1);
            expect(rules[0].emits).toEqual(['new']);
        });

        it('无静态 domEvents 但有 buildDomEvents 时仍正常工作', () => {
            const { instance } = makeInstance();
            instance.buildDomEvents = jest.fn(() => ({
                click: {
                    header: { collapse: { handler: true } },
                },
            }));

            DomEventsEngine.bindDomEvents(instance);

            const rules = instance.constructor._domEventRules;
            expect(rules).toHaveLength(1);
            expect(rules[0].componentPath).toBe('header');
            expect(rules[0].action).toBe('collapse');
        });

        it('buildDomEvents 可基于 props 返回不同配置', () => {
            const { instance } = makeInstance();
            instance.props = { expandable: true, closable: false };

            instance.buildDomEvents = jest.fn((props: any) => {
                if (props.closable) {
                    return {
                        click: {
                            'header.action': {
                                close: { handler: true, emits: ['close'] },
                            },
                        },
                    };
                }
                return {
                    click: {
                        'header.action': {
                            collapse: { handler: true, emits: ['collapse'] },
                        },
                    },
                };
            });

            DomEventsEngine.bindDomEvents(instance);

            let rules = instance.constructor._domEventRules;
            expect(rules).toHaveLength(1);
            expect(rules[0].action).toBe('collapse');

            // 重新模拟 closable 场景
            instance.props = { expandable: true, closable: true };
            DomEventsEngine.bindDomEvents(instance);
            rules = instance.constructor._domEventRules;
            expect(rules).toHaveLength(1);
            expect(rules[0].action).toBe('close');
        });

        it('语义化 action：单路径多 action 映射不同事件', () => {
            const domEvents: DomEventsMap = {
                click: {
                    'header.toolsLeft': {
                        save: { handler: true, emits: ['save'] },
                        edit: { handler: true, emits: ['edit'] },
                    },
                },
            };
            const { instance, saveBtnEl, editBtnEl } = makePanelInstance(domEvents);

            instance.onHeaderToolsLeftSaveClick = jest.fn();
            instance.onHeaderToolsLeftEditClick = jest.fn();

            DomEventsEngine.bindDomEvents(instance);
            const rules = instance.constructor._domEventRules;

            // 点击 save 按钮
            DomEventsEngine.handleDelegatedEvent(instance, { type: 'click', target: saveBtnEl }, rules);
            expect(instance.onHeaderToolsLeftSaveClick).toHaveBeenCalled();
            expect(instance.onHeaderToolsLeftEditClick).not.toHaveBeenCalled();

            // 点击 edit 按钮
            instance.onHeaderToolsLeftSaveClick.mockClear();
            DomEventsEngine.handleDelegatedEvent(instance, { type: 'click', target: editBtnEl }, rules);
            expect(instance.onHeaderToolsLeftEditClick).toHaveBeenCalled();
            expect(instance.onHeaderToolsLeftSaveClick).not.toHaveBeenCalled();
        });

        it('[action] 占位符：空 action 匹配任何按钮，emits 替换为实际 action', () => {
            const domEvents: DomEventsMap = {
                click: {
                    'header.toolsLeft': {
                        '': { handler: true, emits: ['[action]'] },
                    },
                },
            };
            const { instance, saveBtnEl, editBtnEl } = makePanelInstance(domEvents);

            DomEventsEngine.bindDomEvents(instance);
            const rules = instance.constructor._domEventRules;

            // 检查规则编译结果
            expect(rules).toHaveLength(1);
            expect(rules[0].action).toBe('');
            expect(rules[0].emits).toEqual(['[action]']);

            // 点击 save 按钮 → 应 emit 'save'
            instance.onHeaderToolsLeftSaveClick = jest.fn();
            DomEventsEngine.handleDelegatedEvent(instance, { type: 'click', target: saveBtnEl }, rules);
            expect(instance.onHeaderToolsLeftSaveClick).toHaveBeenCalled();
            expect(instance.emit).toHaveBeenCalledWith('save', expect.anything());

            // 点击 edit 按钮 → 应 emit 'edit'
            instance.onHeaderToolsLeftEditClick = jest.fn();
            DomEventsEngine.handleDelegatedEvent(instance, { type: 'click', target: editBtnEl }, rules);
            expect(instance.onHeaderToolsLeftEditClick).toHaveBeenCalled();
            expect(instance.emit).toHaveBeenCalledWith('edit', expect.anything());
        });

        it('[action] 占位符：方法名使用实际 action 而非空字符串', () => {
            const domEvents: DomEventsMap = {
                click: {
                    'header.toolsLeft': {
                        '': { handler: true },
                    },
                },
            };
            const { instance, saveBtnEl } = makePanelInstance(domEvents);

            DomEventsEngine.bindDomEvents(instance);
            const rules = instance.constructor._domEventRules;

            // 应调用 onHeaderToolsLeftSaveClick 而非 onHeaderToolsLeftClick
            instance.onHeaderToolsLeftSaveClick = jest.fn();
            instance.onHeaderToolsLeftClick = jest.fn();

            DomEventsEngine.handleDelegatedEvent(instance, { type: 'click', target: saveBtnEl }, rules);

            expect(instance.onHeaderToolsLeftSaveClick).toHaveBeenCalled();
            expect(instance.onHeaderToolsLeftClick).not.toHaveBeenCalled();
        });

        it('buildDomEvents 返回多个 action 时正确编译', () => {
            const { instance } = makeInstance();

            instance.buildDomEvents = jest.fn(() => ({
                click: {
                    'header.action': {
                        collapse: { handler: true, emits: ['collapse'] },
                        close: { handler: true, emits: ['close'] },
                    },
                },
            }));

            DomEventsEngine.bindDomEvents(instance);

            const rules = instance.constructor._domEventRules;
            expect(rules).toHaveLength(2);
            expect(rules.map((r: any) => r.action).sort()).toEqual(['close', 'collapse']);
        });

        it('两次 bindDomEvents 应替换而非累积', () => {
            const { instance } = makeInstance();
            instance.buildDomEvents = jest.fn((props: any) => {
                if (props.version === 1) {
                    return { click: { node1: { a: { handler: true } } } };
                }
                return { click: { node2: { b: { handler: true } } } };
            });

            instance.props = { version: 1 };
            DomEventsEngine.bindDomEvents(instance);
            let rules = instance.constructor._domEventRules;
            expect(rules).toHaveLength(1);
            expect(rules[0].componentPath).toBe('node1');

            instance.props = { version: 2 };
            DomEventsEngine.bindDomEvents(instance);
            rules = instance.constructor._domEventRules;
            expect(rules).toHaveLength(1);
            expect(rules[0].componentPath).toBe('node2');
        });

        it('逗号分隔多路径编译为多条规则', () => {
            const domEvents: DomEventsMap = {
                click: {
                    'header.toolsLeft,header.toolsRight': {
                        '': { emits: ['[action]'] },
                    },
                },
            };
            const rules = DomEventsEngine.compileDomEvents(domEvents);
            expect(rules).toHaveLength(2);
            expect(rules[0].componentPath).toBe('header.toolsLeft');
            expect(rules[1].componentPath).toBe('header.toolsRight');
            expect(rules[0].wildcardAction).toBe(true);
            expect(rules[1].wildcardAction).toBe(true);
        });

        it('wildcardAction 规则匹配任何 action', () => {
            const domEvents: DomEventsMap = {
                click: {
                    'header.toolsLeft,header.toolsRight': {
                        '': { emits: ['[action]'] },
                    },
                },
            };
            const { instance, saveBtnEl, editBtnEl } = makePanelInstance(domEvents);

            DomEventsEngine.bindDomEvents(instance);
            const rules = instance.constructor._domEventRules;

            // 两个规则：toolsLeft 和 toolsRight
            expect(rules).toHaveLength(2);

            // 点击 save 按钮（在 toolsLeft 中）
            instance.emit = jest.fn();
            DomEventsEngine.handleDelegatedEvent(instance, { type: 'click', target: saveBtnEl }, rules);

            // 应匹配到 save 按钮，emit 'save'
            expect(instance.emit).toHaveBeenCalledWith('save', expect.anything());
        });

        it('wildcardAction 规则：点击不同按钮 emit 不同 action', () => {
            const domEvents: DomEventsMap = {
                click: {
                    'header.toolsLeft,header.toolsRight': {
                        '': { emits: ['[action]'] },
                    },
                },
            };
            const { instance, saveBtnEl, editBtnEl } = makePanelInstance(domEvents);

            DomEventsEngine.bindDomEvents(instance);
            const rules = instance.constructor._domEventRules;

            // 点击 save 按钮
            instance.emit = jest.fn();
            DomEventsEngine.handleDelegatedEvent(instance, { type: 'click', target: saveBtnEl }, rules);
            expect(instance.emit).toHaveBeenCalledWith('save', expect.anything());

            // 点击 edit 按钮
            instance.emit.mockClear();
            DomEventsEngine.handleDelegatedEvent(instance, { type: 'click', target: editBtnEl }, rules);
            expect(instance.emit).toHaveBeenCalledWith('edit', expect.anything());
        });

        describe('两层模式（DomEventConfig 直接作为 value）', () => {
            it('两层模式编译为单条规则，action="" 且 wildcardAction=true', () => {
                const domEvents: DomEventsMap = {
                    click: {
                        'header.action': {
                            handler: true, emits: ['[action]'],
                        },
                    },
                };
                const rules = DomEventsEngine.compileDomEvents(domEvents);
                expect(rules).toHaveLength(1);
                expect(rules[0].action).toBe('');
                expect(rules[0].wildcardAction).toBe(true);
                expect(rules[0].handler).toBe(true);
            });

            it('两层模式 + 逗号分隔多路径', () => {
                const domEvents: DomEventsMap = {
                    click: {
                        'header.toolsLeft,header.toolsRight': {
                            emits: ['[action]'],
                        },
                    },
                };
                const rules = DomEventsEngine.compileDomEvents(domEvents);
                expect(rules).toHaveLength(2);
                expect(rules[0].componentPath).toBe('header.toolsLeft');
                expect(rules[1].componentPath).toBe('header.toolsRight');
                expect(rules[0].wildcardAction).toBe(true);
                expect(rules[1].wildcardAction).toBe(true);
            });

            it('两层模式：点击 action 按钮调用对应方法', () => {
                const domEvents: DomEventsMap = {
                    click: {
                        'header.action': {
                            handler: true, emits: ['[action]'],
                        },
                    },
                };
                const { instance, actionBtnEl } = makePanelInstance(domEvents);

                // actionBtn 的 action 属性为 ''
                expect(actionBtnEl).toBeTruthy();

                // 设置 action 按钮的 action 属性为 'collapse'
                const headerComp = instance.nodeMap.header.component;
                const actionComp = headerComp.nodeMap.action.component;
                actionComp.action = 'collapse';

                DomEventsEngine.bindDomEvents(instance);
                const rules = instance.constructor._domEventRules;

                instance.onHeaderActionCollapseClick = jest.fn();
                DomEventsEngine.handleDelegatedEvent(instance, { type: 'click', target: actionBtnEl }, rules);

                expect(instance.onHeaderActionCollapseClick).toHaveBeenCalled();
            });

            it('两层模式：点击不同 action 按钮 emit 不同事件', () => {
                const domEvents: DomEventsMap = {
                    click: {
                        'header.action': {
                            emits: ['[action]'],
                        },
                    },
                };
                const { instance, actionBtnEl } = makePanelInstance(domEvents);

                const headerComp = instance.nodeMap.header.component;
                const actionComp = headerComp.nodeMap.action.component;

                // 测试 collapse
                actionComp.action = 'collapse';
                DomEventsEngine.bindDomEvents(instance);
                const rules = instance.constructor._domEventRules;

                instance.emit = jest.fn();
                DomEventsEngine.handleDelegatedEvent(instance, { type: 'click', target: actionBtnEl }, rules);
                expect(instance.emit).toHaveBeenCalledWith('collapse', expect.anything());

                // 测试 close
                actionComp.action = 'close';
                DomEventsEngine.handleDelegatedEvent(instance, { type: 'click', target: actionBtnEl }, rules);
                expect(instance.emit).toHaveBeenCalledWith('close', expect.anything());
            });

            it('两层模式：非 [action] 的 emits 不标记 wildcardAction', () => {
                const domEvents: DomEventsMap = {
                    click: {
                        'node1': {
                            handler: true, emits: ['customEvent'],
                        },
                    },
                };
                const rules = DomEventsEngine.compileDomEvents(domEvents);
                expect(rules).toHaveLength(1);
                expect(rules[0].wildcardAction).toBe(false);
                expect(rules[0].emits).toEqual(['customEvent']);
            });

            it('三层模式仍然正常工作', () => {
                const domEvents: DomEventsMap = {
                    click: {
                        'toolbar': {
                            save: { handler: true, emits: ['saved'] },
                        },
                    },
                };
                const rules = DomEventsEngine.compileDomEvents(domEvents);
                expect(rules).toHaveLength(1);
                expect(rules[0].action).toBe('save');
                expect(rules[0].wildcardAction).toBe(false);
            });
        });

        describe('跨层路径（第一段按类型查找 _items）', () => {
            it('"Panel.header.action" 第一段按类型在 _items 中查找', () => {
                const domEvents: DomEventsMap = {
                    click: {
                        'Panel.header.action': {
                            handler: true, emits: ['[action]'],
                        },
                    },
                };
                const { instance, actionBtnEl } = makeAccordionInstance(domEvents);

                DomEventsEngine.bindDomEvents(instance);
                const rules = instance.constructor._domEventRules;

                instance.onPanelHeaderActionCollapseClick = jest.fn();
                DomEventsEngine.handleDelegatedEvent(
                    instance,
                    { type: 'click', target: actionBtnEl },
                    rules
                );

                expect(instance.onPanelHeaderActionCollapseClick).toHaveBeenCalled();
                expect(instance.emit).toHaveBeenCalledWith('collapse', expect.anything());
            });

            it('action=close 时调用 onPanelHeaderActionCloseClick', () => {
                const domEvents: DomEventsMap = {
                    click: {
                        'Panel.header.action': {
                            handler: true, emits: ['[action]'],
                        },
                    },
                };
                const { instance, actionBtnEl } = makeAccordionInstance(domEvents);

                // 改 action 为 close
                const panelComp = instance._items[0].component;
                const actionBtn = panelComp.nodeMap.header.component.nodeMap.action.component;
                actionBtn.action = 'close';

                DomEventsEngine.bindDomEvents(instance);
                const rules = instance.constructor._domEventRules;

                instance.onPanelHeaderActionCloseClick = jest.fn();
                instance.onPanelHeaderActionCollapseClick = jest.fn();
                DomEventsEngine.handleDelegatedEvent(
                    instance,
                    { type: 'click', target: actionBtnEl },
                    rules
                );

                expect(instance.onPanelHeaderActionCloseClick).toHaveBeenCalled();
                expect(instance.onPanelHeaderActionCollapseClick).not.toHaveBeenCalled();
            });

            it('第一段类型不匹配时返回 null', () => {
                const domEvents: DomEventsMap = {
                    click: {
                        'Dialog.header.action': {
                            handler: true, emits: ['[action]'],
                        },
                    },
                };
                const { instance, actionBtnEl } = makeAccordionInstance(domEvents);

                DomEventsEngine.bindDomEvents(instance);
                const rules = instance.constructor._domEventRules;

                instance.onDialogHeaderActionCollapseClick = jest.fn();
                DomEventsEngine.handleDelegatedEvent(
                    instance,
                    { type: 'click', target: actionBtnEl },
                    rules
                );

                expect(instance.onDialogHeaderActionCollapseClick).not.toHaveBeenCalled();
            });
        });

        describe('自定义 handler 方法名（handler: string）', () => {
            it('handler 为字符串时直接使用该方法名', () => {
                const domEvents: DomEventsMap = {
                    click: {
                        'header.action': {
                            handler: 'onMyCustomHandler',
                            emits: ['[action]'],
                        },
                    },
                };
                const { instance, actionBtnEl } = makeInstance(domEvents);
                instance.onMyCustomHandler = jest.fn();

                DomEventsEngine.bindDomEvents(instance);
                const rules = instance.constructor._domEventRules;

                DomEventsEngine.handleDelegatedEvent(
                    instance,
                    { type: 'click', target: actionBtnEl },
                    rules
                );

                expect(instance.onMyCustomHandler).toHaveBeenCalled();
            });

            it('自定义方法名优先于自动推导', () => {
                const domEvents: DomEventsMap = {
                    click: {
                        'toolbar': {
                            save: { handler: 'onSaveHandler', emits: ['saved'] },
                        },
                    },
                };
                const { instance, btnEl } = makeInstance(domEvents);
                instance.onSaveHandler = jest.fn();
                instance.onToolbarSaveClick = jest.fn();

                DomEventsEngine.bindDomEvents(instance);
                const rules = instance.constructor._domEventRules;

                DomEventsEngine.handleDelegatedEvent(
                    instance,
                    { type: 'click', target: btnEl },
                    rules
                );

                expect(instance.onSaveHandler).toHaveBeenCalled();
                expect(instance.onToolbarSaveClick).not.toHaveBeenCalled();
            });

            it('跨层路径 + 自定义方法名', () => {
                const domEvents: DomEventsMap = {
                    click: {
                        'Panel.header.action': {
                            handler: '_onPanelAction',
                            emits: ['[action]'],
                        },
                    },
                };
                const { instance, actionBtnEl } = makeAccordionInstance(domEvents);
                instance._onPanelAction = jest.fn();
                instance.onPanelHeaderActionCollapseClick = jest.fn();

                DomEventsEngine.bindDomEvents(instance);
                const rules = instance.constructor._domEventRules;

                DomEventsEngine.handleDelegatedEvent(
                    instance,
                    { type: 'click', target: actionBtnEl },
                    rules
                );

                expect(instance._onPanelAction).toHaveBeenCalled();
                expect(instance.onPanelHeaderActionCollapseClick).not.toHaveBeenCalled();
            });
        });

        describe('隐式 root 简写与 buildDomEvents 合并', () => {
            it('静态隐式 root + 动态隐式 root 同 configKey 时动态优先', () => {
                const staticEvents: DomEventsMap = {
                    input: { handler: '_onInputV1' },
                };
                const { instance } = makeInstance(staticEvents);

                instance.buildDomEvents = jest.fn(() => ({
                    input: { handler: '_onInputV2' },
                }));

                DomEventsEngine.bindDomEvents(instance);
                const rules = instance.constructor._domEventRules;

                expect(rules).toHaveLength(1);
                expect(rules[0].componentPath).toBe('root');
                expect(rules[0].handler).toBe('_onInputV2');
            });

            it('静态隐式 root + 动态隐式 root 不同 configKey 时合并', () => {
                const staticEvents: DomEventsMap = {
                    input: { handler: '_onInput' },
                };
                const { instance } = makeInstance(staticEvents);

                instance.buildDomEvents = jest.fn(() => ({
                    input: { emits: ['inputChanged'] },
                }));

                DomEventsEngine.bindDomEvents(instance);
                const rules = instance.constructor._domEventRules;

                expect(rules).toHaveLength(1);
                expect(rules[0].componentPath).toBe('root');
                expect(rules[0].handler).toBe('_onInput');
                expect(rules[0].emits).toEqual(['inputChanged']);
            });

            it('静态隐式 root + 动态显式 root 路径时正确合并', () => {
                const staticEvents: DomEventsMap = {
                    input: { handler: '_onInput' },
                };
                const { instance } = makeInstance(staticEvents);

                instance.buildDomEvents = jest.fn(() => ({
                    input: { root: { emits: ['inputEvent'] } },
                }));

                DomEventsEngine.bindDomEvents(instance);
                const rules = instance.constructor._domEventRules;

                expect(rules).toHaveLength(1);
                expect(rules[0].componentPath).toBe('root');
                expect(rules[0].handler).toBe('_onInput');
                expect(rules[0].emits).toEqual(['inputEvent']);
            });

            it('静态两层模式 + 动态隐式 root 合并到同一 root', () => {
                const staticEvents: DomEventsMap = {
                    click: {
                        root: { handler: true },
                    },
                };
                const { instance } = makeInstance(staticEvents);

                instance.buildDomEvents = jest.fn(() => ({
                    click: { emits: ['submit'] },
                }));

                DomEventsEngine.bindDomEvents(instance);
                const rules = instance.constructor._domEventRules;

                expect(rules).toHaveLength(1);
                expect(rules[0].componentPath).toBe('root');
                expect(rules[0].handler).toBe(true);
                expect(rules[0].emits).toEqual(['submit']);
            });

            it('隐式 root 简写事件通过 root 正确分发', () => {
                const domEvents: DomEventsMap = {
                    click: { handler: '_onRootClick' },
                };
                const rootEl = makeEl();
                const { instance } = makeInstance(domEvents);
                instance.el = rootEl;
                instance.nodeMap.root = { component: instance, el: rootEl };

                instance._onRootClick = jest.fn();

                DomEventsEngine.bindDomEvents(instance);
                const rules = instance.constructor._domEventRules;

                // 模拟点击事件
                DomEventsEngine.handleDelegatedEvent(
                    instance,
                    { type: 'click', target: rootEl },
                    rules
                );

                expect(instance._onRootClick).toHaveBeenCalled();
            });
        });
    });
});
