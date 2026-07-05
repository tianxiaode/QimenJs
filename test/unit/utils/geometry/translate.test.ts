import { translate } from '@/utils/geometry/transform/translate';

describe('translate function', () => {
    test('translate should create a translation matrix', () => {
        const result = translate(10, 20);

        // Translation matrix format: [1, 0, 0, 1, x, y]
        expect(result).toEqual([1, 0, 0, 1, 10, 20]);
    });

    test('translate should work with negative values', () => {
        const result = translate(-5, -10);

        expect(result).toEqual([1, 0, 0, 1, -5, -10]);
    });

    test('translate should work with zero values', () => {
        const result = translate(0, 0);

        expect(result).toEqual([1, 0, 0, 1, 0, 0]); // Identity matrix
    });
});
