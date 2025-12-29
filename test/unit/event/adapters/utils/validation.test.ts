import { validateDoubleTap, validateLongPress, validateSwipe, validateTap } from '@/event/adapters/utils/validation';

describe('validation functions', () => {
  describe('validateDoubleTap', () => {
    test('should return true when taps are within time and distance limits', () => {
      const result = validateDoubleTap(
        1000,    // now
        800,     // lastTapTime (200ms ago)
        100,     // currentX
        100,     // currentY
        105,     // lastTapX
        105,     // lastTapY
        300,     // maxInterval (300ms)
        20       // maxDistance (20px)
      );
      expect(result).toBe(true);
    });

    test('should return false when time interval exceeds limit', () => {
      const result = validateDoubleTap(
        1000,
        600,     // 400ms ago, exceeds maxInterval of 300ms
        100,
        100,
        105,
        105,
        300,     // maxInterval
        20
      );
      expect(result).toBe(false);
    });

    test('should return false when distance exceeds limit', () => {
      const result = validateDoubleTap(
        1000,
        800,
        100,     // currentX
        100,     // currentY
        150,     // lastTapX (50px away, exceeds maxDistance of 20px)
        100,
        300,
        20       // maxDistance
      );
      expect(result).toBe(false);
    });
  });

  describe('validateLongPress', () => {
    test('should return true when current position is within max distance from start', () => {
      const result = validateLongPress(
        100,     // startX
        100,     // startY
        105,     // currentX
        105,     // currentY
        10       // maxDistance
      );
      expect(result).toBe(true);
    });

    test('should return false when current position is outside max distance', () => {
      const result = validateLongPress(
        100,
        100,
        125,     // currentX (25px away, exceeds maxDistance of 20px)
        100,
        20       // maxDistance
      );
      expect(result).toBe(false);
    });

    test('should return true when positions are identical', () => {
      const result = validateLongPress(
        100,
        100,
        100,
        100,
        10       // maxDistance
      );
      expect(result).toBe(true);
    });
  });

  describe('validateSwipe', () => {
    test('should return true when swipe meets all criteria', () => {
      // Distance > min, duration < max, velocity > min
      const result = validateSwipe(
        100,     // distance (100px)
        100,     // duration (100ms)
        50,      // minDistance
        200,     // maxDuration
        0.5      // minVelocity (0.5px/ms)
      );
      expect(result).toBe(true); // velocity = 100/100 = 1px/ms, which is > minVelocity
    });

    test('should return false when duration exceeds max', () => {
      const result = validateSwipe(
        100,
        250,     // duration exceeds maxDuration of 200ms
        50,
        200,     // maxDuration
        0.5
      );
      expect(result).toBe(false);
    });

    test('should return false when distance is less than min', () => {
      const result = validateSwipe(
        30,      // distance less than minDistance of 50px
        100,
        50,      // minDistance
        200,
        0.5
      );
      expect(result).toBe(false);
    });

    test('should return false when velocity is less than min', () => {
      const result = validateSwipe(
        50,      // distance
        200,     // duration -> velocity = 50/200 = 0.25px/ms, less than minVelocity of 0.5
        30,      // minDistance
        300,     // maxDuration
        0.5      // minVelocity
      );
      expect(result).toBe(false);
    });
  });

  describe('validateTap', () => {
    test('should return true when duration and distance are within limits', () => {
      const result = validateTap(
        100,     // duration
        10,      // distance
        200,     // maxDuration
        20       // maxDistance
      );
      expect(result).toBe(true);
    });

    test('should return false when duration exceeds limit', () => {
      const result = validateTap(
        250,     // duration exceeds maxDuration of 200ms
        10,
        200,     // maxDuration
        20
      );
      expect(result).toBe(false);
    });

    test('should return false when distance exceeds limit', () => {
      const result = validateTap(
        100,
        25,      // distance exceeds maxDistance of 20px
        200,
        20       // maxDistance
      );
      expect(result).toBe(false);
    });

    test('should return false when both duration and distance exceed limits', () => {
      const result = validateTap(
        250,     // duration exceeds limit
        25,      // distance exceeds limit
        200,     // maxDuration
        20       // maxDistance
      );
      expect(result).toBe(false);
    });
  });
});