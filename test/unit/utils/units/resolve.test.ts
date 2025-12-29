import { resolveLengthToPx } from '@/utils/units/resolve';

// Mock DOM elements and window properties for testing
describe('resolve utils', () => {
  // Set up jsdom environment for testing
  beforeEach(() => {
    // Mock getComputedStyle
    Object.defineProperty(window, 'getComputedStyle', {
      value: (el: HTMLElement) => {
        if (el === document.documentElement) {
          return { fontSize: '16px' } as any;
        }
        return { fontSize: '14px' } as any;
      },
      writable: true,
    });

    // Mock window properties
    Object.defineProperty(window, 'innerWidth', {
      value: 1000,
      writable: true,
    });

    Object.defineProperty(window, 'innerHeight', {
      value: 800,
      writable: true,
    });
  });

  describe('resolveLengthToPx', () => {
    test('should return number input directly', () => {
      expect(resolveLengthToPx(42)).toBe(42);
      expect(resolveLengthToPx(0)).toBe(0);
      expect(resolveLengthToPx(-5)).toBe(-5);
    });

    test('should parse and convert valid length strings', () => {
      // Test px units
      expect(() => resolveLengthToPx('16px')).not.toThrow();
      
      // Test rem units
      expect(() => resolveLengthToPx('1rem')).not.toThrow();
      
      // Test em units
      expect(() => resolveLengthToPx('2em')).not.toThrow();
      
      // Test vw units
      expect(() => resolveLengthToPx('50vw')).not.toThrow();
      
      // Test vh units
      expect(() => resolveLengthToPx('30vh')).not.toThrow();
      
      // Note: % units require percentBase in the context, which is not available in this function
      // So we don't test them here as they will always throw without proper context
    });

    test('should throw error for invalid length strings', () => {
      expect(() => resolveLengthToPx('invalid')).toThrow('Invalid length: invalid');
      expect(() => resolveLengthToPx('')).toThrow('Invalid length: ');
      expect(() => resolveLengthToPx('10xyz')).toThrow('Invalid length: 10xyz');
    });

    test('should handle px units correctly', () => {
      const result = resolveLengthToPx('16px');
      // For px units, toPx should return the value directly
      expect(typeof result).toBe('number');
      expect(result).toBe(16);
    });
    
    test('should handle rem units correctly', () => {
      const result = resolveLengthToPx('2rem');
      // 2rem with rootFontSize of 16px should be 32px
      expect(typeof result).toBe('number');
      expect(result).toBe(32);
    });
    
    test('should handle em units correctly', () => {
      const result = resolveLengthToPx('2em');
      // 2em with fontSize of 16px (default root) should be 32px
      expect(typeof result).toBe('number');
      expect(result).toBe(32);
    });
    
    test('should handle vw units correctly', () => {
      const result = resolveLengthToPx('50vw');
      // 50vw with innerWidth of 1000px should be 500px
      expect(typeof result).toBe('number');
      expect(result).toBe(500);
    });
    
    test('should handle vh units correctly', () => {
      const result = resolveLengthToPx('30vh');
      // 30vh with innerHeight of 800px should be 240px
      expect(typeof result).toBe('number');
      expect(result).toBe(240);
    });

    test('should handle % units using browser fallback instead of throwing', () => {
      // % units now use the browser fallback method instead of throwing an error
      expect(() => resolveLengthToPx('25%')).not.toThrow();
    });
  });
});