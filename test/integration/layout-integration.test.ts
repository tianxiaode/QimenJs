/**
 * 集成测试：Layout + Renderer
 */

import { parseLayout, validateLayout } from '@qimenjs/layout';
import type { LayoutNode } from '@qimenjs/layout';

describe('Layout Integration', () => {
    describe('parseLayout', () => {
        it('should parse simple layout', () => {
            const layout = parseLayout({
                type: 'button',
                id: 'btn1',
                props: { text: 'Click me' },
            });

            expect(layout.type).toBe('button');
            expect(layout.id).toBe('btn1');
            expect(layout.props).toEqual({ text: 'Click me' });
        });

        it('should parse layout with children', () => {
            const layout = parseLayout({
                type: 'vbox',
                id: 'root',
                children: [
                    { type: 'button', id: 'btn1' },
                    { type: 'input', id: 'inp1' },
                ],
            });

            expect(layout.type).toBe('vbox');
            expect(layout.children).toHaveLength(2);
            expect(layout.children![0].type).toBe('button');
            expect(layout.children![1].type).toBe('input');
        });

        it('should normalize handlers', () => {
            const layout = parseLayout({
                type: 'button',
                id: 'btn1',
                handlers: {
                    click: 'handleClick',
                },
            });

            expect(layout.handlers).toBeDefined();
            expect(layout.handlers!.click).toBe('handleClick');
        });

        it('should parse handlers as HandlerConfig objects', () => {
            const layout = parseLayout({
                type: 'button',
                id: 'btn1',
                handlers: {
                    click: { handler: 'onSubmit', once: true, params: { url: '/api' } },
                },
            });

            expect(layout.handlers!.click).toEqual({
                handler: 'onSubmit',
                once: true,
                params: { url: '/api' },
            });
        });
    });

    describe('validateLayout', () => {
        it('should validate correct layout', () => {
            const result = validateLayout({
                type: 'button',
                id: 'btn1',
            });

            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should report missing type', () => {
            const result = validateLayout({
                id: 'btn1',
            } as any);

            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        it('should validate children recursively', () => {
            const result = validateLayout({
                type: 'vbox',
                id: 'root',
                children: [
                    { type: 'button', id: 'btn1' },
                    { id: 'missing-type' } as any,
                ],
            });

            expect(result.valid).toBe(false);
        });
    });
});
