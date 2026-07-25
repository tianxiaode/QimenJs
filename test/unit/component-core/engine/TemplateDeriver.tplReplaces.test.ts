import { TemplateDeriver } from '@/component-core/engine/TemplateDeriver';
import {
    compileTemplate,
    expandFragments,
    findByPath,
} from '@/component-core/engine/TemplateCompiler';

describe('TemplateDeriver.deriveWithTplReplaces', () => {
    function compileBase(tpl: any) {
        const expanded = expandFragments(tpl);
        const result = compileTemplate(expanded, { warn: () => {} });
        const tplEl = document.createElement('template');
        tplEl.innerHTML = result.html;
        return {
            cache: {
                html: result.html,
                indexPath: result.indexPath,
                exposeNames: result.exposeNames,
                i18nNodes: result.i18nNodes,
                templateCache: tplEl,
            },
            nodeMetas: result.nodeMetas,
        };
    }

    function buildRootEl(cache: any, tag = 'div'): HTMLElement {
        const root = document.createElement(tag);
        root.appendChild(cache.templateCache.content.cloneNode(true));
        return root;
    }

    test('替换命名节点为带子节点的子树', () => {
        const base = compileBase({
            tag: 'div',
            cls: 'q-cell',
            name: 'root',
            children: [{ tag: 'div', name: 'content' }],
        });

        const result = TemplateDeriver.deriveWithTplReplaces(base.cache, base.nodeMetas, {
            content: {
                tag: 'div',
                cls: 'q-cell--tree',
                children: [
                    { tag: 'span', name: 'toggle', cls: 'q-cell__toggle' },
                    { tag: 'span', name: 'text', cls: 'q-cell__text' },
                ],
            },
        });

        expect(result.cache.indexPath['root']).toEqual([]);
        expect(result.cache.indexPath['content']).toBeUndefined();
        expect(result.cache.indexPath['toggle']).toEqual([0, 0]);
        expect(result.cache.indexPath['text']).toEqual([0, 1]);
        expect(result.nodeMetas['toggle'].cls).toBe('q-cell__toggle');
        expect(result.nodeMetas['text'].cls).toBe('q-cell__text');
        expect(result.nodeMetas['content']).toBeUndefined();
    });

    test('替换命名节点为带 name 的简单节点', () => {
        const base = compileBase({
            tag: 'div',
            cls: 'q-cell',
            name: 'root',
            children: [{ tag: 'div', name: 'content' }],
        });

        const result = TemplateDeriver.deriveWithTplReplaces(base.cache, base.nodeMetas, {
            content: { tag: 'span', name: 'text', cls: 'q-cell__text' },
        });

        expect(result.cache.indexPath['content']).toBeUndefined();
        expect(result.cache.indexPath['text']).toEqual([0]);
        expect(result.nodeMetas['text'].tag).toBe('span');
    });

    test('替换不影响兄弟节点', () => {
        const base = compileBase({
            tag: 'div',
            name: 'root',
            children: [
                { tag: 'span', name: 'before' },
                { tag: 'div', name: 'content' },
                { tag: 'span', name: 'after' },
            ],
        });

        const result = TemplateDeriver.deriveWithTplReplaces(base.cache, base.nodeMetas, {
            content: {
                tag: 'div',
                children: [
                    { tag: 'span', name: 'toggle' },
                    { tag: 'span', name: 'text' },
                ],
            },
        });

        expect(result.cache.indexPath['before']).toEqual([0]);
        expect(result.cache.indexPath['after']).toEqual([2]);
        expect(result.cache.indexPath['toggle']).toEqual([1, 0]);
        expect(result.cache.indexPath['text']).toEqual([1, 1]);
    });

    test('替换后 indexPath 在模拟 buildDOM 的根元素上可正确定位', () => {
        const base = compileBase({
            tag: 'div',
            cls: 'q-cell',
            name: 'root',
            children: [{ tag: 'div', name: 'content' }],
        });

        const result = TemplateDeriver.deriveWithTplReplaces(base.cache, base.nodeMetas, {
            content: {
                tag: 'div',
                cls: 'q-cell--tree',
                children: [
                    { tag: 'span', name: 'toggle', cls: 'q-cell__toggle' },
                    { tag: 'span', name: 'text', cls: 'q-cell__text' },
                ],
            },
        });

        const rootEl = buildRootEl(result.cache);

        const toggleEl = findByPath(rootEl, result.cache.indexPath['toggle']);
        const textEl = findByPath(rootEl, result.cache.indexPath['text']);

        expect(toggleEl?.tagName).toBe('SPAN');
        expect(textEl?.tagName).toBe('SPAN');
    });

    test('新 cache 不影响父 cache', () => {
        const base = compileBase({
            tag: 'div',
            name: 'root',
            children: [{ tag: 'div', name: 'content' }],
        });

        const originalHtml = base.cache.html;

        TemplateDeriver.deriveWithTplReplaces(base.cache, base.nodeMetas, {
            content: { tag: 'span', name: 'text' },
        });

        expect(base.cache.html).toBe(originalHtml);
        expect(base.cache.indexPath['content']).toBeDefined();
    });

    test('替换不存在的节点名时安全跳过', () => {
        const base = compileBase({
            tag: 'div',
            name: 'root',
            children: [{ tag: 'div', name: 'content' }],
        });

        const result = TemplateDeriver.deriveWithTplReplaces(base.cache, base.nodeMetas, {
            nonexistent: { tag: 'span', name: 'text' },
        });

        expect(result.cache.indexPath['content']).toEqual([0]);
        expect(result.cache.indexPath['text']).toBeUndefined();
    });
});
