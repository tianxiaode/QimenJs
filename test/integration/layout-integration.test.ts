/**
 * 集成测试：Layout Validator
 */

import { validateLayout } from '@qimenjs/layout';
import type { LayoutNode } from '@qimenjs/layout';

describe('Layout Integration', () => {
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
