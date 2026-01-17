import { KernelErrorCode } from '../../../../src/kernel/errors/codes';

describe('KernelErrorCode', () => {
  it('should have all expected error codes defined', () => {
    expect(KernelErrorCode.ENTITY_OPERATION_IN_PROGRESS).toBeDefined();
    expect(KernelErrorCode.INVALID_PAGE_SIZE).toBeDefined();
    expect(KernelErrorCode.COMPOSABLE_NOT_FOUND).toBeDefined();
    expect(KernelErrorCode.CIRCULAR_DEPENDENCY).toBeDefined();
    expect(KernelErrorCode.STREAM_REQUEST_FAILED).toBeDefined();
    expect(KernelErrorCode.GESTURE_RECOGNITION_ERROR).toBeDefined();
    expect(KernelErrorCode.GESTURE_DISTANCE_INSUFFICIENT).toBeDefined();
    expect(KernelErrorCode.UNKNOWN_GESTURE_PROCESSOR).toBeDefined();
  });

  it('should have correct values for each error code', () => {
    expect(KernelErrorCode.ENTITY_OPERATION_IN_PROGRESS).toBe('ENTITY_OPERATION_IN_PROGRESS');
    expect(KernelErrorCode.INVALID_PAGE_SIZE).toBe('INVALID_PAGE_SIZE');
    expect(KernelErrorCode.COMPOSABLE_NOT_FOUND).toBe('COMPOSABLE_NOT_FOUND');
    expect(KernelErrorCode.CIRCULAR_DEPENDENCY).toBe('CIRCULAR_DEPENDENCY');
    expect(KernelErrorCode.STREAM_REQUEST_FAILED).toBe('STREAM_REQUEST_FAILED');
    expect(KernelErrorCode.GESTURE_RECOGNITION_ERROR).toBe('GESTURE_RECOGNITION_ERROR');
    expect(KernelErrorCode.GESTURE_DISTANCE_INSUFFICIENT).toBe('GESTURE_DISTANCE_INSUFFICIENT');
    expect(KernelErrorCode.UNKNOWN_GESTURE_PROCESSOR).toBe('UNKNOWN_GESTURE_PROCESSOR');
  });
});