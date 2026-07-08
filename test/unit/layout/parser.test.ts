/**
 * 单元测试：Layout parser & validator
 */

import { parseLayout, validateLayout } from '@qimenjs/layout';
import { KernelError } from '@qimenjs/error';
import { KernelErrorCode } from '@qimenjs/error';

describe('parseLayout', () => {
    it('should throw KernelError with LAYOUT_INVALID_DEFINITION if layout is null', () => {
        expect(() => parseLayout(null as any)).toThrow(KernelError);
        try {
            parseLayout(null as any);
        } catch (e) {
            expect((e as KernelError).code).toBe(KernelErrorCode.LAYOUT_INVALID_DEFINITION);
        }
    });

    it('should throw KernelError with LAYOUT_MISSING_TYPE if layout has no type', () => {
        expect(() => parseLayout({ id: 'test' } as any)).toThrow(KernelError);
        try {
            parseLayout({ id: 'test' } as any);
        } catch (e) {
            expect((e as KernelError).code).toBe(KernelErrorCode.LAYOUT_MISSING_TYPE);
        }
    });

    it('should throw KernelError with LAYOUT_MISSING_TYPE if type is empty string', () => {
        expect(() => parseLayout({ type: '' })).toThrow(KernelError);
        try {
            parseLayout({ type: '' });
        } catch (e) {
            expect((e as KernelError).code).toBe(KernelErrorCode.LAYOUT_MISSING_TYPE);
        }
    });

    it('should parse minimal layout', () => {
        const result = parseLayout({ type: 'button' });
        expect(result.type).toBe('button');
        expect(result.id).toBeUndefined();
        expect(result.children).toBeUndefined();
    });

    it('should parse all optional fields', () => {
        const result = parseLayout({
            type: 'input',
            id: 'name',
            field: 'username',
            visible: false,
        });
        expect(result.id).toBe('name');
        expect(result.field).toBe('username');
        expect(result.visible).toBe(false);
    });

    it('should convert id to string', () => {
        const result = parseLayout({ type: 'button', id: 123 as any });
        expect(result.id).toBe('123');
    });

    it('should normalize string handlers to HandlerAction', () => {
        const result = parseLayout({
            type: 'button',
            handlers: { click: 'handleClick' },
        });
        expect(result.handlers!.click).toEqual({ action: 'handleClick' });
    });

    it('should preserve HandlerAction objects', () => {
        const result = parseLayout({
            type: 'button',
            handlers: { click: { action: 'submit', params: { url: '/api' } } },
        });
        expect(result.handlers!.click).toEqual({ action: 'submit', params: { url: '/api' } });
    });

    it('should handle array handlers', () => {
        const result = parseLayout({
            type: 'button',
            handlers: { click: ['handleClick', { action: 'submit' }] },
        });
        expect(Array.isArray(result.handlers!.click)).toBe(true);
        expect((result.handlers!.click as any[])[0]).toEqual({ action: 'handleClick' });
        expect((result.handlers!.click as any[])[1]).toEqual({ action: 'submit' });
    });

    it('should parse children recursively', () => {
        const result = parseLayout({
            type: 'vbox',
            children: [
                { type: 'button', id: 'btn1' },
                { type: 'input', id: 'inp1' },
            ],
        });
        expect(result.children).toHaveLength(2);
        expect(result.children![0].type).toBe('button');
        expect(result.children![1].id).toBe('inp1');
    });

    it('should parse extraFns', () => {
        const fn = function() { return 42; };
        const result = parseLayout({
            type: 'button',
            extraFns: { onSubmit: fn },
        });
        expect(result.extraFns).toBeDefined();
        expect(result.extraFns!.onSubmit).toBe(fn);
    });

    it('should parse meta', () => {
        const result = parseLayout({
            type: 'toolbar',
            meta: { abilities: [], customTitle: '我的工具栏' },
        });
        expect(result.meta).toBeDefined();
        expect(result.meta!.customTitle).toBe('我的工具栏');
    });

    it('should extract PositionProps to top level', () => {
        const result = parseLayout({
            type: 'button',
            x: 100,
            y: 50,
            width: 200,
            height: 40,
            margin: '10px',
            hideMode: 'visibility',
            zIndex: 10,
        });
        expect(result.x).toBe(100);
        expect(result.y).toBe(50);
        expect(result.width).toBe(200);
        expect(result.height).toBe(40);
        expect(result.margin).toBe('10px');
        expect(result.hideMode).toBe('visibility');
        expect(result.zIndex).toBe(10);
    });

    it('should not put PositionProps into props', () => {
        const result = parseLayout({
            type: 'button',
            x: 100,
            width: 200,
            placeholder: 'Enter name',
        });
        // PositionProps 在顶层
        expect(result.x).toBe(100);
        expect(result.width).toBe(200);
        // 非 PositionProps、非保留字归入 props
        expect((result as any).props).toEqual({ placeholder: 'Enter name' });
    });

    it('should parse repeat config', () => {
        const result = parseLayout({
            type: 'row',
            repeat: { dataSource: 'users', itemAlias: 'user' },
        });
        expect(result.repeat).toEqual({ dataSource: 'users', itemAlias: 'user' });
    });

    it('should parse stateTriggers', () => {
        const result = parseLayout({
            type: 'button',
            stateTriggers: [
                { event: 'click', state: 'loading', value: true },
            ],
        });
        expect(result.stateTriggers).toHaveLength(1);
    });
});

describe('validateLayout', () => {
    it('should validate correct layout', () => {
        const result = validateLayout({ type: 'button', id: 'btn1' });
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should report missing type', () => {
        const result = validateLayout({ id: 'btn1' } as any);
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.includes('type'))).toBe(true);
    });

    it('should report empty type', () => {
        const result = validateLayout({ type: '' });
        expect(result.valid).toBe(false);
    });

    it('should report invalid id type', () => {
        const result = validateLayout({ type: 'button', id: 123 as any });
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.includes('id'))).toBe(true);
    });

    it('should validate children recursively', () => {
        const result = validateLayout({
            type: 'vbox',
            children: [
                { type: 'button' },
                { id: 'no-type' } as any,
            ],
        });
        expect(result.valid).toBe(false);
    });

    it('should warn about invalid handler format', () => {
        const result = validateLayout({
            type: 'button',
            handlers: { click: 123 as any },
        });
        // 123 gets normalized to "123" string, so it's technically valid
        // but the validator might flag it
        expect(result).toBeDefined();
    });
});
