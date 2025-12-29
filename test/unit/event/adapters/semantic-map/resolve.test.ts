import { resolveInputEventMap } from '@/event/adapters/semantic-map/resolve';
import { InputEventMap } from '@/event/adapters/semantic-map/types';

// 模拟输入能力检测结果
const mockCapabilities = {
  pointer: false,
  touch: false,
  mouse: true,
};

// 模拟 detectInputCapabilities 函数
jest.mock('@orbitjs/runtime-env', () => ({
  detectInputCapabilities: jest.fn(() => mockCapabilities),
}));

describe('resolveInputEventMap', () => {
  let baseMap: InputEventMap;
  let pointerMap: InputEventMap;
  let touchMap: InputEventMap;
  let mouseMap: InputEventMap;
  let keyboardMap: InputEventMap;

  beforeEach(() => {
    baseMap = {
      press: { pointer: ['pointerdown'], touch: ['touchstart'], mouse: ['mousedown'] },
      release: { pointer: ['pointerup'], touch: ['touchend'], mouse: ['mouseup'] },
    };

    pointerMap = {
      move: { pointer: ['pointermove'] },
    };

    touchMap = {
      move: { touch: ['touchmove'] },
    };

    mouseMap = {
      move: { mouse: ['mousemove'] },
    };

    keyboardMap = {
      keydown: { keyboard: ['keydown'] },
    };
  });

  test('应该始终包含 baseMap 的事件映射', () => {
    const result = resolveInputEventMap({
      base: baseMap,
      mouse: mouseMap,
      keyboard: keyboardMap,
    });

    expect(result).toHaveProperty('press');
    expect(result).toHaveProperty('release');
    expect(result.press).toEqual(baseMap.press);
    expect(result.release).toEqual(baseMap.release);
  });

  test('当设备支持 pointer 且提供了 pointerMap 时，应该添加 pointerMap', () => {
    (mockCapabilities as any).pointer = true;
    (mockCapabilities as any).touch = false;
    (mockCapabilities as any).mouse = true;

    const result = resolveInputEventMap({
      base: baseMap,
      pointer: pointerMap,
      touch: touchMap,
      mouse: mouseMap,
      keyboard: keyboardMap,
    });

    expect(result).toHaveProperty('move');
    expect(result.move).toEqual(pointerMap.move);
    // keyboardMap 会单独处理，所以也应该存在
    expect(result).toHaveProperty('keydown');
  });

  test('当设备不支持 pointer 但支持 touch 时，应该添加 touchMap', () => {
    (mockCapabilities as any).pointer = false;
    (mockCapabilities as any).touch = true;
    (mockCapabilities as any).mouse = true;

    const result = resolveInputEventMap({
      base: baseMap,
      pointer: pointerMap,
      touch: touchMap,
      mouse: mouseMap,
      keyboard: keyboardMap,
    });

    expect(result).toHaveProperty('move');
    expect(result.move).toEqual(touchMap.move);
  });

  test('当设备既不支持 pointer 也不支持 touch 时，应该添加 mouseMap', () => {
    (mockCapabilities as any).pointer = false;
    (mockCapabilities as any).touch = false;
    (mockCapabilities as any).mouse = true;

    const result = resolveInputEventMap({
      base: baseMap,
      pointer: pointerMap,
      touch: touchMap,
      mouse: mouseMap,
      keyboard: keyboardMap,
    });

    expect(result).toHaveProperty('move');
    expect(result.move).toEqual(mouseMap.move);
  });

  test('当提供了 keyboardMap 时，应该总是添加 keyboardMap', () => {
    const result = resolveInputEventMap({
      base: baseMap,
      mouse: mouseMap,
      keyboard: keyboardMap,
    });

    expect(result).toHaveProperty('keydown');
    expect(result.keydown).toEqual(keyboardMap.keydown);
  });

  test('当设备支持 pointer 时，优先使用 pointerMap 而不是 touch 或 mouse', () => {
    (mockCapabilities as any).pointer = true;
    (mockCapabilities as any).touch = true;
    (mockCapabilities as any).mouse = true;

    const result = resolveInputEventMap({
      base: baseMap,
      pointer: pointerMap,
      touch: touchMap,
      mouse: mouseMap,
      keyboard: keyboardMap,
    });

    // 应该使用 pointerMap 的 move，而不是 touchMap 或 mouseMap 的
    expect(result.move).toEqual(pointerMap.move);
  });
});