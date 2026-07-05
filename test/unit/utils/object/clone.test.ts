import { clone, deepMerge } from '../../../../src/utils/object/clone';

describe('clone.ts - clone and deepMerge', () => {
    describe('clone', () => {
        test('should clone primitive values', () => {
            expect(clone(42)).toBe(42);
            expect(clone('hello')).toBe('hello');
            expect(clone(true)).toBe(true);
            expect(clone(null)).toBe(null);
            expect(clone(undefined)).toBe(undefined);
        });

        test('should clone arrays', () => {
            const original = [1, 2, 3];
            const cloned = clone(original);

            expect(cloned).toEqual(original);
            expect(cloned).not.toBe(original); // Should be a different reference

            (cloned as number[])[0] = 99;
            expect(original[0]).toBe(1); // Original should remain unchanged
        });

        test('should clone nested arrays', () => {
            const original = [1, [2, 3], [4, [5, 6]]];
            const cloned = clone(original);

            expect(cloned).toEqual(original);
            expect(cloned).not.toBe(original);
            expect((cloned as any[])[1]).not.toBe((original as any[])[1]);
            expect((cloned as any[])[2]).not.toBe((original as any[])[2]);
            expect((cloned as any[])[2][1]).not.toBe((original as any[])[2][1]);
        });

        test('should clone plain objects', () => {
            const original = { a: 1, b: { c: 2 } };
            const cloned = clone(original);

            expect(cloned).toEqual(original);
            expect(cloned).not.toBe(original);

            (cloned as any).b.c = 99;
            expect(original.b.c).toBe(2); // Original should remain unchanged
        });

        test('should clone dates', () => {
            const original = new Date('2022-01-01');
            const cloned = clone(original);

            expect(cloned.getTime()).toBe(original.getTime());
            expect(cloned).not.toBe(original); // Should be a different reference

            (cloned as Date).setTime(new Date('2023-01-01').getTime());
            expect(original.getTime()).toBe(new Date('2022-01-01').getTime()); // Original should remain unchanged
        });

        test('should clone regular expressions', () => {
            const original = /test/gi;
            const cloned = clone(original);

            expect(cloned.source).toBe(original.source);
            expect(cloned.flags).toBe(original.flags);
            expect(cloned).not.toBe(original); // Should be a different reference
        });

        test('should clone nested objects with mixed types', () => {
            const original = {
                a: 1,
                b: {
                    c: [1, 2, { d: 'nested' }],
                    e: new Date('2022-01-01'),
                    f: /test/i,
                },
                g: 'string',
            };

            const cloned = clone(original);

            expect(cloned).toEqual(original);
            expect(cloned).not.toBe(original);
            expect((cloned as any).b.c).not.toBe((original as any).b.c);
            expect((cloned as any).b.e).not.toBe((original as any).b.e);
            expect((cloned as any).b.f).not.toBe((original as any).b.f);
        });
    });

    describe('deepMerge', () => {
        test('should merge simple objects', () => {
            const target = { a: 1, b: 2 };
            const source = { b: 3, c: 4 };

            const result = deepMerge(target, source);

            expect(result).toEqual({ a: 1, b: 3, c: 4 });
            expect(result).not.toBe(target); // Should return a new object, not modify target
        });

        test('should deep merge nested objects', () => {
            const target = { a: 1, b: { c: 2, d: 3 } };
            const source = { b: { d: 4, e: 5 }, f: 6 };

            const result = deepMerge(target, source);

            expect(result).toEqual({
                a: 1,
                b: { c: 2, d: 4, e: 5 },
                f: 6,
            });
            expect(result).not.toBe(target); // Should return a new object, not modify target
        });

        test('should not merge when types differ', () => {
            const target = { a: { b: 1 } };
            const source = { a: 'string' }; // Different type

            const result = deepMerge(target, source);

            // Source value should replace target value when types differ
            expect(result).toEqual({ a: 'string' });
            expect(result).not.toBe(target); // Should return a new object, not modify target
        });

        test('should handle arrays correctly (not deep merging)', () => {
            const target = { a: [1, 2, { c: 3 }] };
            const source = { a: [3, 4, { d: 5 }] };

            const result = deepMerge(target, source);

            // Arrays are replaced, not merged
            expect(result).toEqual({ a: [3, 4, { d: 5 }] });
            expect(result).not.toBe(target); // Should return a new object, not modify target
        });

        test('should handle undefined source values', () => {
            const target = { a: 1, b: { c: 2 } };
            const source = { a: undefined, b: { c: undefined } };

            const result = deepMerge(target, source);

            expect(result).toEqual({ a: undefined, b: { c: undefined } });
            expect(result).not.toBe(target); // Should return a new object, not modify target
        });
    });
});
