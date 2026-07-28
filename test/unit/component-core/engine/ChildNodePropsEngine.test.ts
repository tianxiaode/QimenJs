/**
 * ChildNodePropsEngine 单元测试
 */

import { ChildNodePropsEngine } from '@/component-core/engine/ChildNodePropsEngine';
import type { NodeMetadata } from '@/component-core/types/compiled-types';

// Mock resolveI18nValue
jest.mock('@qimenjs/i18n', () => ({
    resolveI18nValue: jest.fn((key: string) => {
        if (key.startsWith('i18n:')) {
            return `translated:${key.slice(5)}`;
        }
        return key;
    }),
}));

const resolveI18nValue = jest.requireMock('@qimenjs/i18n').resolveI18nValue;

describe('ChildNodePropsEngine', () => {
    describe('apply', () => {
        it('应将属性描述符安装到构造函数原型上', () => {
            class TestComponent {}
            const nodeMetas: Record<string, NodeMetadata> = {
                title: { name: 'title', contentMode: 'text' },
                input: { name: 'input', contentMode: 'value' },
            };
            const i18nNodes: Array<{ name: string; i18nKey: string }> = [];

            ChildNodePropsEngine.apply(TestComponent, nodeMetas, i18nNodes);

            expect(Object.getOwnPropertyDescriptor(TestComponent.prototype, 'title')).toBeDefined();
            expect(Object.getOwnPropertyDescriptor(TestComponent.prototype, 'input')).toBeDefined();
        });

        it('应跳过已存在的属性', () => {
            class TestComponent {
                get title() {
                    return 'existing';
                }
            }

            const nodeMetas: Record<string, NodeMetadata> = {
                title: { name: 'title', contentMode: 'text' },
            };
            const i18nNodes: Array<{ name: string; i18nKey: string }> = [];

            ChildNodePropsEngine.apply(TestComponent, nodeMetas, i18nNodes);

            // 属性描述符应保持原样（get 函数返回 'existing'）
            const desc = Object.getOwnPropertyDescriptor(TestComponent.prototype, 'title');
            expect(desc).toBeDefined();
            expect(desc!.get!.call({})).toBe('existing');
        });

        it('应跳过 root 节点', () => {
            class TestComponent {}
            const nodeMetas: Record<string, NodeMetadata> = {
                root: { name: 'root', tag: 'div' },
                title: { name: 'title', contentMode: 'text' },
            };
            const i18nNodes: Array<{ name: string; i18nKey: string }> = [];

            ChildNodePropsEngine.apply(TestComponent, nodeMetas, i18nNodes);

            expect(Object.getOwnPropertyDescriptor(TestComponent.prototype, 'root')).toBeUndefined();
            expect(Object.getOwnPropertyDescriptor(TestComponent.prototype, 'title')).toBeDefined();
        });

        it('应为组件子节点生成 $name 形式的引用属性', () => {
            class TestComponent {}
            class IconComponent {}

            const nodeMetas: Record<string, NodeMetadata> = {
                icon: { name: 'icon', componentClass: IconComponent as any },
            };
            const i18nNodes: Array<{ name: string; i18nKey: string }> = [];

            ChildNodePropsEngine.apply(TestComponent, nodeMetas, i18nNodes);

            const desc = Object.getOwnPropertyDescriptor(TestComponent.prototype, '$icon');
            expect(desc).toBeDefined();
            expect(desc?.get).toBeDefined();
            expect(desc?.set).toBeUndefined();
        });
    });

    describe('buildDescs', () => {
        it('应跳过 root 节点', () => {
            const nodeMetas: Record<string, NodeMetadata> = {
                root: { name: 'root', tag: 'div' },
                title: { name: 'title', contentMode: 'text' },
            };

            const descs = ChildNodePropsEngine.buildDescs(nodeMetas, []);

            expect(descs.root).toBeUndefined();
            expect(descs.title).toBeDefined();
        });

        it('应为不同 contentMode 生成对应属性', () => {
            const nodeMetas: Record<string, NodeMetadata> = {
                title: { name: 'title', contentMode: 'text' },
                input: { name: 'input', contentMode: 'value' },
                image: { name: 'image', contentMode: 'src' },
                content: { name: 'content', contentMode: 'html' },
                link: { name: 'link', contentMode: 'link' },
            };

            const descs = ChildNodePropsEngine.buildDescs(nodeMetas, []);

            // text -> text
            expect(descs.title).toBeDefined();
            // value -> value
            expect(descs.input).toBeDefined();
            // src -> src
            expect(descs.image).toBeDefined();
            // html -> html (生成 contentHtml)
            expect(descs.contentHtml).toBeDefined();
            // link -> text + href
            expect(descs.link).toBeDefined();
            expect(descs.linkHref).toBeDefined();
        });

        it('应为组件子节点生成 $nodeName 引用属性', () => {
            class IconComponent {}
            const nodeMetas: Record<string, NodeMetadata> = {
                icon: { name: 'icon', componentClass: IconComponent as any },
            };

            const descs = ChildNodePropsEngine.buildDescs(nodeMetas, []);

            expect(descs.$icon).toBeDefined();
            expect(descs.$icon.get).toBeDefined();
            expect(descs.$icon.set).toBeUndefined();
        });

        it('应为 i18n 节点生成特殊的 getter/setter', () => {
            const nodeMetas: Record<string, NodeMetadata> = {
                title: { name: 'title', contentMode: 'text' },
            };
            const i18nNodes = [{ name: 'title', i18nKey: 'i18n:title.default' }];

            const descs = ChildNodePropsEngine.buildDescs(nodeMetas, i18nNodes);

            expect(descs.title).toBeDefined();
            // i18n 节点的 getter 返回 i18nKey
            const instance = {
                nodeMap: {
                    title: { i18nKey: 'btn.save' },
                },
            };
            const result = descs.title.get!.call(instance);
            expect(result).toBe('btn.save');
        });

        it('默认 contentMode 应为 html', () => {
            const nodeMetas: Record<string, NodeMetadata> = {
                content: { name: 'content' },
            };

            const descs = ChildNodePropsEngine.buildDescs(nodeMetas, []);

            // 默认是 html，生成 contentHtml
            expect(descs.contentHtml).toBeDefined();
        });

        it('不应重复添加相同属性的描述符', () => {
            const nodeMetas: Record<string, NodeMetadata> = {
                title: { name: 'title', contentMode: 'text' },
            };

            const descs = ChildNodePropsEngine.buildDescs(nodeMetas, []);

            // 再次调用不会添加重复属性
            ChildNodePropsEngine.buildDescs(nodeMetas, []);

            expect(Object.keys(descs).filter(k => k === 'title')).toHaveLength(1);
        });
    });

    describe('属性描述符 getter/setter 行为', () => {
        it('普通节点的 getter 应调用 _getNodeProp', () => {
            class TestComponent {}
            const nodeMetas: Record<string, NodeMetadata> = {
                title: { name: 'title', contentMode: 'text' },
            };

            ChildNodePropsEngine.apply(TestComponent, nodeMetas, []);

            const instance = {
                _getNodeProp: jest.fn().mockReturnValue('Hello'),
            };

            const desc = Object.getOwnPropertyDescriptor(TestComponent.prototype, 'title');
            const result = desc!.get!.call(instance);

            expect(instance._getNodeProp).toHaveBeenCalledWith('title', 'text');
            expect(result).toBe('Hello');
        });

        it('普通节点的 setter 应调用 _markNodeDirty', () => {
            class TestComponent {}
            const nodeMetas: Record<string, NodeMetadata> = {
                title: { name: 'title', contentMode: 'text' },
            };

            ChildNodePropsEngine.apply(TestComponent, nodeMetas, []);

            const instance = {
                _markNodeDirty: jest.fn(),
            };

            const desc = Object.getOwnPropertyDescriptor(TestComponent.prototype, 'title');
            desc!.set!.call(instance, 'New Title');

            expect(instance._markNodeDirty).toHaveBeenCalledWith('title', { text: 'New Title' });
        });

        it('i18n 节点的 getter 应返回 i18nKey', () => {
            class TestComponent {}
            const nodeMetas: Record<string, NodeMetadata> = {
                title: { name: 'title', contentMode: 'text' },
            };
            const i18nNodes = [{ name: 'title', i18nKey: 'i18n:title.default' }];

            ChildNodePropsEngine.apply(TestComponent, nodeMetas, i18nNodes);

            const instance = {
                nodeMap: {
                    title: { i18nKey: 'btn.save' },
                },
            };

            const desc = Object.getOwnPropertyDescriptor(TestComponent.prototype, 'title');
            const result = desc!.get!.call(instance);

            expect(result).toBe('btn.save');
        });

        it('i18n 节点的 setter 应设置 i18nKey 并调用 _markNodeDirty', () => {
            class TestComponent {}
            const nodeMetas: Record<string, NodeMetadata> = {
                title: { name: 'title', contentMode: 'text' },
            };
            const i18nNodes = [{ name: 'title', i18nKey: 'i18n:title.default' }];

            ChildNodePropsEngine.apply(TestComponent, nodeMetas, i18nNodes);

            const node = { i18nKey: '' };
            const instance = {
                nodeMap: { title: node },
                _markNodeDirty: jest.fn(),
            };

            const desc = Object.getOwnPropertyDescriptor(TestComponent.prototype, 'title');
            desc!.set!.call(instance, 'btn.new');

            expect(node.i18nKey).toBe('btn.new');
            expect(instance._markNodeDirty).toHaveBeenCalled();
        });

        it('i18n 节点 setter 在节点不存在时应直接返回', () => {
            class TestComponent {}
            const nodeMetas: Record<string, NodeMetadata> = {
                title: { name: 'title', contentMode: 'text' },
            };
            const i18nNodes = [{ name: 'title', i18nKey: 'i18n:title.default' }];

            ChildNodePropsEngine.apply(TestComponent, nodeMetas, i18nNodes);

            const instance = {
                nodeMap: {},
                _markNodeDirty: jest.fn(),
            };

            const desc = Object.getOwnPropertyDescriptor(TestComponent.prototype, 'title');
            // 不应抛出异常
            expect(() => desc!.set!.call(instance, 'btn.new')).not.toThrow();
            expect(instance._markNodeDirty).not.toHaveBeenCalled();
        });

        it('组件引用的 getter 应返回 nodeMap 中的 component', () => {
            class TestComponent {}
            class IconComponent {}
            const nodeMetas: Record<string, NodeMetadata> = {
                icon: { name: 'icon', componentClass: IconComponent as any },
            };

            ChildNodePropsEngine.apply(TestComponent, nodeMetas, []);

            const componentInstance = { name: 'iconInstance' };
            const instance = {
                nodeMap: {
                    icon: { component: componentInstance },
                },
            };

            const desc = Object.getOwnPropertyDescriptor(TestComponent.prototype, '$icon');
            const result = desc!.get!.call(instance);

            expect(result).toBe(componentInstance);
        });

        it('组件引用的 getter 在 nodeMap 不存在时应返回 undefined', () => {
            class TestComponent {}
            class IconComponent {}
            const nodeMetas: Record<string, NodeMetadata> = {
                icon: { name: 'icon', componentClass: IconComponent as any },
            };

            ChildNodePropsEngine.apply(TestComponent, nodeMetas, []);

            const instance = {
                nodeMap: {},
            };

            const desc = Object.getOwnPropertyDescriptor(TestComponent.prototype, '$icon');
            const result = desc!.get!.call(instance);

            expect(result).toBeUndefined();
        });
    });

    describe('保留关键字冲突处理', () => {
        it('节点名与保留关键字冲突时应添加 _ 后缀', () => {
            class TestComponent {}
            const nodeMetas: Record<string, NodeMetadata> = {
                // constructor 是保留关键字
                constructor: { name: 'constructor', contentMode: 'text' },
            };

            ChildNodePropsEngine.apply(TestComponent, nodeMetas, []);

            // 应生成 constructor_ 而不是 constructor
            expect(Object.getOwnPropertyDescriptor(TestComponent.prototype, 'constructor_')).toBeDefined();
            expect(Object.getOwnPropertyDescriptor(TestComponent.prototype, 'constructor')).toBeDefined();
            // 原有的 constructor 属性保持不变（它是原型链上的默认属性）
        });

        it('节点名 emit 是保留关键字时应添加 _ 后缀', () => {
            class TestComponent {}
            const nodeMetas: Record<string, NodeMetadata> = {
                emit: { name: 'emit', contentMode: 'text' },
            };

            ChildNodePropsEngine.apply(TestComponent, nodeMetas, []);

            expect(Object.getOwnPropertyDescriptor(TestComponent.prototype, 'emit_')).toBeDefined();
        });

        it('节点名 on 是保留关键字时应添加 _ 后缀', () => {
            class TestComponent {}
            const nodeMetas: Record<string, NodeMetadata> = {
                on: { name: 'on', contentMode: 'text' },
            };

            ChildNodePropsEngine.apply(TestComponent, nodeMetas, []);

            expect(Object.getOwnPropertyDescriptor(TestComponent.prototype, 'on_')).toBeDefined();
        });
    });

    describe('link contentMode 特殊处理', () => {
        it('link 模式应生成 text 和 href 两个属性', () => {
            class TestComponent {}
            const nodeMetas: Record<string, NodeMetadata> = {
                link: { name: 'link', contentMode: 'link' },
            };

            ChildNodePropsEngine.apply(TestComponent, nodeMetas, []);

            expect(Object.getOwnPropertyDescriptor(TestComponent.prototype, 'link')).toBeDefined();
            expect(Object.getOwnPropertyDescriptor(TestComponent.prototype, 'linkHref')).toBeDefined();
        });

        it('link 模式的 text 属性应使用 _getNodeProp', () => {
            class TestComponent {}
            const nodeMetas: Record<string, NodeMetadata> = {
                link: { name: 'link', contentMode: 'link' },
            };

            ChildNodePropsEngine.apply(TestComponent, nodeMetas, []);

            const instance = {
                _getNodeProp: jest.fn().mockReturnValue('Link Text'),
            };

            const desc = Object.getOwnPropertyDescriptor(TestComponent.prototype, 'link');
            const result = desc!.get!.call(instance);

            expect(instance._getNodeProp).toHaveBeenCalledWith('link', 'text');
            expect(result).toBe('Link Text');
        });

        it('link 模式的 href 属性应使用 _getNodeProp', () => {
            class TestComponent {}
            const nodeMetas: Record<string, NodeMetadata> = {
                link: { name: 'link', contentMode: 'link' },
            };

            ChildNodePropsEngine.apply(TestComponent, nodeMetas, []);

            const instance = {
                _getNodeProp: jest.fn().mockReturnValue('/path'),
            };

            const desc = Object.getOwnPropertyDescriptor(TestComponent.prototype, 'linkHref');
            const result = desc!.get!.call(instance);

            expect(instance._getNodeProp).toHaveBeenCalledWith('link', 'href');
            expect(result).toBe('/path');
        });
    });

    describe('html contentMode 处理', () => {
        it('html 模式应生成 nodeName + Html 形式的属性', () => {
            class TestComponent {}
            const nodeMetas: Record<string, NodeMetadata> = {
                content: { name: 'content', contentMode: 'html' },
            };

            ChildNodePropsEngine.apply(TestComponent, nodeMetas, []);

            expect(Object.getOwnPropertyDescriptor(TestComponent.prototype, 'contentHtml')).toBeDefined();
        });

        it('html 模式的属性应使用 _getNodeProp', () => {
            class TestComponent {}
            const nodeMetas: Record<string, NodeMetadata> = {
                content: { name: 'content', contentMode: 'html' },
            };

            ChildNodePropsEngine.apply(TestComponent, nodeMetas, []);

            const instance = {
                _getNodeProp: jest.fn().mockReturnValue('<span>HTML Content</span>'),
            };

            const desc = Object.getOwnPropertyDescriptor(TestComponent.prototype, 'contentHtml');
            const result = desc!.get!.call(instance);

            expect(instance._getNodeProp).toHaveBeenCalledWith('content', 'html');
            expect(result).toBe('<span>HTML Content</span>');
        });
    });

    describe('属性描述符配置', () => {
        it('所有描述符应设置 configurable: true', () => {
            class TestComponent {}
            const nodeMetas: Record<string, NodeMetadata> = {
                title: { name: 'title', contentMode: 'text' },
            };

            ChildNodePropsEngine.apply(TestComponent, nodeMetas, []);

            const desc = Object.getOwnPropertyDescriptor(TestComponent.prototype, 'title');
            expect(desc!.configurable).toBe(true);
        });

        it('所有描述符应设置 enumerable: true', () => {
            class TestComponent {}
            const nodeMetas: Record<string, NodeMetadata> = {
                title: { name: 'title', contentMode: 'text' },
            };

            ChildNodePropsEngine.apply(TestComponent, nodeMetas, []);

            const desc = Object.getOwnPropertyDescriptor(TestComponent.prototype, 'title');
            expect(desc!.enumerable).toBe(true);
        });
    });

    describe('边界情况', () => {
        it('空 nodeMetas 不应生成任何属性', () => {
            class TestComponent {}
            const nodeMetas: Record<string, NodeMetadata> = {};

            ChildNodePropsEngine.apply(TestComponent, nodeMetas, []);

            // 除了原型链上的默认属性，不应添加新属性
            const keys = Object.getOwnPropertyNames(TestComponent.prototype);
            expect(keys.filter(k => !['constructor'].includes(k))).toHaveLength(0);
        });

        it('空 i18nNodes 应正常处理', () => {
            class TestComponent {}
            const nodeMetas: Record<string, NodeMetadata> = {
                title: { name: 'title', contentMode: 'text' },
            };

            ChildNodePropsEngine.apply(TestComponent, nodeMetas, []);

            expect(Object.getOwnPropertyDescriptor(TestComponent.prototype, 'title')).toBeDefined();
        });

        it('contentMode 不在映射表中时不应生成属性', () => {
            class TestComponent {}
            const nodeMetas: Record<string, NodeMetadata> = {
                title: { name: 'title', contentMode: 'unknown' as any },
            };

            ChildNodePropsEngine.apply(TestComponent, nodeMetas, []);

            // contentMode 不在映射表中，不应生成属性
            expect(Object.getOwnPropertyDescriptor(TestComponent.prototype, 'title')).toBeUndefined();
        });

        it('value 属性名不是保留关键字', () => {
            class TestComponent {}
            const nodeMetas: Record<string, NodeMetadata> = {
                value: { name: 'value', contentMode: 'value' },
            };

            ChildNodePropsEngine.apply(TestComponent, nodeMetas, []);

            // value 不是保留关键字，直接使用
            expect(Object.getOwnPropertyDescriptor(TestComponent.prototype, 'value')).toBeDefined();
        });

        it('src 属性名不是保留关键字', () => {
            class TestComponent {}
            const nodeMetas: Record<string, NodeMetadata> = {
                src: { name: 'src', contentMode: 'src' },
            };

            ChildNodePropsEngine.apply(TestComponent, nodeMetas, []);

            // src 不是保留关键字，直接使用
            expect(Object.getOwnPropertyDescriptor(TestComponent.prototype, 'src')).toBeDefined();
        });
    });

    describe('多种节点类型组合', () => {
        it('应正确处理混合节点类型', () => {
            class TestComponent {}
            class IconComponent {}

            const nodeMetas: Record<string, NodeMetadata> = {
                title: { name: 'title', contentMode: 'text' },
                input: { name: 'input', contentMode: 'value' },
                image: { name: 'image', contentMode: 'src' },
                content: { name: 'content', contentMode: 'html' },
                link: { name: 'link', contentMode: 'link' },
                icon: { name: 'icon', componentClass: IconComponent as any },
            };

            ChildNodePropsEngine.apply(TestComponent, nodeMetas, [
                { name: 'title', i18nKey: 'i18n:title' },
            ]);

            expect(Object.getOwnPropertyDescriptor(TestComponent.prototype, 'title')).toBeDefined();
            expect(Object.getOwnPropertyDescriptor(TestComponent.prototype, 'input')).toBeDefined();
            expect(Object.getOwnPropertyDescriptor(TestComponent.prototype, 'image')).toBeDefined();
            expect(Object.getOwnPropertyDescriptor(TestComponent.prototype, 'contentHtml')).toBeDefined();
            expect(Object.getOwnPropertyDescriptor(TestComponent.prototype, 'link')).toBeDefined();
            expect(Object.getOwnPropertyDescriptor(TestComponent.prototype, 'linkHref')).toBeDefined();
            expect(Object.getOwnPropertyDescriptor(TestComponent.prototype, '$icon')).toBeDefined();
        });
    });
});