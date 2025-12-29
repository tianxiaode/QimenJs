/**
 * @jest-environment node
 */
import { isTouchDevice, detectInputCapabilities } from '../../../src/runtime-env/input';

describe('runtime-env/input in Node environment', () => {
  describe('isTouchDevice', () => {
    it('在服务端环境（window 为 undefined）时应返回 false', () => {
      expect(isTouchDevice()).toBe(false);
    });
  });

  describe('detectInputCapabilities', () => {
    it('在服务端环境（window 为 undefined）时应返回全为 false 的对象', () => {
      const result = detectInputCapabilities();
      expect(result).toEqual({
        touch: false,
        mouse: false,
        pointer: false
      });
    });
  });
});