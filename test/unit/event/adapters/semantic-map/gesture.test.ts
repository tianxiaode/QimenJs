import { gestureMap, keyboardGestureMap, gestureEventMap } from '@/event/adapters/semantic-map/gesture';
import { GestureEventMap, GestureSemantic } from '@/event/adapters/semantic-map/types';

describe('gesture semantic maps', () => {
  describe('gestureMap', () => {
    test('应该包含所有预期的手势', () => {
      const expectedGestures: GestureSemantic[] = [
        'tap', 'click', 'dblclick', 'longpress', 'drag', 'swipe', 'hover', 'contextmenu'
      ];

      expectedGestures.forEach(gesture => {
        expect(gestureMap).toHaveProperty(gesture);
      });
    });

    test('tap 手势应该有正确的配置', () => {
      const tapConfig = gestureMap.tap;
      expect(tapConfig).toBeDefined();
      expect(tapConfig!.requires).toEqual(['press', 'release']);
      expect(tapConfig!.processor).toBe('tapProcessor');
      expect(tapConfig!.constraints).toEqual({
        maxDuration: 250,
        maxDistance: 10,
      });
      expect(tapConfig!.semantic).toBe('tap');
    });

    test('click 手势应该有正确的配置', () => {
      const clickConfig = gestureMap.click;
      expect(clickConfig).toBeDefined();
      expect(clickConfig!.requires).toEqual(['press', 'release']);
      expect(clickConfig!.processor).toBe('tapProcessor');
      expect(clickConfig!.semantic).toBe('click');
    });

    test('longpress 手势应该有正确的配置', () => {
      const longpressConfig = gestureMap.longpress;
      expect(longpressConfig).toBeDefined();
      expect(longpressConfig!.requires).toEqual(['press']);
      expect(longpressConfig!.processor).toBe('longPressProcessor');
      expect(longpressConfig!.constraints).toEqual({
        minDuration: 500,
      });
      expect(longpressConfig!.semantic).toBe('longpress');
    });

    test('drag 手势应该有正确的配置', () => {
      const dragConfig = gestureMap.drag;
      expect(dragConfig).toBeDefined();
      expect(dragConfig!.requires).toEqual(['press', 'move', 'release']);
      expect(dragConfig!.processor).toBe('panProcessor');
      expect(dragConfig!.constraints).toEqual({
        minDistance: 5,
      });
      expect(dragConfig!.semantic).toBe('drag');
    });

    test('contextmenu 手势应该有正确的配置', () => {
      const contextmenuConfig = gestureMap.contextmenu;
      expect(contextmenuConfig).toBeDefined();
      expect(contextmenuConfig!.requires).toEqual(['press']);
      expect(contextmenuConfig!.processor).toBe('contextMenuProcessor');
      expect(contextmenuConfig!.constraints).toEqual({
        buttons: [2],
      });
      expect(contextmenuConfig!.semantic).toBe('contextmenu');
    });
  });

  describe('keyboardGestureMap', () => {
    test('应该包含 submit 手势', () => {
      expect(keyboardGestureMap).toHaveProperty('submit');
      const submitConfig = keyboardGestureMap.submit;
      expect(submitConfig).toBeDefined();
      expect(submitConfig!.requires).toEqual(['keydown']);
      expect(submitConfig!.processor).toBe('enterKeyProcessor');
      expect(submitConfig!.semantic).toBe('submit');
    });
  });

  describe('gestureEventMap', () => {
    test('应该合并 gestureMap 和 keyboardGestureMap', () => {
      // 检查是否包含 gestureMap 的内容
      expect(gestureEventMap).toHaveProperty('tap');
      expect(gestureEventMap).toHaveProperty('click');
      expect(gestureEventMap).toHaveProperty('longpress');
      expect(gestureEventMap).toHaveProperty('drag');
      expect(gestureEventMap).toHaveProperty('contextmenu');
      
      // 检查是否包含 keyboardGestureMap 的内容
      expect(gestureEventMap).toHaveProperty('submit');
      
      // 验证具体配置是否正确合并
      expect(gestureEventMap.tap).toEqual(gestureMap.tap);
      expect(gestureEventMap.submit).toEqual(keyboardGestureMap.submit);
    });

    test('应该包含所有预期的手势语义', () => {
      const expectedGestures: GestureSemantic[] = [
        'tap', 'click', 'dblclick', 'longpress', 'drag', 'swipe', 'hover', 'contextmenu', 'submit'
      ];

      expectedGestures.forEach(gesture => {
        expect(gestureEventMap).toHaveProperty(gesture);
      });
    });
  });
});