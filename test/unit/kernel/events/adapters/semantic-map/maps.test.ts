import { baseMap } from '@/kernel/events/adapters/semantic-map/base';
import { keyboardMap } from '@/kernel/events/adapters/semantic-map/keyboard';
import { mouseMap } from '@/kernel/events/adapters/semantic-map/mouse';
import { pointerMap } from '@/kernel/events/adapters/semantic-map/pointer';
import { touchMap } from '@/kernel/events/adapters/semantic-map/touch';

describe('Semantic Maps', () => {
  describe('baseMap', () => {
    test('应该包含基础事件映射', () => {
      expect(baseMap).toHaveProperty('press');
      expect(baseMap).toHaveProperty('release');
      expect(baseMap).toHaveProperty('move');
      expect(baseMap).toHaveProperty('cancel');
    });

    test('press 事件应该映射到所有支持的设备类型', () => {
      expect(baseMap.press).toEqual({
        pointer: ['pointerdown'],
        touch: ['touchstart'],
        mouse: ['mousedown'],
      });
    });

    test('release 事件应该映射到所有支持的设备类型', () => {
      expect(baseMap.release).toEqual({
        pointer: ['pointerup'],
        touch: ['touchend'],
        mouse: ['mouseup'],
      });
    });

    test('move 事件应该映射到所有支持的设备类型', () => {
      expect(baseMap.move).toEqual({
        pointer: ['pointermove'],
        touch: ['touchmove'],
        mouse: ['mousemove'],
      });
    });

    test('cancel 事件应该映射到 pointer 和 touch 设备类型', () => {
      expect(baseMap.cancel).toEqual({
        pointer: ['pointercancel'],
        touch: ['touchcancel'],
        // mouse 不支持 cancel 事件
      });
    });
  });

  describe('keyboardMap', () => {
    test('应该包含键盘事件映射', () => {
      expect(keyboardMap).toHaveProperty('keydown');
      expect(keyboardMap).toHaveProperty('keyup');
    });

    test('keydown 应该映射到键盘事件', () => {
      expect(keyboardMap.keydown).toEqual({
        keyboard: ['keydown'],
      });
    });

    test('keyup 应该映射到键盘事件', () => {
      expect(keyboardMap.keyup).toEqual({
        keyboard: ['keyup'],
      });
    });
  });

  describe('mouseMap', () => {
    test('应该包含鼠标事件映射', () => {
      expect(mouseMap).toHaveProperty('press');
      expect(mouseMap).toHaveProperty('release');
      expect(mouseMap).toHaveProperty('move');
      expect(mouseMap).toHaveProperty('enter');
      expect(mouseMap).toHaveProperty('leave');
      expect(mouseMap).toHaveProperty('over');
      expect(mouseMap).toHaveProperty('out');
    });

    test('鼠标事件应该映射到正确的 DOM 事件', () => {
      expect(mouseMap.press).toEqual({
        mouse: ['mousedown'],
      });
      expect(mouseMap.release).toEqual({
        mouse: ['mouseup'],
      });
      expect(mouseMap.move).toEqual({
        mouse: ['mousemove'],
      });
      expect(mouseMap.enter).toEqual({
        mouse: ['mouseenter'],
      });
      expect(mouseMap.leave).toEqual({
        mouse: ['mouseleave'],
      });
      expect(mouseMap.over).toEqual({
        mouse: ['mouseover'],
      });
      expect(mouseMap.out).toEqual({
        mouse: ['mouseout'],
      });
    });
  });

  describe('pointerMap', () => {
    test('应该包含指针事件映射', () => {
      expect(pointerMap).toHaveProperty('press');
      expect(pointerMap).toHaveProperty('move');
      expect(pointerMap).toHaveProperty('release');
      expect(pointerMap).toHaveProperty('cancel');
      expect(pointerMap).toHaveProperty('enter');
      expect(pointerMap).toHaveProperty('leave');
      expect(pointerMap).toHaveProperty('over');
      expect(pointerMap).toHaveProperty('out');
    });

    test('指针事件应该映射到正确的 DOM 事件', () => {
      expect(pointerMap.press).toEqual({
        pointer: ['pointerdown'],
      });
      expect(pointerMap.move).toEqual({
        pointer: ['pointermove'],
      });
      expect(pointerMap.release).toEqual({
        pointer: ['pointerup'],
      });
      expect(pointerMap.cancel).toEqual({
        pointer: ['pointercancel'],
      });
      expect(pointerMap.enter).toEqual({
        pointer: ['pointerenter'],
      });
      expect(pointerMap.leave).toEqual({
        pointer: ['pointerleave'],
      });
      expect(pointerMap.over).toEqual({
        pointer: ['pointerover'],
      });
      expect(pointerMap.out).toEqual({
        pointer: ['pointerout'],
      });
    });
  });

  describe('touchMap', () => {
    test('应该包含触摸事件映射', () => {
      expect(touchMap).toHaveProperty('press');
      expect(touchMap).toHaveProperty('move');
      expect(touchMap).toHaveProperty('release');
      expect(touchMap).toHaveProperty('cancel');
    });

    test('触摸事件应该映射到正确的 DOM 事件', () => {
      expect(touchMap.press).toEqual({
        touch: ['touchstart'],
      });
      expect(touchMap.move).toEqual({
        touch: ['touchmove'],
      });
      expect(touchMap.release).toEqual({
        touch: ['touchend'],
      });
      expect(touchMap.cancel).toEqual({
        touch: ['touchcancel'],
      });
    });
  });
});