import { contains, center } from '@/utils/geometry';

describe('rect functions', () => {
  test('contains should check if a point is inside a rectangle', () => {
    const rect = { x: 10, y: 10, width: 20, height: 30 }; // From (10,10) to (30,40)
    const pointInside = { x: 20, y: 25 };
    const pointOutside = { x: 5, y: 5 };
    const pointOnEdge = { x: 10, y: 10 }; // On the edge should be considered inside
    
    expect(contains(rect, pointInside)).toBe(true);
    expect(contains(rect, pointOutside)).toBe(false);
    expect(contains(rect, pointOnEdge)).toBe(true);
    
    // Test point on the right/bottom edges (should be inside)
    expect(contains(rect, { x: 30, y: 25 })).toBe(true); // On right edge
    expect(contains(rect, { x: 20, y: 40 })).toBe(true); // On bottom edge
    expect(contains(rect, { x: 31, y: 25 })).toBe(false); // Right of rectangle
    expect(contains(rect, { x: 20, y: 41 })).toBe(false); // Below rectangle
  });

  test('center should return the center point of a rectangle', () => {
    const rect = { x: 10, y: 20, width: 30, height: 40 };
    const expectedCenter = { x: 25, y: 40 }; // x + width/2, y + height/2
    
    expect(center(rect)).toEqual(expectedCenter);
    
    // Test with a rectangle at origin
    const originRect = { x: 0, y: 0, width: 10, height: 10 };
    expect(center(originRect)).toEqual({ x: 5, y: 5 });
    
    // Test with a square
    const square = { x: 5, y: 5, width: 20, height: 20 };
    expect(center(square)).toEqual({ x: 15, y: 15 });
  });
});