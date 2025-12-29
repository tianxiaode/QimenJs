import { distance, isWithinRadius, isWithinSquare, calculateVelocity, getCoordinateValue } from '@/utils/geometry';

describe('point functions', () => {
  test('distance should calculate Euclidean distance between two points', () => {
    const a = { x: 0, y: 0 };
    const b = { x: 3, y: 4 };
    expect(distance(a, b)).toBe(5); // 3-4-5 triangle
    
    const samePoint = { x: 5, y: 5 };
    expect(distance(samePoint, samePoint)).toBe(0);
  });

  test('isWithinRadius should check if two points are within a given radius', () => {
    const a = { x: 0, y: 0 };
    const b = { x: 3, y: 4 };
    
    // Distance is 5, so it should be within radius 5 but not within radius 4
    expect(isWithinRadius(a, b, 5)).toBe(true);
    expect(isWithinRadius(a, b, 4)).toBe(false);
    
    // Same point should be within any positive radius
    const samePoint = { x: 5, y: 5 };
    expect(isWithinRadius(samePoint, samePoint, 0)).toBe(true);
    expect(isWithinRadius(samePoint, samePoint, 1)).toBe(true);
  });

  test('isWithinSquare should check if two points are within a square area', () => {
    const a = { x: 0, y: 0 };
    const b = { x: 3, y: 4 };
    
    // Check if points are within square distance (each axis separately)
    expect(isWithinSquare(a, b, 6)).toBe(true); // Both |3| < 6 and |4| < 6
    expect(isWithinSquare(a, b, 5)).toBe(true); // Both |3| < 5 and |4| < 5
    expect(isWithinSquare(a, b, 4)).toBe(false); // |4| is not < 4
    expect(isWithinSquare(a, b, 3)).toBe(false); // |4| is not < 3
  });

  test('calculateVelocity should calculate velocity based on distance and duration', () => {
    expect(calculateVelocity(100, 10)).toBe(10); // 100 / 10
    expect(calculateVelocity(0, 5)).toBe(0); // 0 / 5
    expect(calculateVelocity(50, 0)).toBe(0); // Division by zero guard
  });

  test('getCoordinateValue should return the value or a default', () => {
    expect(getCoordinateValue(42)).toBe(42);
    expect(getCoordinateValue(42, 10)).toBe(42);
    expect(getCoordinateValue(null)).toBe(0);
    expect(getCoordinateValue(null, 10)).toBe(10);
    expect(getCoordinateValue(undefined)).toBe(0);
    expect(getCoordinateValue(undefined, 5)).toBe(5);
    expect(getCoordinateValue(0)).toBe(0);
  });
});