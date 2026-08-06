jest.mock('@/logger', () => ({
    Logger: {
        for: jest.fn(() => ({
            warn: jest.fn(),
            debug: jest.fn(),
            info: jest.fn(),
            error: jest.fn(),
        })),
    },
}));

import { CompileEngine } from '@/component-core/engine/CompileEngine';
import type { CompileResult } from '@/component-core/types/compile-engine-types';
import { VOID_TAGS } from '@/component-core/constants/compile-constants';
import { findByPath } from '@/component-core/engine/utils/dom-path';

const noopLogger = { warn: () => {} };

describe('CompileEngine', () => {
    describe('compile', () => {
        it('返回 CompileResult 结构', () => {
            const tpl = { tag: 'div', children: [{ tag: 'span', name: 'text' }] };
            const result: CompileResult = CompileEngine.compile(tpl);

            expect(result.cache.html).toBe('<span></span>');
            expect(result.cache.indexPath['root']).toEqual([]);
            expect(result.cache.indexPath['text']).toEqual([0]);
            expect(result.cache.exposeNames).toContain('text');
            expect(result.cache.templateCache).toBeInstanceOf(HTMLTemplateElement);
            expect(result.nodeMetas['root'].tag).toBe('div');
            expect(result.nodeMetas['text'].tag).toBe('span');
        });

        it('fragment 模板先展开再编译', () => {
            const tpl = {
                tag: 'div',
                fragment: { name: 'btn', children: [{ tag: 'span', name: 'icon' }] },
            };
            const result = CompileEngine.compile(tpl);

            expect(result.cache.indexPath['btn:icon']).toEqual([0]);
        });
    });

    describe('expandFragments', () => {
        it('无 fragment 时原样返回（浅复制）', () => {
            const tpl = { tag: 'div', name: 'root', children: [{ tag: 'span', name: 'icon' }] };
            const result = CompileEngine.expandFragments(tpl);
            expect(result.tag).toBe('div');
            expect(result.name).toBe('root');
            expect(result.children).toHaveLength(1);
        });

        it('展开 fragment 为 children', () => {
            const tpl = {
                tag: 'div',
                fragment: {
                    name: 'btn',
                    children: [
                        { tag: 'span', name: 'icon' },
                        { tag: 'span', name: 'text' },
                    ],
                },
            };
            const result = CompileEngine.expandFragments(tpl);
            expect(result.fragment).toBeUndefined();
            expect(result.children).toHaveLength(2);
            expect(result.children![0].name).toBe('btn:icon');
            expect(result.children![1].name).toBe('btn:text');
        });

        it('递归展开嵌套 fragment', () => {
            const tpl = {
                tag: 'div',
                fragment: {
                    name: 'outer',
                    children: [
                        {
                            tag: 'span',
                            fragment: { name: 'inner', children: [{ tag: 'i', name: 'deep' }] },
                        },
                    ],
                },
            };
            const result = CompileEngine.expandFragments(tpl);
            expect(result.children).toHaveLength(1);
            expect(result.children![0].children![0].name).toBe('outer:inner:deep');
        });

        it('已有 children 时递归展开子节点', () => {
            const tpl = {
                tag: 'div',
                name: 'root',
                children: [
                    { tag: 'span', name: 'a' },
                    { tag: 'span', name: 'b' },
                ],
            };
            const result = CompileEngine.expandFragments(tpl);
            expect(result.children).toHaveLength(2);
            expect(result.children![0].name).toBe('a');
        });

        it('ns 前缀追加到 name', () => {
            const tpl = { tag: 'div', name: 'btn' };
            const result = CompileEngine.expandFragments(tpl, 'my');
            expect(result.name).toBe('my:btn');
        });

        it('无 name 时 ns 不追加前缀', () => {
            const tpl = { tag: 'div' };
            const result = CompileEngine.expandFragments(tpl, 'ns');
            expect(result.name).toBeUndefined();
        });
    });

    describe('compileTemplate', () => {
        it('编译简单模板生成 html + indexPath + nodeMetas', () => {
            const tpl = {
                tag: 'div',
                cls: 'q-btn',
                children: [{ tag: 'span', name: 'text', cls: 'q-btn__text' }],
            };
            const result = CompileEngine.compileTemplate(tpl, noopLogger);

            expect(result.html).toBe('<span></span>');
            expect(result.indexPath['root']).toEqual([]);
            expect(result.indexPath['text']).toEqual([0]);
            expect(result.nodeMetas['root'].tag).toBe('div');
            expect(result.nodeMetas['root'].cls).toBe('q-btn');
            expect(result.nodeMetas['text'].tag).toBe('span');
            expect(result.nodeMetas['text'].cls).toBe('q-btn__text');
            expect(result.exposeNames).toContain('text');
        });

        it('void 标签生成自闭合 html', () => {
            const tpl = {
                tag: 'div',
                children: [
                    { tag: 'input', name: 'field' },
                    { tag: 'img', name: 'pic' },
                ],
            };
            const result = CompileEngine.compileTemplate(tpl, noopLogger);

            expect(result.html).toContain('<input />');
            expect(result.html).toContain('<img />');
        });

        it('type 节点生成骨架占位 div', () => {
            const MyComp = class {};
            const tpl = { tag: 'div', children: [{ name: 'widget', type: MyComp }] };
            const result = CompileEngine.compileTemplate(tpl, noopLogger);

            expect(result.html).toContain('<div class="q-skeleton"></div>');
            expect(result.nodeMetas['widget'].componentClass).toBe(MyComp);
            expect(result.nodeMetas['widget'].contentMode).toBe('html');
        });

        it('type 为字符串时从 window 解析 componentClass', () => {
            (window as any).__TestComp = class {};
            const tpl = { tag: 'div', children: [{ name: 'widget', type: '__TestComp' }] };
            const result = CompileEngine.compileTemplate(tpl, noopLogger);

            expect(result.nodeMetas['widget'].componentClass).toBe((window as any).__TestComp);
            expect(result.nodeMetas['widget'].type).toBe('__TestComp');
            delete (window as any).__TestComp;
        });

        it('type 为非函数非字符串时 componentClass 不设置', () => {
            const tpl = { tag: 'div', children: [{ name: 'widget', type: 42 as any }] };
            const result = CompileEngine.compileTemplate(tpl, noopLogger);

            expect(result.nodeMetas['widget'].componentClass).toBeUndefined();
            expect(result.nodeMetas['widget'].type).toBeUndefined();
        });

        it('i18n 节点收集到 i18nNodes', () => {
            const tpl = { tag: 'div', children: [{ tag: 'span', name: 'label', i18n: 'btn.ok' }] };
            const result = CompileEngine.compileTemplate(tpl, noopLogger);

            expect(result.i18nNodes).toEqual([{ name: 'label', i18nKey: 'btn.ok' }]);
            expect(result.nodeMetas['label'].i18nKey).toBe('btn.ok');
        });

        it('type 节点 i18n 也收集到 i18nNodes', () => {
            const MyComp = class {};
            const tpl = {
                tag: 'div',
                children: [{ name: 'widget', type: MyComp, i18n: 'widget.label' }],
            };
            const result = CompileEngine.compileTemplate(tpl, noopLogger);

            expect(result.i18nNodes).toEqual([{ name: 'widget', i18nKey: 'widget.label' }]);
        });

        it('contentMode 按 tag 推导', () => {
            const tpl = {
                tag: 'div',
                children: [
                    { tag: 'input', name: 'a' },
                    { tag: 'select', name: 'b' },
                    { tag: 'textarea', name: 'c' },
                    { tag: 'img', name: 'd' },
                    { tag: 'a', name: 'e' },
                    { tag: 'span', name: 'f' },
                ],
            };
            const result = CompileEngine.compileTemplate(tpl, noopLogger);

            expect(result.nodeMetas['a'].contentMode).toBe('value');
            expect(result.nodeMetas['b'].contentMode).toBe('value');
            expect(result.nodeMetas['c'].contentMode).toBe('value');
            expect(result.nodeMetas['d'].contentMode).toBe('src');
            expect(result.nodeMetas['e'].contentMode).toBe('link');
            expect(result.nodeMetas['f'].contentMode).toBe('html');
        });

        it('嵌套超过3层时 warn', () => {
            const warn = jest.fn();
            const tpl = {
                tag: 'div',
                children: [
                    {
                        tag: 'div',
                        children: [
                            {
                                tag: 'div',
                                children: [
                                    {
                                        tag: 'div',
                                        children: [{ tag: 'div', name: 'deep', children: [] }],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            };
            CompileEngine.compileTemplate(tpl, { warn });

            expect(warn).toHaveBeenCalled();
        });

        it('嵌套不超过3层时不 warn', () => {
            const warn = jest.fn();
            const tpl = {
                tag: 'div',
                children: [
                    {
                        tag: 'div',
                        children: [{ tag: 'span', name: 'ok' }],
                    },
                ],
            };
            CompileEngine.compileTemplate(tpl, { warn });

            expect(warn).not.toHaveBeenCalled();
        });

        it('无 name 的 tag 节点不写入 indexPath/nodeMetas', () => {
            const tpl = { tag: 'div', children: [{ tag: 'span' }] };
            const result = CompileEngine.compileTemplate(tpl, noopLogger);

            expect(Object.keys(result.indexPath)).toEqual(['root']);
            expect(Object.keys(result.nodeMetas)).toEqual(['root']);
        });

        it('hidden/hiddenMode/role/attrs 传入 nodeMetas', () => {
            const tpl = {
                tag: 'div',
                children: [
                    {
                        tag: 'span',
                        name: 'x',
                        hidden: true,
                        hiddenMode: 'display',
                        role: 'button',
                        attrs: { 'aria-label': 'test' },
                    },
                ],
            };
            const result = CompileEngine.compileTemplate(tpl, noopLogger);
            const meta = result.nodeMetas['x'];

            expect(meta.hidden).toBe(true);
            expect(meta.hiddenMode).toBe('display');
            expect(meta.role).toBe('button');
            expect(meta.attrs).toEqual({ 'aria-label': 'test' });
        });

        it('flex/grid/style 传入 nodeMetas', () => {
            const tpl = {
                tag: 'div',
                style: 'color:red',
                children: [
                    { tag: 'div', name: 'row', flex: true, grid: true, style: 'font-size:12px' },
                ],
            };
            const result = CompileEngine.compileTemplate(tpl, noopLogger);

            expect(result.nodeMetas['root'].style).toBe('color:red');
            expect(result.nodeMetas['row'].flex).toBe(true);
            expect(result.nodeMetas['row'].grid).toBe(true);
            expect(result.nodeMetas['row'].style).toBe('font-size:12px');
        });

        it('无 children 时 html 为空字符串', () => {
            const tpl = { tag: 'div' };
            const result = CompileEngine.compileTemplate(tpl, noopLogger);

            expect(result.html).toBe('');
        });

        it('type 节点 initConfig 传入 nodeMetas', () => {
            const MyComp = class {};
            const tpl = {
                tag: 'div',
                children: [{ name: 'w', type: MyComp, initConfig: { a: 1 } }],
            };
            const result = CompileEngine.compileTemplate(tpl, noopLogger);

            expect(result.nodeMetas['w'].initConfig).toEqual({ a: 1 });
        });

        it('text 属性编译时写入 HTML', () => {
            const tpl = {
                tag: 'div',
                children: [
                    { tag: 'span', name: 'label', text: 'Hello' },
                    { tag: 'p', name: 'desc', text: '<b>bold</b>' },
                ],
            };
            const result = CompileEngine.compileTemplate(tpl, noopLogger);

            expect(result.html).toContain('Hello');
            expect(result.html).toContain('&lt;b&gt;bold&lt;/b&gt;');
            expect(result.nodeMetas['label'].text).toBe('Hello');
        });

        it('text 与 children 共存时 text 在前', () => {
            const tpl = {
                tag: 'div',
                children: [
                    {
                        tag: 'span',
                        name: 'mixed',
                        text: 'prefix',
                        children: [{ tag: 'i', name: 'icon' }],
                    },
                ],
            };
            const result = CompileEngine.compileTemplate(tpl, noopLogger);

            expect(result.html).toContain('prefix');
            expect(result.html).toContain('<i></i>');
        });
    });
});

describe('findByPath (dom-path)', () => {
    it('按路径定位子元素', () => {
        const root = document.createElement('div');
        const child0 = document.createElement('span');
        const child1 = document.createElement('div');
        const grandChild = document.createElement('p');
        root.appendChild(child0);
        root.appendChild(child1);
        child1.appendChild(grandChild);
        expect(findByPath(root, [0])).toBe(child0);
        expect(findByPath(root, [1])).toBe(child1);
        expect(findByPath(root, [1, 0])).toBe(grandChild);
    });

    it('路径不存在返回 null', () => {
        const root = document.createElement('div');
        expect(findByPath(root, [0])).toBeNull();
    });

    it('空路径返回根元素', () => {
        const root = document.createElement('div');
        expect(findByPath(root, [])).toBe(root);
    });
});

describe('VOID_TAGS (compile-constants)', () => {
    it('包含标准自闭合标签', () => {
        expect(VOID_TAGS.has('input')).toBe(true);
        expect(VOID_TAGS.has('img')).toBe(true);
        expect(VOID_TAGS.has('br')).toBe(true);
        expect(VOID_TAGS.has('hr')).toBe(true);
        expect(VOID_TAGS.has('col')).toBe(true);
        expect(VOID_TAGS.has('area')).toBe(true);
        expect(VOID_TAGS.has('base')).toBe(true);
        expect(VOID_TAGS.has('embed')).toBe(true);
        expect(VOID_TAGS.has('link')).toBe(true);
        expect(VOID_TAGS.has('meta')).toBe(true);
        expect(VOID_TAGS.has('param')).toBe(true);
        expect(VOID_TAGS.has('source')).toBe(true);
        expect(VOID_TAGS.has('track')).toBe(true);
        expect(VOID_TAGS.has('wbr')).toBe(true);
    });

    it('不包含普通标签', () => {
        expect(VOID_TAGS.has('div')).toBe(false);
        expect(VOID_TAGS.has('span')).toBe(false);
        expect(VOID_TAGS.has('p')).toBe(false);
    });
});
