/**
 * Component 基类测试
 *
 * 覆盖：模板编译、DOM 构建、节点元数据、生命周期、初始化链
 */

jest.mock('@/i18n', () => ({}));
jest.mock('@/logger', () => {
    const actual = jest.requireActual('@/logger');
    return {
        ...actual,
        Logger: {
            ...actual.Logger,
            for: jest.fn(() => ({
                debug: jest.fn(),
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn(),
            })),
        },
    };
});

import { Component } from '@/component-core/Component';
import { TemplateManager } from '@/component-core/engine/TemplateManager';
import type { TemplateDecl } from '@/component-core/types';

// ──────────────────────────────────────────────────
// 第一部分：TemplateManager 编译
// ──────────────────────────────────────────────────
describe('TemplateManager 编译', () => {
    it('编译基本模板', () => {
        const tpl: TemplateDecl = { tag: 'div', name: 'root' };
        const cache = TemplateManager.get(tpl);
        expect(cache.names).toEqual(['root']);
        expect(cache.nodes.root).toBeDefined();
        expect(cache.nodes.root.tag).toBe('div');
        expect(cache.html).toContain('<div>');
    });

    it('编译带 attributes/style/classes 的模板', () => {
        const tpl: TemplateDecl = {
            tag: 'div',
            name: 'root',
            attributes: { disabled: true, 'data-test': 'val' },
            style: { color: 'red' },
            classes: 'wrapper',
        };
        const cache = TemplateManager.get(tpl);
        const meta = cache.nodes.root;
        expect(meta.attributes).toEqual({ disabled: true, 'data-test': 'val' });
        expect(meta.style).toEqual({ color: 'red' });
        expect(meta.classes).toBe('wrapper');
        expect(cache.html).toContain('disabled="true"');
        expect(cache.html).toContain('data-test="val"');
        expect(cache.html).toContain('style="color: red"');
        expect(cache.html).toContain('class="wrapper"');
    });

    it('编译带 options 的节点', () => {
        const tpl: TemplateDecl = {
            tag: 'div',
            name: 'root',
            options: { drag: true, hidden: false },
        };
        const cache = TemplateManager.get(tpl);
        const meta = cache.nodes.root;
        expect(meta.options).toEqual({ drag: true, hidden: false });
    });

    it('编译带子节点的模板', () => {
        const tpl: TemplateDecl = {
            tag: 'div',
            name: 'root',
            children: [
                { tag: 'span', name: 'label', options: { text: 'Hello' } },
                { tag: 'button', name: 'btn', options: { text: 'Click' } },
            ],
        };
        const cache = TemplateManager.get(tpl);
        expect(cache.names).toEqual(['root', 'label', 'btn']);
        expect(cache.html).toContain('<span>Hello</span>');
        expect(cache.html).toContain('<button>Click</button>');
    });

    it('编译 i18n / permission 节点', () => {
        const tpl: TemplateDecl = {
            tag: 'div',
            name: 'root',
            i18n: { text: 'hello' },
            permission: 'edit',
        };
        const cache = TemplateManager.get(tpl);
        const meta = cache.nodes.root;
        expect(meta.i18n).toEqual({ text: 'hello' });
        expect(meta.permission).toBe('edit');
    });

    it('splitAttrs 拆分 style/class 和普通属性', () => {
        const result = TemplateManager.splitAttrs({
            style: { color: 'red', fontSize: 14 },
            class: 'btn primary',
            disabled: true,
            href: '/path',
        });
        expect(result.attributes).toEqual({ disabled: true, href: '/path' });
        expect(result.style).toEqual({ color: 'red', fontSize: 14 });
        expect(result.classes).toBe('btn primary');
    });

    it('splitAttrs 处理空对象', () => {
        const result = TemplateManager.splitAttrs({});
        expect(result.attributes).toEqual({});
        expect(result.style).toEqual({});
        expect(result.classes).toEqual([]);
    });

    it('splitAttrs 处理 undefined', () => {
        const result = TemplateManager.splitAttrs(undefined);
        expect(result.attributes).toEqual({});
        expect(result.style).toEqual({});
        expect(result.classes).toEqual([]);
    });
});

// ──────────────────────────────────────────────────
// 第二部分：Component 构造函数
// ──────────────────────────────────────────────────
describe('Component 构造函数', () => {
    it('实例化时设置 type、id', () => {
        class TestComp extends Component {}
        const inst = new TestComp() as any;
        expect(inst.type).toBe('TestComp');
        expect(inst.id).toBeDefined();
        expect(typeof inst.id).toBe('string');
    });

    it('id 可传入', () => {
        class TestComp extends Component {}
        const inst = new TestComp({ options: { id: 'custom-id' } } as any) as any;
        expect(inst.id).toBe('custom-id');
    });

    it('type 从类名推导（去掉 Component 后缀）', () => {
        class ButtonComponent extends Component {}
        const inst = new ButtonComponent() as any;
        expect(inst.type).toBe('Button');
    });

    it('无 Component 后缀时 type 为完整类名', () => {
        class MyWidget extends Component {}
        const inst = new MyWidget() as any;
        expect(inst.type).toBe('MyWidget');
    });

    it('ready 是 Promise', () => {
        class TestComp extends Component {}
        const inst = new TestComp() as any;
        expect(inst.ready).toBeInstanceOf(Promise);
    });
});

// ──────────────────────────────────────────────────
// 第三部分：DOM 构建
// ──────────────────────────────────────────────────
describe('DOM 构建', () => {
    it('基础模板生成 el', () => {
        class TestComp extends Component {
            get tpl() {
                return { tag: 'div', name: 'root' } as TemplateDecl;
            }
        }
        const inst = new TestComp() as any;
        expect(inst.el).toBeInstanceOf(HTMLElement);
        expect(inst.el.tagName).toBe('DIV');
    });

    it('attributes 应用到根元素', () => {
        class TestComp extends Component {
            get tpl() {
                return {
                    tag: 'div',
                    name: 'root',
                    attributes: { disabled: true, 'data-test': 'value' },
                } as TemplateDecl;
            }
        }
        const inst = new TestComp() as any;
        expect(inst.el.getAttribute('disabled')).toBe('true');
        expect(inst.el.getAttribute('data-test')).toBe('value');
    });

    it('style 应用到根元素', () => {
        class TestComp extends Component {
            get tpl() {
                return {
                    tag: 'div',
                    name: 'root',
                    style: { color: 'red', fontSize: '14px' },
                } as TemplateDecl;
            }
        }
        const inst = new TestComp() as any;
        expect(inst.el.style.color).toBe('red');
        expect(inst.el.style.fontSize).toBe('14px');
    });

    it('子节点存在 DOM 中', () => {
        class TestComp extends Component {
            get tpl() {
                return {
                    tag: 'div',
                    name: 'root',
                    children: [
                        { tag: 'span', name: 'label', options: { text: 'Hello' } },
                        { tag: 'button', name: 'btn', options: { text: 'Click' } },
                    ],
                } as TemplateDecl;
            }
        }
        const inst = new TestComp() as any;
        const label = inst.getNodeEl('label');
        const btn = inst.getNodeEl('btn');
        expect(label).toBeTruthy();
        expect(label.textContent).toBe('Hello');
        expect(label.tagName).toBe('SPAN');
        expect(btn).toBeTruthy();
        expect(btn.textContent).toBe('Click');
        expect(btn.tagName).toBe('BUTTON');
    });

    it('子节点 attributes/style 正确应用', () => {
        class TestComp extends Component {
            get tpl() {
                return {
                    tag: 'div',
                    name: 'root',
                    children: [
                        {
                            tag: 'span',
                            name: 'label',
                            options: { text: 'Hi' },
                            style: { fontWeight: 'bold' },
                        },
                    ],
                } as TemplateDecl;
            }
        }
        const inst = new TestComp() as any;
        const label = inst.getNodeEl('label');
        expect(label.style.fontWeight).toBe('bold');
    });

    it('options.text 内容正确', () => {
        class TestComp extends Component {
            get tpl() {
                return { tag: 'div', name: 'root', options: { text: 'Hello World' } } as TemplateDecl;
            }
        }
        const inst = new TestComp() as any;
        expect(inst.el.textContent).toBe('Hello World');
    });
});

// ──────────────────────────────────────────────────
// 第四部分：NodeMeta 缓存
// ──────────────────────────────────────────────────
describe('NodeMeta 缓存', () => {
    it('getNode 返回节点元数据', () => {
        class TestComp extends Component {
            get tpl() {
                return {
                    tag: 'div',
                    name: 'root',
                    children: [{ tag: 'span', name: 'label' }],
                } as TemplateDecl;
            }
        }
        const inst = new TestComp() as any;
        const root = inst.getNode('root');
        const label = inst.getNode('label');
        expect(root).toBeDefined();
        expect(root.tag).toBe('div');
        expect(label).toBeDefined();
        expect(label.tag).toBe('span');
    });

    it('getNode 含完整 attributes/style/classes', () => {
        class TestComp extends Component {
            get tpl() {
                return {
                    tag: 'div',
                    name: 'root',
                    attributes: { id: 'main' },
                    style: { color: 'blue' },
                    classes: 'box',
                } as TemplateDecl;
            }
        }
        const inst = new TestComp() as any;
        const meta = inst.getNode('root');
        expect(meta.attributes).toEqual({ id: 'main' });
        expect(meta.style).toEqual({ color: 'blue' });
        expect(meta.classes).toBe('box');
    });

    it('isComponent 判断正确', () => {
        class TestComp extends Component {
            get tpl() {
                return {
                    tag: 'div',
                    name: 'root',
                    children: [
                        { tag: 'span', name: 'label' },
                        { tag: 'div', name: 'skeleton' },
                    ],
                } as TemplateDecl;
            }
        }
        const inst = new TestComp() as any;
        const root = inst.getNode('root');
        expect(root.isComponent).toBe(false);
    });
});

// ──────────────────────────────────────────────────
// 第五部分：生命周期
// ──────────────────────────────────────────────────
describe('生命周期', () => {
    it('onAfterInit 被调用', async () => {
        let called = false;
        class TestComp extends Component {
            onAfterInit() {
                called = true;
            }
        }
        new TestComp();
        await new Promise(resolve => setTimeout(resolve, 0));
        expect(called).toBe(true);
    });

    it('onMounted 被调用', async () => {
        let called = false;
        class TestComp extends Component {
            onMounted() {
                called = true;
            }
        }
        new TestComp();
        await new Promise(resolve => setTimeout(resolve, 0));
        expect(called).toBe(true);
    });

    it('onBeforeUnmount 被调用', async () => {
        let called = false;
        class TestComp extends Component {
            onBeforeUnmount() {
                called = true;
            }
        }
        const inst = new TestComp();
        await (inst as any).ready;
        inst.dispose();
        expect(called).toBe(true);
    });

    it('ready 在初始化完成后 resolve', async () => {
        class TestComp extends Component {}
        const inst = new TestComp() as any;
        await expect(inst.ready).resolves.toBeUndefined();
        expect(inst._initializing).toBe(false);
    });
});

// ──────────────────────────────────────────────────
// 第六部分：构造函数选项
// ──────────────────────────────────────────────────
describe('构造函数选项', () => {
    it('action 传入并生效', async () => {
        class TestComp extends Component {}
        const inst = new TestComp({ options: { action: 'save' } } as any) as any;
        await inst.ready;
        expect(inst.action).toBe('save');
    });

    it('hidden 传入并生效', async () => {
        class TestComp extends Component {
            get tpl() {
                return { tag: 'div', name: 'root' } as TemplateDecl;
            }
        }
        const inst = new TestComp({ options: { hidden: true } } as any) as any;
        await inst.ready;
        expect(inst.hidden).toBe(true);
    });

    it('style 传入应用到根元素', () => {
        class TestComp extends Component {
            get tpl() {
                return { tag: 'div', name: 'root' } as TemplateDecl;
            }
        }
        const inst = new TestComp({ style: { color: 'red', fontSize: '14px' } } as any) as any;
        expect(inst.el.style.color).toBe('red');
        expect(inst.el.style.fontSize).toBe('14px');
    });

    it('classes 传入添加到根元素', () => {
        class TestComp extends Component {
            get tpl() {
                return { tag: 'div', name: 'root' } as TemplateDecl;
            }
        }
        const inst = new TestComp({ classes: 'custom-cls' } as any) as any;
        expect(inst.el.classList.contains('custom-cls')).toBe(true);
    });
});

// ──────────────────────────────────────────────────
// 第七部分：模板编译缓存
// ──────────────────────────────────────────────────
describe('模板编译缓存', () => {
    it('相同模板引用返回同一缓存', () => {
        const tpl: TemplateDecl = { tag: 'div', name: 'root' };
        const cache1 = TemplateManager.get(tpl);
        const cache2 = TemplateManager.get(tpl);
        expect(cache1).toBe(cache2);
    });

    it('不同模板返回不同缓存', () => {
        const tpl1: TemplateDecl = { tag: 'div', name: 'root' };
        const tpl2: TemplateDecl = { tag: 'span', name: 'root' };
        const cache1 = TemplateManager.get(tpl1);
        const cache2 = TemplateManager.get(tpl2);
        expect(cache1).not.toBe(cache2);
        expect(cache1.nodes.root.tag).toBe('div');
        expect(cache2.nodes.root.tag).toBe('span');
    });
});

// ──────────────────────────────────────────────────
// 第八部分：实例方法
// ──────────────────────────────────────────────────
describe('实例方法', () => {
    it('getNode 返回 meta', () => {
        class TestComp extends Component {
            get tpl() {
                return {
                    tag: 'div',
                    name: 'root',
                    children: [{ tag: 'span', name: 'label' }],
                } as TemplateDecl;
            }
        }
        const inst = new TestComp() as any;
        expect(inst.getNode('root')).toBeDefined();
        expect(inst.getNode('label')).toBeDefined();
        expect(inst.getNode('nonexist')).toBeUndefined();
    });

    it('getNodeEl 返回 DOM 元素', () => {
        class TestComp extends Component {
            get tpl() {
                return {
                    tag: 'div',
                    name: 'root',
                    children: [{ tag: 'span', name: 'label' }],
                } as TemplateDecl;
            }
        }
        const inst = new TestComp() as any;
        expect(inst.getNodeEl('root')).toBeInstanceOf(HTMLElement);
        expect(inst.getNodeEl('label')).toBeInstanceOf(HTMLElement);
        expect(inst.getNodeEl('nonexist')).toBeUndefined();
    });

    it('getNodeNames 返回节点名列表', () => {
        class TestComp extends Component {
            get tpl() {
                return {
                    tag: 'div',
                    name: 'root',
                    children: [{ tag: 'span', name: 'label' }],
                } as TemplateDecl;
            }
        }
        const inst = new TestComp() as any;
        expect(inst.getNodeNames()).toEqual(['root', 'label']);
    });

    it('isComponent 判断', () => {
        class TestComp extends Component {
            get tpl() {
                return {
                    tag: 'div',
                    name: 'root',
                } as TemplateDecl;
            }
        }
        const inst = new TestComp() as any;
        expect(inst.isComponent('root')).toBe(false);
    });
});

// ──────────────────────────────────────────────────
// 第九部分：边缘情况
// ──────────────────────────────────────────────────
describe('边缘情况', () => {
    it('无模板可正常实例化', () => {
        class TestComp extends Component {}
        const inst = new TestComp() as any;
        expect(inst.el).toBeInstanceOf(HTMLElement);
        expect(inst.el.tagName).toBe('DIV');
    });

    it('无 attributes/style/classes 不会报错', () => {
        class TestComp extends Component {
            get tpl() {
                return { tag: 'div', name: 'root' } as TemplateDecl;
            }
        }
        const inst = new TestComp() as any;
        expect(inst.el).toBeInstanceOf(HTMLElement);
    });

    it('根节点无 name 时默认命名为 root', () => {
        const tpl: TemplateDecl = {
            tag: 'div',
            children: [{ tag: 'span', options: { text: 'no name' } }],
        };
        const cache = TemplateManager.get(tpl);
        expect(cache.names).toEqual(['root']);
    });

    it('多次 dispose 安全', () => {
        class TestComp extends Component {}
        const inst = new TestComp() as any;
        expect(() => {
            inst.dispose();
            inst.dispose();
        }).not.toThrow();
    });
});