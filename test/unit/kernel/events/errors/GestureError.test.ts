import { GestureError, KernelErrorCode } from '@/kernel/errors';

describe('GestureError', () => {
  describe('constructor', () => {
    it('应该正确设置错误消息', () => {
      const message = '手势识别失败';
      const error = new GestureError(message, KernelErrorCode.GESTURE_RECOGNITION_ERROR);
      
      expect(error.message).toBe(message);
    });

    it('应该正确设置错误代码', () => {
      const error = new GestureError('测试错误', KernelErrorCode.GESTURE_RECOGNITION_ERROR);
      
      expect(error.code).toBe(KernelErrorCode.GESTURE_RECOGNITION_ERROR);
    });

    it('应该正确设置错误名称为 GestureError', () => {
      const error = new GestureError('测试错误', KernelErrorCode.GESTURE_RECOGNITION_ERROR);
      
      expect(error.name).toBe('GestureError');
    });

    it('应该正确设置时间戳', () => {
      const before = new Date();
      const error = new GestureError('测试错误', KernelErrorCode.GESTURE_RECOGNITION_ERROR);
      const after = new Date();
      
      expect(error.timestamp).toBeInstanceOf(Date);
      expect(error.timestamp >= before).toBeTruthy();
      expect(error.timestamp <= after).toBeTruthy();
    });

    it('应该可以接受上下文信息', () => {
      const context = {
        gestureType: 'swipe',
        position: { x: 10, y: 20 },
        element: 'div.test'
      };
      const error = new GestureError('手势错误', KernelErrorCode.GESTURE_RECOGNITION_ERROR, context);
      
      expect(error.context).toEqual(context);
    });

    it('当不提供上下文时，context 应该是 undefined', () => {
      const error = new GestureError('手势错误', KernelErrorCode.GESTURE_RECOGNITION_ERROR);
      
      expect(error.context).toBeUndefined();
    });
  });

  describe('toJSON', () => {
    it('应该返回包含所有错误信息的JSON对象', () => {
      const context = { test: 'value' };
      const error = new GestureError('测试错误', KernelErrorCode.GESTURE_RECOGNITION_ERROR, context);
      const json = error.toJSON();
      
      expect(json).toHaveProperty('name', 'GestureError');
      expect(json).toHaveProperty('message', '测试错误');
      expect(json).toHaveProperty('code', KernelErrorCode.GESTURE_RECOGNITION_ERROR);
      expect(json).toHaveProperty('stack');
      expect(json).toHaveProperty('timestamp');
      expect(json).toHaveProperty('context', context);
    });
  });

  describe('toString', () => {
    it('应该返回格式化的错误字符串', () => {
      const error = new GestureError('测试错误', KernelErrorCode.GESTURE_RECOGNITION_ERROR);
      const errorString = error.toString();
      
      expect(errorString).toContain('[GestureError]');
      expect(errorString).toContain(`(${KernelErrorCode.GESTURE_RECOGNITION_ERROR})`);
      expect(errorString).toContain('测试错误');
    });

    it('当有上下文时，应该在字符串中包含上下文信息', () => {
      const context = { gestureType: 'tap', element: 'button' };
      const error = new GestureError('测试错误', KernelErrorCode.GESTURE_RECOGNITION_ERROR, context);
      const errorString = error.toString();
      
      expect(errorString).toContain('[GestureError]');
      expect(errorString).toContain('{"gestureType":"tap","element":"button"}');
    });
  });

  it('应该正确继承自 KernelError', () => {
    const error = new GestureError('测试错误', KernelErrorCode.GESTURE_RECOGNITION_ERROR);
    
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(require('@/kernel/errors/KernelError').KernelError);
  });
});