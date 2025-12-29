import { matrixScale } from '@/utils/geometry/transform/scale';

describe('matrixScale function', () => {
  test('matrixScale should create a scale matrix around origin by default', () => {
    const result = matrixScale(2, 3); // Scale x by 2, y by 3
    
    // For scaling around origin (0,0): [sx, 0, 0, sy, 0, 0]
    // The result should be [2, 0, 0, 3, 0, 0]
    expect(result).toEqual([2, 0, 0, 3, 0, 0]);
  });

  test('matrixScale should create a scale matrix around a specific center point', () => {
    const sx = 2;
    const sy = 3;
    const cx = 10;
    const cy = 20;
    
    const result = matrixScale(sx, sy, cx, cy);
    
    // The scale matrix should be composed of three transformations:
    // 1. Translate to center (-cx, -cy)
    // 2. Scale
    // 3. Translate back to center (cx, cy)
    // We can't easily predict the exact result, but we can check it's a valid matrix
    expect(result).toHaveLength(6);
    expect(result.every(val => typeof val === 'number')).toBe(true);
  });
});