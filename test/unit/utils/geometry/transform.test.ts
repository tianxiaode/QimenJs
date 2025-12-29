import { applyToPoint, applyToRect } from '@/utils/geometry/transform';
import { identity, multiply } from '@/utils/geometry/transform/matrix';

describe('transform functions', () => {
  test('applyToPoint should apply a transformation matrix to a point', () => {
    // Identity matrix - should not change the point
    const identityMatrix: [number, number, number, number, number, number] = [1, 0, 0, 1, 0, 0];
    const point = { x: 10, y: 20 };
    expect(applyToPoint(point, identityMatrix)).toEqual({ x: 10, y: 20 });
    
    // Translation matrix - move point by (5, 10)
    const translationMatrix: [number, number, number, number, number, number] = [1, 0, 0, 1, 5, 10];
    expect(applyToPoint(point, translationMatrix)).toEqual({ x: 15, y: 30 });
    
    // Scale matrix - scale by 2x
    const scaleMatrix: [number, number, number, number, number, number] = [2, 0, 0, 2, 0, 0];
    expect(applyToPoint(point, scaleMatrix)).toEqual({ x: 20, y: 40 });
  });

  test('applyToRect should apply a transformation matrix to a rectangle', () => {
    const rect = { x: 0, y: 0, width: 10, height: 10 }; // From (0,0) to (10,10)
    const identityMatrix: [number, number, number, number, number, number] = [1, 0, 0, 1, 0, 0];
    
    // Identity transform - should not change the rectangle
    expect(applyToRect(rect, identityMatrix)).toEqual(rect);
    
    // Translation matrix - move rectangle by (5, 10)
    const translationMatrix: [number, number, number, number, number, number] = [1, 0, 0, 1, 5, 10];
    expect(applyToRect(rect, translationMatrix)).toEqual({ 
      x: 5, 
      y: 10, 
      width: 10, 
      height: 10 
    });
  });
});

describe('matrix functions', () => {
  test('identity should return identity matrix', () => {
    expect(identity()).toEqual([1, 0, 0, 1, 0, 0]);
  });

  test('multiply should multiply two matrices correctly', () => {
    // Identity matrix multiplied by any matrix should return the same matrix
    const matrixA: [number, number, number, number, number, number] = [2, 0, 0, 3, 4, 5];
    const result = multiply(matrixA, identity());
    expect(result).toEqual(matrixA);
    
    // Multiply two non-identity matrices
    const matrixB: [number, number, number, number, number, number] = [1, 2, 3, 1, 2, 3];
    const expected: [number, number, number, number, number, number] = [
      matrixA[0] * matrixB[0] + matrixA[2] * matrixB[1], // 2*1 + 0*2 = 2
      matrixA[1] * matrixB[0] + matrixA[3] * matrixB[1], // 0*1 + 3*2 = 6
      matrixA[0] * matrixB[2] + matrixA[2] * matrixB[3], // 2*3 + 0*1 = 6
      matrixA[1] * matrixB[2] + matrixA[3] * matrixB[3], // 0*3 + 3*1 = 3
      matrixA[0] * matrixB[4] + matrixA[2] * matrixB[5] + matrixA[4], // 2*2 + 0*3 + 4 = 8
      matrixA[1] * matrixB[4] + matrixA[3] * matrixB[5] + matrixA[5]  // 0*2 + 3*3 + 5 = 14
    ];
    expect(multiply(matrixA, matrixB)).toEqual(expected);
  });
});