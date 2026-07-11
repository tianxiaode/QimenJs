/**
 * ElementEventAbility 单元测试
 *
 * 覆盖：__initProps（内部事件绑定、外部事件绑定、委托、once）
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
import { ElementEventAbility } from '@/component-core/abilities/ElementEventAbility';
import { initAbilitiesFromProps } from '@/component-core/abilities/PropAlias';

describe('ElementEventAbility', () => {
    describe('__initProps — 内部事件', () => {
        it('常规内部事件绑定', () => {
            const TPL = '<div class="box"><button data-content="box:btn" data-event="click"></button></div>';
            const BoxClass = TemplateComponent.withTemplate(TPL).with(ElementEventAbility);
            const instance = new BoxClass() as any;

            // 设置 eventMap
            const btnEl = instance.el.querySelector('button');
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
            initAbilitiesFromProps(instance, [ElementEventAbility], {});

            // 模拟触发事件
            const gesture = { domEvent: new Event('click') };
            instance.emit('click', gesture);

            expect(instance.onBtnClick).toHaveBeenCalled();
        });

        it('once 内部事件只触发一次', () => {
            const TPL = '<div class="box"><button data-content="box:btn" data-event="click"></button></div>';
            const BoxClass = TemplateComponent.withTemplate(TPL).with(ElementEventAbility);
            const instance = new BoxClass() as any;

            const btnEl = instance.el.querySelector('button');
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
            initAbilitiesFromProps(instance, [ElementEventAbility], {});

            instance.emit('click', { domEvent: new Event('click') });
            instance.emit('click', { domEvent: new Event('click') });

            expect(instance.onBtnClick).toHaveBeenCalledTimes(1);
        });

        it('委托事件绑定 — delegate 模式注册监听', () => {
            const TPL = '<div class="box"><ul data-content="box:list"><li class="item">A</li></ul></div>';
            const BoxClass = TemplateComponent.withTemplate(TPL).with(ElementEventAbility);
            const instance = new BoxClass() as any;

            const listEl = instance.el.querySelector('ul');
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
            initAbilitiesFromProps(instance, [ElementEventAbility], {});

            // 验证 bind 被调用且传入了 selector
            expect(bindSpy).toHaveBeenCalledWith(listEl, 'tap', { selector: '.item' });

            bindSpy.mockRestore();
        });
    });

    describe('__initProps — 外部事件', () => {
        it('外部事件走 emitUI 发布', () => {
            const TPL = '<div class="box"><button data-content="box:saveBtn" data-emit="tap"></button></div>';
            const BoxClass = TemplateComponent.withTemplate(TPL).with(ElementEventAbility);
            const instance = new BoxClass() as any;

            const btnEl = instance.el.querySelector('button');
            instance.eventMap = {
                internal: [],
                external: {
                    'saveBtn:tap': { el: btnEl },
                },
            };

            instance.emitUI = jest.fn();
            initAbilitiesFromProps(instance, [ElementEventAbility], {});

            instance.emit('tap', { domEvent: new Event('tap') });

            expect(instance.emitUI).toHaveBeenCalledWith('saveBtn:tap', undefined, expect.anything());
        });
    });

    describe('__initProps — 无 eventMap', () => {
        it('eventMap 为空 → 不报错', () => {
            const TPL = '<div class="box"></div>';
            const BoxClass = TemplateComponent.withTemplate(TPL).with(ElementEventAbility);
            const instance = new BoxClass() as any;
            instance.eventMap = null;
            expect(() => initAbilitiesFromProps(instance, [ElementEventAbility], {})).not.toThrow();
        });
    });
});
