/**
 * template-compiler.ts 单元测试
 *
 * 覆盖：precompileTemplate、precompileEventTemplates、buildEventMapFromTemplates、
 *       findByPath、computeNodePath、inferContentMode、parseEventAttr
 */

import {
    precompileTemplate,
    precompileEventTemplates,
    buildEventMapFromTemplates,
    findByPath,
    computeNodePath,
    inferContentMode,
    parseEventAttr,
} from '@/component-core/template-compiler';
import type { InternalEventTemplate, ExternalEventTemplate } from '@/component-core/template-compiler';

// ============================================
// inferContentMode
// ============================================

describe('inferContentMode', () => {
    it('input 元素返回 value', () => {
        const el = document.createElement('input');
        expect(inferContentMode(el)).toBe('value');
    });

    it('select 元素返回 value', () => {
        const el = document.createElement('select');
        expect(inferContentMode(el)).toBe('value');
    });

    it('textarea 元素返回 value', () => {
        const el = document.createElement('textarea');
        expect(inferContentMode(el)).toBe('value');
    });

    it('img 元素返回 src', () => {
        const el = document.createElement('img');
        expect(inferContentMode(el)).toBe('src');
    });

    it('div 元素返回 html', () => {
        const el = document.createElement('div');
        expect(inferContentMode(el)).toBe('html');
    });

    it('span 元素返回 html', () => {
        const el = document.createElement('span');
        expect(inferContentMode(el)).toBe('html');
    });
});

// ============================================
// parseEventAttr
// ============================================

describe('parseEventAttr', () => {
    it('单个事件', () => {
        const result = parseEventAttr('click');
        expect(result).toEqual([{ event: 'click', once: false, delegate: false }]);
    });

    it('多个事件（逗号分隔）', () => {
        const result = parseEventAttr('input,change');
        expect(result).toEqual([
            { event: 'input', once: false, delegate: false },
            { event: 'change', once: false, delegate: false },
        ]);
    });

    it('once 修饰符', () => {
        const result = parseEventAttr('click?once');
        expect(result).toEqual([{ event: 'click', once: true, delegate: false }]);
    });

    it('delegate 修饰符', () => {
        const result = parseEventAttr('click?delegate');
        expect(result).toEqual([{ event: 'click', once: false, delegate: true }]);
    });

    it('once&delegate 组合修饰符', () => {
        const result = parseEventAttr('click?once&delegate');
        expect(result).toEqual([{ event: 'click', once: true, delegate: true }]);
    });

    it('空格容错', () => {
        const result = parseEventAttr(' click , input ');
        expect(result).toEqual([
            { event: 'click', once: false, delegate: false },
            { event: 'input', once: false, delegate: false },
        ]);
    });

    it('空字符串返回空数组', () => {
        const result = parseEventAttr('');
        expect(result).toEqual([]);
    });
});

// ============================================
// computeNodePath / findByPath
// ============================================

describe('computeNodePath / findByPath', () => {
    it('根元素的直接子节点路径为 [0]', () => {
        const root = document.createElement('div');
        const child = document.createElement('span');
        root.appendChild(child);

        const path = computeNodePath(root, child);
        expect(path).toEqual([0]);

        const found = findByPath(root, path);
        expect(found).toBe(child);
    });

    it('嵌套节点路径正确', () => {
        const root = document.createElement('div');
        const level1 = document.createElement('div');
        const level2 = document.createElement('span');
        root.appendChild(level1);
        level1.appendChild(level2);

        const path = computeNodePath(root, level2);
        expect(path).toEqual([0, 0]);

        const found = findByPath(root, path);
        expect(found).toBe(level2);
    });

    it('多个子节点路径正确', () => {
        const root = document.createElement('div');
        const first = document.createElement('span');
        const second = document.createElement('span');
        const third = document.createElement('span');
        root.appendChild(first);
        root.appendChild(second);
        root.appendChild(third);

        expect(computeNodePath(root, first)).toEqual([0]);
        expect(computeNodePath(root, second)).toEqual([1]);
        expect(computeNodePath(root, third)).toEqual([2]);
    });

    it('findByPath 无效路径返回 null', () => {
        const root = document.createElement('div');
        expect(findByPath(root, [99])).toBeNull();
    });
});

// ============================================
// precompileTemplate
// ============================================

describe('precompileTemplate', () => {
    it('简单模板 — 提取 data-content 节点', () => {
        const html = '<div><span data-content="btn:text"></span></div>';
        const result = precompileTemplate(html, false);

        expect(result.indexPath).toBeDefined();
        expect(result.templateMetas['btn:text']).toBeDefined();
        expect(result.templateMetas['btn:text'].group).toBe('btn');
        expect(result.templateMetas['btn:text'].name).toBe('text');
        expect(result.templateMetas['btn:text'].mode).toBe('html');
    });

    it('无冒号的 data-content — group 为值本身，name 为 _', () => {
        const html = '<div><span data-content="text"></span></div>';
        const result = precompileTemplate(html, false);

        expect(result.templateMetas['text:_']).toBeDefined();
        expect(result.templateMetas['text:_'].group).toBe('text');
        expect(result.templateMetas['text:_'].name).toBe('_');
    });

    it('input 元素 mode 为 value', () => {
        const html = '<div><input data-content="form:field" /></div>';
        const result = precompileTemplate(html, false);

        expect(result.templateMetas['form:field'].mode).toBe('value');
    });

    it('img 元素 mode 为 src', () => {
        const html = '<div><img data-content="avatar:img" /></div>';
        const result = precompileTemplate(html, false);

        expect(result.templateMetas['avatar:img'].mode).toBe('src');
    });

    it('提取 data-i18n 属性', () => {
        const html = '<div><span data-content="btn:text" data-i18n="btn.save"></span></div>';
        const result = precompileTemplate(html, false);

        expect(result.templateMetas['btn:text'].i18nKey).toBe('btn.save');
    });

    it('提取 data-target 属性', () => {
        const html = '<div><div data-content="list:items" data-target=".item"></div></div>';
        const result = precompileTemplate(html, false);

        expect(result.templateMetas['list:items'].delegateTarget).toBe('.item');
    });

    it('提取 data-json 和 data-json-mode 属性', () => {
        const html = '<div><div data-content="grid:body" data-json="gridData" data-json-mode="child"></div></div>';
        const result = precompileTemplate(html, false);

        expect(result.templateMetas['grid:body'].jsonRef).toBe('gridData');
        expect(result.templateMetas['grid:body'].jsonMode).toBe('child');
    });

    it('data-json 无 data-json-mode 时默认为 replace', () => {
        const html = '<div><div data-content="grid:body" data-json="gridData"></div></div>';
        const result = precompileTemplate(html, false);

        expect(result.templateMetas['grid:body'].jsonMode).toBe('replace');
    });

    it('提取 data-template 属性', () => {
        const html = '<div><div data-content="page:content" data-template="contentTpl"></div></div>';
        const result = precompileTemplate(html, false);

        expect(result.templateMetas['page:content'].templateRef).toBe('contentTpl');
    });

    it('预编译内部事件模板（data-event）', () => {
        const html = '<div><button data-content="btn:save" data-event="click"></button></div>';
        const result = precompileTemplate(html, false);

        expect(result.internalEventTemplates.length).toBe(1);
        expect(result.internalEventTemplates[0].event).toBe('click');
        expect(result.internalEventTemplates[0].handler).toBe('onSave');
        expect(result.internalEventTemplates[0].nodeKey).toBe('btn:save');
    });

    it('预编译内部事件模板 — 多区域模式', () => {
        const html = '<div><button data-content="dialog:closeBtn" data-event="tap"></button></div>';
        const result = precompileTemplate(html, true);

        expect(result.internalEventTemplates[0].handler).toBe('onDialogCloseBtn');
    });

    it('预编译内部事件模板 — 无冒号 data-content', () => {
        const html = '<div><button data-content="save" data-event="click"></button></div>';
        const result = precompileTemplate(html, false);

        expect(result.internalEventTemplates[0].handler).toBe('onSave');
    });

    it('预编译内部事件模板 — 带修饰符', () => {
        const html = '<div><button data-content="btn:save" data-event="click?once&delegate"></button></div>';
        const result = precompileTemplate(html, false);

        expect(result.internalEventTemplates[0].once).toBe(true);
        expect(result.internalEventTemplates[0].delegate).toBe(true);
    });

    it('预编译外部事件模板（data-emit）', () => {
        const html = '<div><button data-content="btn:save" data-emit="tap"></button></div>';
        const result = precompileTemplate(html, false);

        expect(result.externalEventTemplates.length).toBe(1);
        expect(result.externalEventTemplates[0].emitKey).toBe('save:tap');
        expect(result.externalEventTemplates[0].nodeKey).toBe('btn:save');
    });

    it('生成内容属性名 — 单区域', () => {
        const html = '<div><span data-content="btn:text"></span></div>';
        const result = precompileTemplate(html, false);

        expect(result.contentPropNames).toContain('text');
    });

    it('生成内容属性名 — 多区域', () => {
        const html = '<div><span data-content="btn:text"></span></div>';
        const result = precompileTemplate(html, true);

        expect(result.contentPropNames).toContain('btnText');
    });

    it('生成内容属性名 — 无冒号', () => {
        const html = '<div><span data-content="text"></span></div>';
        const result = precompileTemplate(html, false);

        expect(result.contentPropNames).toContain('text');
    });

    it('无 data-content 节点时返回空结果', () => {
        const html = '<div>plain text</div>';
        const result = precompileTemplate(html, false);

        expect(Object.keys(result.templateMetas)).toHaveLength(0);
        expect(result.internalEventTemplates).toHaveLength(0);
        expect(result.externalEventTemplates).toHaveLength(0);
        expect(result.contentPropNames).toHaveLength(0);
    });
});

// ============================================
// precompileEventTemplates
// ============================================

describe('precompileEventTemplates', () => {
    it('从 templateMetas 预编译事件模板', () => {
        const templateMetas = {
            'btn:save': {
                raw: 'btn:save', group: 'btn', name: 'save',
                mode: 'html' as const, eventAttr: 'click?once', emitAttr: 'tap',
            },
        };

        const result = precompileEventTemplates(templateMetas, false);

        // 内部事件
        expect(result.internalEventTemplates.length).toBe(1);
        expect(result.internalEventTemplates[0].event).toBe('click');
        expect(result.internalEventTemplates[0].handler).toBe('onSave');
        expect(result.internalEventTemplates[0].once).toBe(true);

        // 外部事件
        expect(result.externalEventTemplates.length).toBe(1);
        expect(result.externalEventTemplates[0].emitKey).toBe('save:tap');
    });

    it('无事件属性时返回空数组', () => {
        const templateMetas = {
            'btn:text': {
                raw: 'btn:text', group: 'btn', name: 'text', mode: 'html' as const,
            },
        };

        const result = precompileEventTemplates(templateMetas, false);
        expect(result.internalEventTemplates).toHaveLength(0);
        expect(result.externalEventTemplates).toHaveLength(0);
    });
});

// ============================================
// buildEventMapFromTemplates
// ============================================

describe('buildEventMapFromTemplates', () => {
    it('从预编译模板构建 eventMap', () => {
        const nodeEl = document.createElement('button');
        const nodeMap = {
            btn: {
                save: { el: nodeEl, raw: 'btn:save', group: 'btn', name: 'save' },
            },
        };

        const internalTemplates: InternalEventTemplate[] = [{
            event: 'click', handler: 'onSave', nodeKey: 'btn:save',
        }];
        const externalTemplates: ExternalEventTemplate[] = [{
            emitKey: 'save:tap', nodeKey: 'btn:save',
        }];

        const result = buildEventMapFromTemplates(internalTemplates, externalTemplates, nodeMap as any);

        expect(result.internal.length).toBe(1);
        expect(result.internal[0].event).toBe('click');
        expect(result.internal[0].handler).toBe('onSave');
        expect(result.internal[0].node.el).toBe(nodeEl);

        expect(result.external['save:tap']).toBeDefined();
        expect(result.external['save:tap'].el).toBe(nodeEl);
    });

    it('nodeMap 中无对应节点时跳过', () => {
        const nodeMap = {};
        const internalTemplates: InternalEventTemplate[] = [{
            event: 'click', handler: 'onSave', nodeKey: 'btn:save',
        }];
        const externalTemplates: ExternalEventTemplate[] = [];

        const result = buildEventMapFromTemplates(internalTemplates, externalTemplates, nodeMap as any);
        expect(result.internal).toHaveLength(0);
    });
});
