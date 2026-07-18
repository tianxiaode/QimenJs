/**
 * template-compiler.ts 单元测试
 *
 * 覆盖：findByPath、computeNodePath、inferContentMode、parseEventAttr
 */

import {
    findByPath,
    computeNodePath,
    inferContentMode,
    parseEventAttr,
} from '@/component-core/template-compiler';

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

    it('debounce 修饰符', () => {
        const result = parseEventAttr('input?debounce=300');
        expect(result).toEqual([{ event: 'input', once: false, delegate: false, debounce: 300 }]);
    });

    it('throttle 修饰符', () => {
        const result = parseEventAttr('scroll?throttle=100');
        expect(result).toEqual([{ event: 'scroll', once: false, delegate: false, throttle: 100 }]);
    });

    it('once&debounce 组合修饰符', () => {
        const result = parseEventAttr('click?once&debounce=500');
        expect(result).toEqual([{ event: 'click', once: true, delegate: false, debounce: 500 }]);
    });

    it('delegate&throttle 组合修饰符', () => {
        const result = parseEventAttr('tap?delegate&throttle=200');
        expect(result).toEqual([{ event: 'tap', once: false, delegate: true, throttle: 200 }]);
    });

    it('多个事件各自带不同修饰符', () => {
        const result = parseEventAttr('click?once, input?debounce=300');
        expect(result).toEqual([
            { event: 'click', once: true, delegate: false },
            { event: 'input', once: false, delegate: false, debounce: 300 },
        ]);
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
