/**
 * 单元测试：AtomicCSS
 */

import { AtomicCSS } from '@qimenjs/theme';

describe('AtomicCSS', () => {
    let atomic: AtomicCSS;

    beforeEach(() => {
        atomic = AtomicCSS.getInstance();
        atomic.clear();
    });

    describe('getInstance', () => {
        it('should return singleton instance', () => {
            const a1 = AtomicCSS.getInstance();
            const a2 = AtomicCSS.getInstance();
            expect(a1).toBe(a2);
        });
    });

    describe('resolve', () => {
        it('should resolve predefined atomic class and return class name', () => {
            const result = atomic.resolve('q-flex');
            expect(result).toContain('q-flex');
        });

        it('should return original name for unknown class', () => {
            const result = atomic.resolve('q-unknown-class');
            // Unknown classes are passed through
            expect(result).toContain('q-unknown-class');
        });

        it('should handle multiple class names', () => {
            const result = atomic.resolve('q-flex q-items-center');
            expect(result).toContain('q-flex');
            expect(result).toContain('q-items-center');
        });
    });

    describe('registerRule', () => {
        it('should register custom rule', () => {
            atomic.registerRule('q-custom', { color: 'red' });
            const result = atomic.resolve('q-custom');
            expect(result).toContain('q-custom');
        });

        it('should allow custom rule to override predefined', () => {
            atomic.registerRule('q-flex', { display: 'inline-flex' });
            const result = atomic.resolve('q-flex');
            expect(result).toContain('q-flex');
        });
    });

    describe('generate', () => {
        it('should generate CSS string for given class names', () => {
            const css = atomic.generate(['q-flex', 'q-items-center']);
            expect(css).toContain('.q-flex');
            expect(css).toContain('.q-items-center');
        });

        it('should skip unknown class names', () => {
            const css = atomic.generate(['q-flex', 'q-unknown']);
            expect(css).toContain('.q-flex');
            expect(css).not.toContain('.q-unknown');
        });

        it('should return empty string for empty array', () => {
            const css = atomic.generate([]);
            expect(css).toBe('');
        });
    });

    describe('clear', () => {
        it('should clear generated cache', () => {
            const css1 = atomic.generate(['q-flex']);
            expect(css1).toBeTruthy();
            atomic.clear();
            const css2 = atomic.generate(['q-flex']);
            expect(css2).toBeTruthy();
        });
    });
});
