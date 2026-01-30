import { EntityFetchError } from '../../../../src/kernel/errors/EntityFetchError';
import { KernelErrorCode } from '../../../../src/kernel/errors/codes';
import { EntityError } from '../../../../src/kernel/errors/EntityError';

describe('EntityFetchError', () => {
  const TEST_ENTITY_ID = 'test-entity-123';

  it('应该正确创建EntityFetchError实例', () => {
    const error = new EntityFetchError(
      '获取实体失败',
      KernelErrorCode.ENTITY_FETCH_FAILED,
      { entityId: TEST_ENTITY_ID }
    );

    expect(error).toBeInstanceOf(EntityFetchError);
    expect(error).toBeInstanceOf(EntityError);
    expect(error.message).toBe('获取实体失败');
    expect(error.code).toBe(KernelErrorCode.ENTITY_FETCH_FAILED);
    expect(error.context).toEqual({ entityId: TEST_ENTITY_ID });
    expect(error.timestamp).toBeInstanceOf(Date);
  });

  it('应该保持正确的原型链', () => {
    const error = new EntityFetchError('测试错误', KernelErrorCode.ENTITY_FETCH_FAILED);
    expect(Object.getPrototypeOf(error)).toBe(EntityFetchError.prototype);
    expect(error.constructor).toBe(EntityFetchError);
  });

  it('应该正确继承EntityError', () => {
    const error = new EntityFetchError('测试', KernelErrorCode.ENTITY_FETCH_FAILED);
    
    expect(error instanceof EntityFetchError).toBe(true);
    expect(error instanceof EntityError).toBe(true);
    expect(error instanceof Error).toBe(true);
  });
});