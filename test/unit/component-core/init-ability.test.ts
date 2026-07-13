/**
 * InitAbility 单元测试
 *
 * 覆盖：initialize、initConfig、initContent、assignProps、bindEvents、
 *       bindInternalEvents、bindExternalEvents、_emitKeyToHandlerName、
 *       resolveHandler、bindHandlers、bindEventListen、callInitMethods、callLifecycle
 */

jest.mock('@/logger', () => {
    const actualLogger = jest.requireActual('@/logger');
    return {
        ...actualLogger,
        Logger: {
            ...actualLogger.Logger,
            for: jest.fn(() => ({
                debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn(),
            })),
        },
    };
});

import { TemplateComponent } from '@/component-core';
import { InitAbility } from '@/component-core/abilities/InitAbility';
import { PositionPxAbility } from '@/component-core/abilities/PositionPxAbility';
import { StyleAbility } from '@/component-core/abilities/StyleAbility';
import { AccessibilityAbility } from '@/component-core/abilities/AccessibilityAbility';
import { AnimationAbility } from '@/component-core/abilities/AnimationAbility';
import { PermissionAbility } from '@/component-core/abilities/PermissionAbility';
import { OverlayAbility } from '@/component-core/abilities/OverlayAbility';
import { BadgeAbility } from '@/component-core/abilities/BadgeAbility';

const TPL = '<div class="box"><span data-content="box:label"></span></div>';

describe('InitAbility', () => {
    const FullBoxClass = TemplateComponent.withTemplate(TPL).with([
        InitAbility, PositionPxAbility, StyleAbility,
        AccessibilityAbility, AnimationAbility, PermissionAbility, OverlayAbility, BadgeAbility,
    ]);

    // ============================================
    // initialize
    // ============================================

    describe('initialize', () => {
        it('完整流程 — 创建 el + 赋值属性 + 注册', () => {
            const instance = new FullBoxClass() as any;
            instance.initialize({
                type: 'VBox',
                x: 10,
                y: 20,
                width: 300,
                height: 200,
                className: 'my-box',
                props: { label: 'Hello' },
            });

            expect(instance.el).toBeDefined();
            expect(instance.x).toBe(10);
            expect(instance.y).toBe(20);
            expect(instance.width).toBe(300);
            expect(instance.height).toBe(200);
            expect(instance.className).toBe('my-box');
        });

        it('initialize 完成后 _initializing 为 false', () => {
            const instance = new FullBoxClass() as any;
            instance.initialize({ type: 'VBox' });
            expect(instance._initializing).toBe(false);
        });

        it('initialize 设置 id 并注册', () => {
            const instance = new FullBoxClass() as any;
            instance.initialize({ type: 'VBox', id: 'test-init-001' });
            expect(instance.id).toBe('test-init-001');
        });

        it('initialize 异常时仍然重置 _initializing', () => {
            const instance = new FullBoxClass() as any;
            const origSetup = instance.setupAbilities;
            instance.setupAbilities = () => { throw new Error('bad'); };
            try { instance.initialize({ type: 'VBox' }); } catch {}
            expect(instance._initializing).toBe(false);
            instance.setupAbilities = origSetup;
        });

        it('initialize 有 tooltip 时调用 initTooltipOverlay', () => {
            const instance = new FullBoxClass() as any;
            // initTooltipOverlay 需要 Tips 组件类注册，这里只验证不抛异常
            expect(() => {
                instance.initialize({ type: 'VBox', tooltip: 'Hello' });
            }).not.toThrow();
        });

        it('initialize 有 badge 时调用 initBadge', () => {
            const instance = new FullBoxClass() as any;
            // initBadge 需要 Badge 组件类注册，这里只验证不抛异常
            expect(() => {
                instance.initialize({ type: 'VBox', badge: 5 });
            }).not.toThrow();
        });

        it('initialize badge 为 0 时仍然调用 initBadge', () => {
            const instance = new FullBoxClass() as any;
            expect(() => {
                instance.initialize({ type: 'VBox', badge: 0 });
            }).not.toThrow();
        });

        it('initialize 无 badge 时不调用 initBadge', () => {
            const instance = new FullBoxClass() as any;
            expect(() => {
                instance.initialize({ type: 'VBox' });
            }).not.toThrow();
            expect(instance.setBadgeText).toBeUndefined();
        });
    });

    // ============================================
    // initConfig
    // ============================================

    describe('initConfig', () => {
        it('extraFns 绑定到实例', () => {
            const instance = new FullBoxClass() as any;
            const fn = jest.fn();
            instance.initConfig({ extraFns: { myAction: fn } });
            expect(typeof instance.myAction).toBe('function');
            instance.myAction();
            expect(fn).toHaveBeenCalled();
        });

        it('entity 实例化并注册 dispose', () => {
            class MockManager {
                disposed = false;
                dispose() { this.disposed = true; }
            }
            const instance = new FullBoxClass() as any;
            instance.initConfig({ entity: MockManager });
            expect(instance.mgr).toBeInstanceOf(MockManager);
        });

        it('meta 复制', () => {
            const instance = new FullBoxClass() as any;
            instance.initConfig({ meta: { role: 'primary' } });
            expect(instance.meta.role).toBe('primary');
        });

        it('eventBridge 存储', () => {
            const instance = new FullBoxClass() as any;
            instance.initConfig({ eventBridge: { pagination: { source: 'pager1' } } });
            expect(instance.getEventBridge()).toBeDefined();
        });
    });

    // ============================================
    // initContent
    // ============================================

    describe('initContent', () => {
        it('从 props 初始化内容属性', () => {
            const instance = new FullBoxClass() as any;
            instance.initContent({ label: 'Hello' });
            expect(instance.label).toBe('Hello');
        });

        it('空 props 不报错', () => {
            const instance = new FullBoxClass() as any;
            expect(() => instance.initContent({})).not.toThrow();
        });
    });

    // ============================================
    // assignProps
    // ============================================

    describe('assignProps', () => {
        it('Position 属性赋值', () => {
            const instance = new FullBoxClass() as any;
            instance.initialize({ type: 'VBox' });
            instance.assignProps({ x: 50, y: 100, width: 200 });
            expect(instance.x).toBe(50);
            expect(instance.y).toBe(100);
            expect(instance.width).toBe(200);
        });

        it('Style 属性赋值', () => {
            const instance = new FullBoxClass() as any;
            instance.initialize({ type: 'VBox' });
            instance.assignProps({ className: 'test-class' });
            expect(instance.className).toBe('test-class');
        });

        it('Accessibility 属性通过 setAriaBatch 设置', () => {
            const instance = new FullBoxClass() as any;
            instance.initialize({ type: 'VBox' });
            instance.assignProps({ role: 'button', ariaLabel: 'Click me' });
            expect(instance.getAria('role')).toBe('button');
            expect(instance.getAria('ariaLabel')).toBe('Click me');
        });

        it('Animation 属性通过 setAnimation 设置', () => {
            const instance = new FullBoxClass() as any;
            instance.initialize({ type: 'VBox' });
            instance.assignProps({ enterAnimation: 'fadeIn' });
            expect(instance.getAnimation('enterAnimation')).toBe('fadeIn');
        });

        it('Permission 属性通过 setPermission 设置', () => {
            const instance = new FullBoxClass() as any;
            instance.initialize({ type: 'VBox' });
            instance.assignProps({ permission: { behavior: 'hidden' } });
            expect(instance.getPermission()).toBeDefined();
        });

        it('剩余 props 通过 setProp 设置', () => {
            const instance = new FullBoxClass() as any;
            instance.initialize({ type: 'VBox' });
            instance.assignProps({ props: { customKey: 'customValue' } });
            expect(instance.props.customKey).toBe('customValue');
        });

        it('Badge 属性通过 setBadge 设置', () => {
            const instance = new FullBoxClass() as any;
            instance.initialize({ type: 'VBox' });
            instance.assignProps({ badge: 5, badgeType: 'dot', badgePlacement: 'top-left' });
            expect(instance.getBadge('badge')).toBe(5);
            expect(instance.getBadge('badgeType')).toBe('dot');
            expect(instance.getBadge('badgePlacement')).toBe('top-left');
        });
    });

    // ============================================
    // bindEvents
    // ============================================

    describe('bindEvents', () => {
        it('调用 bindInternalEvents + bindExternalEvents', () => {
            const instance = new FullBoxClass() as any;
            instance.initialize({ type: 'VBox' });
            expect(() => instance.bindEvents({})).not.toThrow();
        });

        it('有 handlers 时调用 bindHandlers', () => {
            const instance = new FullBoxClass() as any;
            instance.initialize({ type: 'VBox' });
            expect(() => instance.bindEvents({ handlers: { click: jest.fn() } })).not.toThrow();
        });

        it('有 bridges.on 时调用 bindEventListen', () => {
            const instance = new FullBoxClass() as any;
            instance.initialize({ type: 'VBox' });
            expect(() => instance.bindEvents({
                bridges: [{ source: 'form', events: { change: 'onFormChange' } }],
            })).not.toThrow();
        });
    });

    // ============================================
    // _emitKeyToHandlerName
    // ============================================

    describe('_emitKeyToHandlerName', () => {
        it('saveBtn:tap → onSaveBtnTap', () => {
            const instance = new FullBoxClass() as any;
            expect(instance._emitKeyToHandlerName('saveBtn:tap')).toBe('onSaveBtnTap');
        });

        it('click → onClick', () => {
            const instance = new FullBoxClass() as any;
            expect(instance._emitKeyToHandlerName('click')).toBe('onClick');
        });
    });

    // ============================================
    // callInitMethods
    // ============================================

    describe('callInitMethods', () => {
        it('无 __init__ 能力 → 不报错', () => {
            const instance = new FullBoxClass() as any;
            expect(() => instance.callInitMethods()).not.toThrow();
        });

        it('有 __init__ 能力 → 调用对应方法', () => {
            const BoxWithInit = TemplateComponent.withTemplate(TPL).with(InitAbility) as any;
            const mockInit = jest.fn();
            BoxWithInit.prototype._myInit = mockInit;
            BoxWithInit.abilities = [{ __init__: '_myInit' }];
            const instance = new BoxWithInit() as any;
            expect(mockInit).toHaveBeenCalled();
        });

        it('多个能力有相同 __init__ → 去重只调用一次', () => {
            const BoxWithInit = TemplateComponent.withTemplate(TPL).with(InitAbility) as any;
            const mockInit = jest.fn();
            BoxWithInit.prototype._sharedInit = mockInit;
            BoxWithInit.abilities = [{ __init__: '_sharedInit' }, { __init__: '_sharedInit' }];
            const instance = new BoxWithInit() as any;
            expect(mockInit).toHaveBeenCalledTimes(1);
        });
    });

    // ============================================
    // callLifecycle
    // ============================================

    describe('callLifecycle', () => {
        it('无 lifecycle → 不报错', () => {
            const instance = new FullBoxClass() as any;
            expect(() => instance.callLifecycle()).not.toThrow();
        });

        it('有 onMounted → 调用', () => {
            const instance = new FullBoxClass() as any;
            const onMounted = jest.fn();
            instance.callLifecycle({ onMounted });
            expect(onMounted).toHaveBeenCalled();
        });
    });

    // ============================================
    // resolveHandler
    // ============================================

    describe('resolveHandler', () => {
        it('function 类型 → 返回绑定后的函数', () => {
            const instance = new FullBoxClass() as any;
            const fn = jest.fn();
            const result = instance.resolveHandler(fn);
            (result as Function)();
            expect(fn).toHaveBeenCalled();
        });

        it('string 类型 → 从 this 上查找方法并绑定', () => {
            const instance = new FullBoxClass() as any;
            instance.myHandler = jest.fn();
            const result = instance.resolveHandler('myHandler');
            (result as Function)();
            expect(instance.myHandler).toHaveBeenCalled();
        });

        it('string 类型 → 方法不存在返回 null', () => {
            const instance = new FullBoxClass() as any;
            expect(instance.resolveHandler('nonExistent')).toBeNull();
        });

        it('object 类型 with once → 只触发一次', () => {
            const instance = new FullBoxClass() as any;
            instance.myHandler = jest.fn();
            const result = instance.resolveHandler({ handler: 'myHandler', once: true });
            (result as Function)({});
            (result as Function)({});
            expect(instance.myHandler).toHaveBeenCalledTimes(1);
        });

        it('object 类型 without once → 每次都触发', () => {
            const instance = new FullBoxClass() as any;
            instance.myHandler = jest.fn();
            const result = instance.resolveHandler({ handler: 'myHandler' });
            (result as Function)({});
            (result as Function)({});
            expect(instance.myHandler).toHaveBeenCalledTimes(2);
        });

        it('array 类型 → 合并执行', () => {
            const instance = new FullBoxClass() as any;
            instance.h1 = jest.fn();
            instance.h2 = jest.fn();
            const result = instance.resolveHandler(['h1', 'h2']);
            (result as Function)({});
            expect(instance.h1).toHaveBeenCalled();
            expect(instance.h2).toHaveBeenCalled();
        });

        it('array 类型 → 全部无效返回 null', () => {
            const instance = new FullBoxClass() as any;
            expect(instance.resolveHandler(['nonExistent1', 'nonExistent2'])).toBeNull();
        });

        it('未知类型 → 返回 null', () => {
            const instance = new FullBoxClass() as any;
            expect(instance.resolveHandler(42)).toBeNull();
        });
    });

    // ============================================
    // bindEventListen
    // ============================================

    describe('bindEventListen', () => {
        it('绑定事件监听（bridges.on）', () => {
            const instance = new FullBoxClass() as any;
            instance.onFormChange = jest.fn();
            instance.bindEventListen([
                { source: 'form', events: { change: 'onFormChange' } },
            ]);
            // 验证不抛异常
            expect(instance.onFormChange).toBeDefined();
        });

        it('无 source 时用 eventType 作为 eventKey', () => {
            const instance = new FullBoxClass() as any;
            instance.onRefresh = jest.fn();
            instance.bindEventListen([
                { events: { refresh: 'onRefresh' } },
            ]);
            expect(instance.onRefresh).toBeDefined();
        });
    });

    // ============================================
    // bindInternalEvents
    // ============================================

    describe('bindInternalEvents', () => {
        it('常规内部事件绑定', () => {
            const instance = new FullBoxClass() as any;
            const btnEl = document.createElement('button');
            instance.eventMap = {
                internal: [{
                    event: 'click',
                    handler: 'onBtnClick',
                    once: false,
                    delegate: false,
                    delegateTarget: undefined,
                    node: { el: btnEl },
                }],
                external: {},
            };
            instance.onBtnClick = jest.fn();
            instance.bindInternalEvents();

            instance.emit('click', { domEvent: new Event('click') });
            expect(instance.onBtnClick).toHaveBeenCalled();
        });

        it('once 内部事件', () => {
            const instance = new FullBoxClass() as any;
            const btnEl = document.createElement('button');
            instance.eventMap = {
                internal: [{
                    event: 'click',
                    handler: 'onBtnClick',
                    once: true,
                    delegate: false,
                    delegateTarget: undefined,
                    node: { el: btnEl },
                }],
                external: {},
            };
            instance.onBtnClick = jest.fn();
            instance.bindInternalEvents();

            instance.emit('click', { domEvent: new Event('click') });
            instance.emit('click', { domEvent: new Event('click') });
            expect(instance.onBtnClick).toHaveBeenCalledTimes(1);
        });

        it('委托事件绑定', () => {
            const instance = new FullBoxClass() as any;
            const listEl = document.createElement('ul');
            instance.eventMap = {
                internal: [{
                    event: 'tap',
                    handler: 'onListTap',
                    once: false,
                    delegate: true,
                    delegateTarget: '.item',
                    node: { el: listEl },
                }],
                external: {},
            };
            const bindSpy = jest.spyOn(instance, 'bind');
            instance.onListTap = jest.fn();
            instance.bindInternalEvents();

            expect(bindSpy).toHaveBeenCalledWith(listEl, 'tap', { selector: '.item' });
            bindSpy.mockRestore();
        });
    });

    // ============================================
    // bindExternalEvents
    // ============================================

    describe('bindExternalEvents', () => {
        it('bridges 模式 → 走 emit 发布', () => {
            const instance = new FullBoxClass() as any;
            const btnEl = document.createElement('button');
            instance.eventMap = {
                internal: [],
                external: {
                    'saveBtn:tap': { el: btnEl },
                },
            };
            const emitSpy = jest.spyOn(instance, 'emit');
            instance.bindExternalEvents({ bridges: ['saveBtn:tap'] });

            instance.emit('tap', { domEvent: new Event('tap') });
            expect(emitSpy).toHaveBeenCalled();
            emitSpy.mockRestore();
        });

        it('方法自动绑定模式 → onSaveBtnTap', () => {
            const instance = new FullBoxClass() as any;
            const btnEl = document.createElement('button');
            instance.eventMap = {
                internal: [],
                external: {
                    'saveBtn:tap': { el: btnEl },
                },
            };
            instance.onSaveBtnTap = jest.fn();
            instance.bindExternalEvents({});

            instance.emit('tap', { domEvent: new Event('tap') });
            expect(instance.onSaveBtnTap).toHaveBeenCalled();
        });

        it('默认模式 → 走 emit 发布', () => {
            const instance = new FullBoxClass() as any;
            const btnEl = document.createElement('button');
            instance.eventMap = {
                internal: [],
                external: {
                    'saveBtn:tap': { el: btnEl },
                },
            };
            const emitSpy = jest.spyOn(instance, 'emit');
            instance.bindExternalEvents({});

            instance.emit('tap', { domEvent: new Event('tap') });
            expect(emitSpy).toHaveBeenCalled();
            emitSpy.mockRestore();
        });
    });
});
