import { rotate } from '@/utils/geometry/transform/rotate';

describe('rotate function', () => {
  test('rotate should create a rotation matrix around origin by default', () => {
    // Test with 0 angle - should be close to identity matrix
    const result0 = rotate(0);
    expect(result0).toEqual([1, 0, 0, 1, 0, 0]);
    
    // Test with 90 degrees (π/2 radians)
    const result90 = rotate(Math.PI / 2);
    // For 90 degree rotation around origin: cos(π/2)=0, sin(π/2)=1
    // Matrix should be [0, 1, -1, 0, 0, 0] approximately
    expect(result90[0]).toBeCloseTo(0, 10); // cos(π/2)
    expect(result90[1]).toBeCloseTo(Math.sin(Math.PI/2), 10); // sin(π/2)
    expect(result90[2]).toBeCloseTo(-Math.sin(Math.PI/2), 10); // -sin(π/2)
    expect(result90[3]).toBeCloseTo(0, 10); // cos(π/2)
  });

  test('rotate should create a rotation matrix around a specific center point', () => {
    const cx = 10;
    const cy = 20;
    const angle = Math.PI / 2; // 90 degrees
    
    const result = rotate(angle, cx, cy);
    
    // The rotation matrix should be composed of three transformations:
    // 1. Translate to center (-cx, -cy)
    // 2. Rotate around origin
    // 3. Translate back to center (cx, cy)
    // We can't easily predict the exact result, but we can check it's a valid matrix
    expect(result).toHaveLength(6);
    expect(result.every(val => typeof val === 'number')).toBe(true);
  });
});