import { RegistrarBase } from '@/registry/registrars';

/**
 * 注册器基类额外测试
 * 专门测试RegistrarBase中不同存储类型的处理逻辑
 */
 
// 创建一个使用数组存储的注册器来测试数组清空逻辑
class ArrayRegistrar extends RegistrarBase<any[]> {
  public readonly name = 'test-array';
  protected storage: any[] = ['item1', 'item2'];

  register(...args: any[]): void {}
  unregister(id: string): void {}
  get(...args: any[]): any { return this.storage; }
  protected doInspect(): void {}
}

describe('RegistrarBase Extra Tests', () => {
  describe('clear with arrays', () => {
    /**
     * 测试数组类型的清空功能
     */
    it('应该正确处理数组类型的清空', () => {
      const arrayRegistrar = new ArrayRegistrar();
      
      // 确保存储中有元素
      expect(arrayRegistrar.get().length).toBeGreaterThan(0);
      
      // 清空数组
      arrayRegistrar.clear();
      
      // 验证数组为空
      expect(arrayRegistrar.get().length).toBe(0);
    });
  });
});