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
                debug: jest.fn(),
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn(),
            })),
        },
    };
});

import { TemplateComponent } from '@/component-core';
import type { ComponentTemplate } from '@/component-core';
import { ElementEventAbility } from '@/component-core/abilities/ElementEventAbility';
import { initAbilitiesFromProps } from '@/component-core/abilities/PropAlias';

describe('ElementEventAbility', () => {
    describe('__initProps — 内部事件', () => {
        it('常规内部事件绑定', () => {
            const TPL: ComponentTemplate = {
                tpl: {
                    tag: 'div',
                    className: 'box',
                    children: [{ tag: 'button', name: 'box:btn', content: 'btn' }],
                },
            };
            const BoxClass = TemplateComponent.withTemplate(TPL);
            const instance = new BoxClass() as any;

            // 设置 eventMap
            const btnEl = instance.el.querySelector('button');
            instance.eventMap = {
                internal: [
                    {
                        event: 'click',
                        handler: 'onClick',
                        once: false,
                        delegate: false,
                        delegateTarget: undefined,
                        node: { el: btnEl },
                    },
                ],
                external: {},
            };

            instance.onClick = jest.fn();
            initAbilitiesFromProps(instance, [ElementEventAbility], {});

            // 模拟触发事件
            const gesture = { domEvent: new Event('click') };
            instance.emit('dom:click', gesture);

            expect(instance.onClick).toHaveBeenCalled();
        });

        it('once 内部事件只触发一次', () => {
            const TPL: ComponentTemplate = {
                tpl: {
                    tag: 'div',
                    className: 'box',
                    children: [{ tag: 'button', name: 'box:btn', content: 'btn' }],
                },
            };
            const BoxClass = TemplateComponent.withTemplate(TPL);
            const instance = new BoxClass() as any;

            const btnEl = instance.el.querySelector('button');
            instance.eventMap = {
                internal: [
                    {
                        event: 'click',
                        handler: 'onClick',
                        once: true,
                        delegate: false,
                        delegateTarget: undefined,
                        node: { el: btnEl },
                    },
                ],
                external: {},
            };

            instance.onClick = jest.fn();
            initAbilitiesFromProps(instance, [ElementEventAbility], {});

            instance.emit('dom:click', { domEvent: new Event('click') });
            instance.emit('dom:click', { domEvent: new Event('click') });

            expect(instance.onClick).toHaveBeenCalledTimes(1);
        });

        it('委托事件绑定 — delegate 模式注册监听', () => {
            const TPL: ComponentTemplate = {
                tpl: {
                    tag: 'div',
                    className: 'box',
                    children: [
                        {
                            tag: 'ul',
                            name: 'box:list',
                            content: 'list',
                            children: [{ tag: 'li', className: 'item', text: 'A' }],
                        },
                    ],
                },
            };
            const BoxClass = TemplateComponent.withTemplate(TPL).with(ElementEventAbility);
            const instance = new BoxClass() as any;

            const listEl = instance.el.querySelector('ul');
            instance.eventMap = {
                internal: [
                    {
                        event: 'tap',
                        handler: 'onListTap',
                        once: false,
                        delegate: true,
                        delegateTarget: '.item',
                        node: { el: listEl },
                    },
                ],
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
        it('外部事件走 emit 发布', () => {
            const TPL: ComponentTemplate = {
                tpl: {
                    tag: 'div',
                    className: 'box',
                    children: [
                        {
                            tag: 'button',
                            name: 'box:saveBtn',
                            content: 'saveBtn',
                            events: { click: { emits: ['tap'] } },
                        },
                    ],
                },
            };
            const BoxClass = TemplateComponent.withTemplate(TPL).with(ElementEventAbility);
            const instance = new BoxClass() as any;

            const btnEl = instance.el.querySelector('button');
            instance.eventMap = {
                internal: [],
                external: {
                    'saveBtn:tap': { el: btnEl },
                },
            };

            const emitSpy = jest.spyOn(instance, 'emit');
            initAbilitiesFromProps(instance, [ElementEventAbility], {});

            instance.emit('tap', { domEvent: new Event('tap') });

            expect(emitSpy).toHaveBeenCalled();
            emitSpy.mockRestore();
        });
    });

    describe('__initProps — 无 eventMap', () => {
        it('eventMap 为空 → 不报错', () => {
            const TPL: ComponentTemplate = { tpl: { tag: 'div', className: 'box' } };
            const BoxClass = TemplateComponent.withTemplate(TPL).with(ElementEventAbility);
            const instance = new BoxClass() as any;
            instance.eventMap = null;
            expect(() => initAbilitiesFromProps(instance, [ElementEventAbility], {})).not.toThrow();
        });
    });
});
