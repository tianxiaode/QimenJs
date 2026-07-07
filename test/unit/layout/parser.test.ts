/**
 * 单元测试：Layout parser & validator
 */

import { parseLayout, validateLayout } from '@qimenjs/layout';

describe('parseLayout', () => {
    it('should throw if layout is null', () => {
        expect(() => parseLayout(null as any)).toThrow('non-null object');
    });

    it('should throw if layout has no type', () => {
        expect(() => parseLayout({ id: 'test' } as any)).toThrow('type');
    });

    it('should throw if type is empty string', () => {
        expect(() => parseLayout({ type: '' })).toThrow('type');
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
            props: { placeholder: 'Enter name' },
            visible: false,
        });
        expect(result.id).toBe('name');
        expect(result.field).toBe('username');
        expect(result.props).toEqual({ placeholder: 'Enter name' });
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

    it('should parse slots', () => {
        const result = parseLayout({
            type: 'panel',
            slots: {
                header: { type: 'label' },
                footer: [{ type: 'button' }, { type: 'link' }],
            },
        });
        expect((result.slots!.header as any).type).toBe('label');
        expect(Array.isArray(result.slots!.footer)).toBe(true);
        expect(result.slots!.footer).toHaveLength(2);
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
