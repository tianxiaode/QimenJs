/**
 * TemplateComponent 单元测试
 *
 * 验证：
 * 1. TemplateComponent 继承 ComposableBase
 * 2. initElement() 创建 el
 * 3. with() 后 initElement 仍然可用
 * 4. with() 后基类方法仍然可用
 * 5. with() 数组参数兼容
 * 6. withTemplate() 预编译 + 实例化流程
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

import { TemplateComponent, TEMPLATE_COMPONENT_ABILITIES } from '@/component-core';
import type { AbilityDefinition } from '@/composable';
import type { JsonTemplateNode } from '@/component-core/template-json';

// 测试用能力
const TestRouteAbility: AbilityDefinition = {
    setupRoute(config: any) {
        return config;
    },
};

describe('TemplateComponent', () => {
    describe('继承关系', () => {
        it('TemplateComponent 应该是 ComposableBase 的子类', () => {
            const instance = new TemplateComponent();
            expect(instance).toBeDefined();
            expect(typeof instance.abilityState).toBe('function');
            expect(typeof instance.dispose).toBe('function');
        });

        it('TemplateComponent 应该有 TEMPLATE_COMPONENT_ABILITIES', () => {
            expect(TEMPLATE_COMPONENT_ABILITIES).toBeDefined();
            expect(Array.isArray(TEMPLATE_COMPONENT_ABILITIES)).toBe(true);
            expect(TEMPLATE_COMPONENT_ABILITIES.length).toBeGreaterThan(0);
        });
    });

    describe('initElement()', () => {
        it('initElement 应该在原型上', () => {
            expect(typeof TemplateComponent.prototype.initElement).toBe('function');
        });

        it('调用 initElement 应该创建 el', () => {
            const instance = new TemplateComponent();
            instance.type = 'VBox';
            instance.initElement();
            expect(instance.el).toBeDefined();
            expect(instance.el instanceof HTMLElement).toBe(true);
        });

        it('initElement 后 el 的标签应该是 div', () => {
            const instance = new TemplateComponent();
            instance.type = 'VBox';
            instance.initElement();
            expect(instance.el.tagName).toBe('DIV');
        });
    });

    describe('with() 后方法保留', () => {
        it('TemplateComponent.with() 后 initElement 应该可用', () => {
            const ForgedClass = TemplateComponent.with(TestRouteAbility);

            // 检查原型
            expect(typeof ForgedClass.prototype.initElement).toBe('function');

            // 检查实例
            const instance = new ForgedClass();
            expect(typeof instance.initElement).toBe('function');
        });

        it('TemplateComponent.with() 后调用 initElement 应该正常工作', () => {
            const ForgedClass = TemplateComponent.with(TestRouteAbility);
            const instance = new ForgedClass();
            instance.type = 'VBox';
            instance.initElement();
            expect(instance.el).toBeDefined();
            expect(instance.el instanceof HTMLElement).toBe(true);
        });

        it('TemplateComponent.with() 后 ComposableBase 方法应该可用', () => {
            const ForgedClass = TemplateComponent.with(TestRouteAbility);
            const instance = new ForgedClass();

            expect(typeof instance.abilityState).toBe('function');
            expect(typeof instance.setAbilityState).toBe('function');
            expect(typeof instance.setupAbilities).toBe('function');
            expect(typeof instance.onCleanup).toBe('function');
            expect(typeof instance.dispose).toBe('function');
            expect(typeof instance.debounce).toBe('function');
            expect(typeof instance.getStatic).toBe('function');
            expect(typeof instance.setStatic).toBe('function');
            expect(instance.host).toBe(instance);
        });

        it('TemplateComponent.with() 后注入的能力方法应该可用', () => {
            const ForgedClass = TemplateComponent.with(TestRouteAbility);
            const instance = new ForgedClass() as any;
            expect(typeof instance.setupRoute).toBe('function');
        });

        it('TemplateComponent.with(A, B) 多个能力应该都可用', () => {
            const AnotherAbility: AbilityDefinition = { anotherMethod() {} };
            const ForgedClass = TemplateComponent.with(TestRouteAbility, AnotherAbility);
            const instance = new ForgedClass() as any;

            // TemplateComponent 方法
            expect(typeof instance.initElement).toBe('function');

            // 注入的能力方法
            expect(typeof instance.setupRoute).toBe('function');
            expect(typeof instance.anotherMethod).toBe('function');
        });

        it('TemplateComponent.with(array) 数组参数兼容', () => {
            const AnotherAbility: AbilityDefinition = { anotherMethod() {} };
            const abilities = [TestRouteAbility, AnotherAbility];
            const ForgedClass = TemplateComponent.with(abilities);
            const instance = new ForgedClass() as any;

            expect(typeof instance.initElement).toBe('function');
            expect(typeof instance.setupRoute).toBe('function');
            expect(typeof instance.anotherMethod).toBe('function');
        });
    });

    describe('extends with() 类', () => {
        it('extends TemplateComponent.with() 后 initElement 应该可用', () => {
            const AnotherAbility: AbilityDefinition = { anotherMethod() {} };
            const AppContainer = TemplateComponent.with(TestRouteAbility, AnotherAbility);

            class MyApp extends AppContainer {
                myMethod() {
                    return 'my';
                }
            }

            const instance = new MyApp();
            expect(typeof instance.initElement).toBe('function');
            instance.type = 'VBox';
            instance.initElement();
            expect(instance.el).toBeDefined();
            expect((instance as any).myMethod()).toBe('my');
        });
    });

    describe('withTemplate()', () => {
        const SIMPLE_TEMPLATE = '<div class="q-btn"><span data-content="btn:text"></span></div>';

        it('withTemplate 应该返回一个类', () => {
            const ButtonClass = TemplateComponent.withTemplate(SIMPLE_TEMPLATE);
            expect(typeof ButtonClass).toBe('function');
        });

        it('withTemplate 强类应该有预编译的静态属性', () => {
            const ButtonClass = TemplateComponent.withTemplate(SIMPLE_TEMPLATE) as any;
            expect(ButtonClass._templateHtml).toBe(SIMPLE_TEMPLATE);
            expect(ButtonClass._indexPath).toBeDefined();
            expect(ButtonClass._templateMetas).toBeDefined();
            expect(Array.isArray(ButtonClass._internalEventTemplates)).toBe(true);
            expect(Array.isArray(ButtonClass._externalEventTemplates)).toBe(true);
            expect(Array.isArray(ButtonClass._contentPropNames)).toBe(true);
        });

        it('new withTemplate 强类应该自动完成初始化', () => {
            const ButtonClass = TemplateComponent.withTemplate(SIMPLE_TEMPLATE);
            const instance = new ButtonClass() as any;

            // el 已创建
            expect(instance.el).toBeDefined();
            expect(instance.el instanceof HTMLElement).toBe(true);
            expect(instance.el.tagName).toBe('DIV');

            // nodeMap 已构建
            expect(instance.nodeMap).toBeDefined();
            expect(instance.nodeMap['btn']).toBeDefined();
            expect(instance.nodeMap['btn']['text']).toBeDefined();
            expect(instance.nodeMap['btn']['text'].el instanceof HTMLElement).toBe(true);

            // 内容属性已生成
            expect(typeof instance.text).toBe('string');
        });

        it('withTemplate 强类的内容属性应该可读写', () => {
            const ButtonClass = TemplateComponent.withTemplate(SIMPLE_TEMPLATE);
            const instance = new ButtonClass() as any;

            instance.text = 'Click Me';
            expect(instance.text).toBe('Click Me');
        });

        it('withTemplate 强类应该支持 props 传入', () => {
            const ButtonClass = TemplateComponent.withTemplate(SIMPLE_TEMPLATE);
            const instance = new ButtonClass({ text: 'Hello' }) as any;

            expect(instance.text).toBe('Hello');
        });

        it('withTemplate 强类 dispose 后应该清理干净', () => {
            const ButtonClass = TemplateComponent.withTemplate(SIMPLE_TEMPLATE);
            const instance = new ButtonClass() as any;

            instance.dispose();
            expect(instance.nodeMap).toEqual({});
            expect(instance.eventMap).toEqual({ internal: [], external: {} });
            expect(instance._initializing).toBe(false);
        });

        it('withTemplate 支持链式调用 — 在已有强类上再次 withTemplate', () => {
            const ButtonClass = TemplateComponent.withTemplate(SIMPLE_TEMPLATE);
            const CUSTOM_TEMPLATE = '<div class="my-btn"><span data-content="btn:text"></span></div>';
            const CustomButton = ButtonClass.withTemplate(CUSTOM_TEMPLATE) as any;

            // 新类的 _templateHtml 应该是新模板
            expect(CustomButton._templateHtml).toBe(CUSTOM_TEMPLATE);

            // 新类应该有独立的预编译数据
            expect(CustomButton._indexPath).toBeDefined();
            expect(CustomButton._templateMetas).toBeDefined();

            // 新类实例应该正常创建
            const instance = new CustomButton() as any;
            expect(instance.el).toBeDefined();
            expect(instance.nodeMap['btn']).toBeDefined();
        });

        it('withTemplate 强类支持 extraFns 配置', () => {
            const ButtonClass = TemplateComponent.withTemplate(SIMPLE_TEMPLATE);
            const fn = jest.fn(function (this: any) { return this; });
            const instance = new ButtonClass({ extraFns: { myAction: fn } }) as any;

            expect(typeof instance.myAction).toBe('function');
            instance.myAction();
            expect(fn).toHaveBeenCalled();
        });

        it('withTemplate 强类支持 entity 配置', () => {
            class MockManager {
                disposed = false;
                dispose() { this.disposed = true; }
            }

            const ButtonClass = TemplateComponent.withTemplate(SIMPLE_TEMPLATE);
            const instance = new ButtonClass({ entity: MockManager }) as any;

            expect(instance.mgr).toBeDefined();
            expect(instance.mgr).toBeInstanceOf(MockManager);

            instance.dispose();
            expect(instance.mgr.disposed).toBe(true);
        });

        it('withTemplate 强类支持 meta 配置', () => {
            const ButtonClass = TemplateComponent.withTemplate(SIMPLE_TEMPLATE);
            const instance = new ButtonClass({ meta: { role: 'primary' } }) as any;

            expect(instance.meta).toBeDefined();
            expect(instance.meta.role).toBe('primary');
        });

        it('withTemplate 强类支持 static children 配置', () => {
            const ButtonClass = TemplateComponent.withTemplate(SIMPLE_TEMPLATE) as any;
            ButtonClass.children = ['icon', 'label'];

            const instance = new ButtonClass() as any;
            // children 配置在 _initWithTemplate 中被展开
            expect(instance).toBeDefined();
        });

        it('withTemplate 强类支持 static bridges 配置', () => {
            const EVENT_TEMPLATE = '<div><button data-content="btn:save" data-emit="tap"></button></div>';
            const ButtonClass = TemplateComponent.withTemplate(EVENT_TEMPLATE) as any;
            ButtonClass.bridges = ['saveBtn:tap'];

            const instance = new ButtonClass() as any;
            expect(instance).toBeDefined();
            expect(instance.eventMap.external['save:tap']).toBeDefined();
        });

        it('withTemplate 支持 JSON 模板数组', () => {
            const JSON_TEMPLATE: JsonTemplateNode[] = [
                { tag: 'span', content: 'btn:icon' },
                { tag: 'span', content: 'btn:text' },
            ];
            const ButtonClass = TemplateComponent.withTemplate(JSON_TEMPLATE);
            const instance = new ButtonClass() as any;

            expect(instance.el).toBeDefined();
            expect(instance.nodeMap).toBeDefined();
        });

        it('withTemplate JSON 模板生成 _jsonComponentMap', () => {
            class MyChild {}
            const JSON_TEMPLATE: JsonTemplateNode[] = [
                { content: 'slot:body', json: MyChild as any },
            ];
            const ContainerClass = TemplateComponent.withTemplate(JSON_TEMPLATE) as any;

            expect(ContainerClass._jsonComponentMap).toBeDefined();
            expect(ContainerClass._jsonComponentMap['body']).toBe(MyChild);
        });

        it('withTemplate 强类 dispose 时递归销毁子组件', () => {
            const SIMPLE_TEMPLATE2 = '<div class="q-btn"><span data-content="btn:text"></span></div>';
            const ButtonClass = TemplateComponent.withTemplate(SIMPLE_TEMPLATE2);
            const instance = new ButtonClass() as any;

            // 模拟 nodeMap 中有子组件
            const mockDispose = jest.fn();
            instance.nodeMap['btn'] = {
                text: {
                    el: document.createElement('span'),
                    raw: 'btn:text',
                    group: 'btn',
                    name: 'text',
                    component: { dispose: mockDispose },
                },
            };

            instance.dispose();
            expect(mockDispose).toHaveBeenCalled();
            expect(instance.nodeMap).toEqual({});
        });

        it('withTemplate 强类 _initWithTemplate 完成后 _initializing 为 false', () => {
            const ButtonClass = TemplateComponent.withTemplate(SIMPLE_TEMPLATE);
            const instance = new ButtonClass() as any;

            expect(instance._initializing).toBe(false);
        });

        it('withTemplate 强类 _initWithTemplate 异常时仍然重置 _initializing', () => {
            const ButtonClass = TemplateComponent.withTemplate(SIMPLE_TEMPLATE) as any;
            // 注入一个会抛异常的 setupAbilities
            const origSetup = ButtonClass.prototype.setupAbilities;
            ButtonClass.prototype.setupAbilities = function () {
                throw new Error('bad setup');
            };

            // 构造时异常，但 _initializing 应该被 finally 重置
            try {
                new ButtonClass();
            } catch (e: any) {
                expect(e.message).toBe('bad setup');
            }

            // 恢复
            ButtonClass.prototype.setupAbilities = origSetup;
        });

        it('withTemplate 强类 create() 静态方法', () => {
            const ButtonClass = TemplateComponent.withTemplate(SIMPLE_TEMPLATE) as any;
            const instance = ButtonClass.create({ text: 'Created' });

            expect(instance).toBeDefined();
            expect(instance.text).toBe('Created');
        });

        it('withTemplate 强类 _cloneFragment 返回 DocumentFragment', () => {
            const ButtonClass = TemplateComponent.withTemplate(SIMPLE_TEMPLATE) as any;
            const fragment = ButtonClass._cloneFragment();

            expect(fragment instanceof DocumentFragment).toBe(true);
        });

        it('withTemplate 强类 _getTemplateCache 缓存模板', () => {
            const ButtonClass = TemplateComponent.withTemplate(SIMPLE_TEMPLATE) as any;

            const cache1 = ButtonClass._getTemplateCache();
            const cache2 = ButtonClass._getTemplateCache();

            expect(cache1).toBe(cache2);
            expect(cache1 instanceof HTMLTemplateElement).toBe(true);
        });
    });

    describe('markDirty / flush', () => {
        it('markDirty 应该将 key 加入 dirtySet', () => {
            const instance = new TemplateComponent();
            instance.type = 'VBox';
            instance.initElement();

            instance.markDirty('x');
            expect(instance.dirtySet.has('x')).toBe(true);
        });

        it('flush 应该清空 dirtySet', () => {
            const instance = new TemplateComponent();
            instance.type = 'VBox';
            instance.initElement();

            instance.markDirty('x');
            instance.flush();
            expect(instance.dirtySet.size).toBe(0);
        });

        it('setProp 在非初始化阶段应该触发 markDirty', () => {
            const instance = new TemplateComponent();
            instance.type = 'VBox';
            instance.initElement();

            instance._initializing = false;
            instance.setProp('test', 'value');
            expect(instance.props.test).toBe('value');
        });

        it('setProp 在初始化阶段不应该触发 markDirty', () => {
            const instance = new TemplateComponent();
            instance.type = 'VBox';
            instance.initElement();

            instance._initializing = true;
            instance.setProp('test', 'value');
            expect(instance.props.test).toBe('value');
            expect(instance.dirtySet.has('test')).toBe(false);
        });
    });
});
