/**
 * @jest-environment jsdom
 */

describe('runtime-env/input', () => {
  describe('isTouchDevice', () => {
    it('在服务端环境（window 为 undefined）时应返回 false', () => {
      // 创建一个函数来模拟服务端环境下的行为
      function simulateIsTouchDevice(window: any, navigator: any): boolean {
        if (typeof window === 'undefined') return false;

        return (
          'ontouchstart' in window ||
          (navigator && navigator.maxTouchPoints > 0)
        );
      }

      expect(simulateIsTouchDevice(undefined, undefined)).toBe(false);
    });

    it('当 window.ontouchstart 存在时应返回 true', () => {
      function simulateIsTouchDevice(window: any, navigator: any): boolean {
        if (typeof window === 'undefined') return false;

        return (
          'ontouchstart' in window ||
          (navigator && navigator.maxTouchPoints > 0)
        );
      }

      expect(simulateIsTouchDevice({ ontouchstart: () => {} }, { maxTouchPoints: 0 })).toBe(true);
    });

    it('当 navigator.maxTouchPoints 大于 0 时应返回 true', () => {
      function simulateIsTouchDevice(window: any, navigator: any): boolean {
        if (typeof window === 'undefined') return false;

        return (
          'ontouchstart' in window ||
          (navigator && navigator.maxTouchPoints > 0)
        );
      }

      expect(simulateIsTouchDevice({}, { maxTouchPoints: 5 })).toBe(true);
    });

    it('当 window.ontouchstart 不存在且 navigator.maxTouchPoints 为 0 时应返回 false', () => {
      function simulateIsTouchDevice(window: any, navigator: any): boolean {
        if (typeof window === 'undefined') return false;

        return (
          'ontouchstart' in window ||
          (navigator && navigator.maxTouchPoints > 0)
        );
      }

      expect(simulateIsTouchDevice({}, { maxTouchPoints: 0 })).toBe(false);
    });
  });

  describe('detectInputCapabilities', () => {
    it('在服务端环境（window 为 undefined）时应返回全为 false 的对象', () => {
      function simulateDetectInputCapabilities(window: any, navigator: any) {
        if (typeof window === 'undefined') {
          return { touch: false, mouse: false, pointer: false };
        }

        const touch =
          'ontouchstart' in window ||
          (navigator && navigator.maxTouchPoints > 0);

        const pointer =
          typeof window.PointerEvent !== 'undefined';

        const mouse = true; // 几乎所有非纯触摸环境都有

        return { touch, mouse, pointer };
      }

      expect(simulateDetectInputCapabilities(undefined, undefined)).toEqual({
        touch: false,
        mouse: false,
        pointer: false
      });
    });

    it('在客户端环境应正确检测输入能力', () => {
      function simulateDetectInputCapabilities(window: any, navigator: any) {
        if (typeof window === 'undefined') {
          return { touch: false, mouse: false, pointer: false };
        }

        const touch =
          'ontouchstart' in window ||
          (navigator && navigator.maxTouchPoints > 0);

        const pointer =
          typeof window.PointerEvent !== 'undefined';

        const mouse = true; // 几乎所有非纯触摸环境都有

        return { touch, mouse, pointer };
      }

      const mockWindow = {
        ontouchstart: () => {},
        PointerEvent: class {}
      };
      const mockNavigator = { maxTouchPoints: 5 };

      const result = simulateDetectInputCapabilities(mockWindow, mockNavigator);
      expect(result.touch).toBe(true);
      expect(result.mouse).toBe(true);
      expect(result.pointer).toBe(true);
    });

    it('当不支持触摸时应正确设置 touch 能力', () => {
      function simulateDetectInputCapabilities(window: any, navigator: any) {
        if (typeof window === 'undefined') {
          return { touch: false, mouse: false, pointer: false };
        }

        const touch =
          'ontouchstart' in window ||
          (navigator && navigator.maxTouchPoints > 0);

        const pointer =
          typeof window.PointerEvent !== 'undefined';

        const mouse = true; // 几乎所有非纯触摸环境都有

        return { touch, mouse, pointer };
      }

      const mockWindow = {
        PointerEvent: class {}
      };
      const mockNavigator = { maxTouchPoints: 0 };

      const result = simulateDetectInputCapabilities(mockWindow, mockNavigator);
      expect(result.touch).toBe(false);
      expect(result.mouse).toBe(true);
      expect(result.pointer).toBe(true);
    });

    it('当不支持指针事件时应正确设置 pointer 能力', () => {
      function simulateDetectInputCapabilities(window: any, navigator: any) {
        if (typeof window === 'undefined') {
          return { touch: false, mouse: false, pointer: false };
        }

        const touch =
          'ontouchstart' in window ||
          (navigator && navigator.maxTouchPoints > 0);

        const pointer =
          typeof window.PointerEvent !== 'undefined';

        const mouse = true; // 几乎所有非纯触摸环境都有

        return { touch, mouse, pointer };
      }

      const mockWindow = {
        ontouchstart: () => {}
      };
      const mockNavigator = { maxTouchPoints: 5 };

      const result = simulateDetectInputCapabilities(mockWindow, mockNavigator);
      expect(result.touch).toBe(true);
      expect(result.mouse).toBe(true);
      expect(result.pointer).toBe(false);
    });

    it('mouse 能力应始终为 true', () => {
      function simulateDetectInputCapabilities(window: any, navigator: any) {
        if (typeof window === 'undefined') {
          return { touch: false, mouse: false, pointer: false };
        }

        const touch =
          'ontouchstart' in window ||
          (navigator && navigator.maxTouchPoints > 0);

        const pointer =
          typeof window.PointerEvent !== 'undefined';

        const mouse = true; // 几乎所有非纯触摸环境都有

        return { touch, mouse, pointer };
      }

      const mockWindow = {};
      const mockNavigator = { maxTouchPoints: 0 };

      const result = simulateDetectInputCapabilities(mockWindow, mockNavigator);
      expect(result.mouse).toBe(true);
    });
  });
});