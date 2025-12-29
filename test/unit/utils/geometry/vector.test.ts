import { subtract, add, scale } from '@/utils/geometry';

describe('vector functions', () => {
  test('subtract should calculate the difference between two points (a - b)', () => {
    const a = { x: 10, y: 20 };
    const b = { x: 5, y: 8 };
    expect(subtract(a, b)).toEqual({ x: 5, y: 12 });
    
    const samePoint = { x: 7, y: 7 };
    expect(subtract(samePoint, samePoint)).toEqual({ x: 0, y: 0 });
    
    // Test with negative result
    const c = { x: 3, y: 4 };
    const d = { x: 8, y: 12 };
    expect(subtract(c, d)).toEqual({ x: -5, y: -8 });
  });

  test('add should calculate the sum of two points', () => {
    const a = { x: 10, y: 20 };
    const b = { x: 5, y: 8 };
    expect(add(a, b)).toEqual({ x: 15, y: 28 });
    
    // Test with negative values
    const c = { x: -3, y: 7 };
    const d = { x: 5, y: -2 };
    expect(add(c, d)).toEqual({ x: 2, y: 5 });
  });

  test('scale should multiply a vector by a scalar', () => {
    const v = { x: 5, y: 10 };
    expect(scale(v, 2)).toEqual({ x: 10, y: 20 });
    
    // Test with fractional scaling
    expect(scale(v, 0.5)).toEqual({ x: 2.5, y: 5 });
    
    // Test with negative scaling
    expect(scale(v, -2)).toEqual({ x: -10, y: -20 });
    
    // Test with zero scaling
    expect(scale(v, 0)).toEqual({ x: 0, y: 0 });
  });
});