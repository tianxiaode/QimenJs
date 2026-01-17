import { EntityActionRegistrar } from '@/kernel/registrars/EntityActionRegistrar';
import { EntityActionRegistrarError } from '@/kernel/errors/EntityActionRegistrarError';
import { KernelErrorCode } from '@/kernel/errors/codes';
import { ActionCategory, ActionEntry } from '@/kernel/types';

// 模拟处理器函数
const mockHandler = async (ctx: any) => {};

describe('EntityActionRegistrar', () => {
  let registrar: EntityActionRegistrar;

  beforeEach(() => {
    registrar = new EntityActionRegistrar();
  });

  afterEach(() => {
    // 在实际的RegistrarBase中没有unlock方法，所以不需要在这里调用
  });

  describe('register', () => {
    it('should register an action', () => {
      const action: ActionEntry = {
        name: 'testAction',
        category: ActionCategory.PREPARE,
        description: 'Test action description',
        offset: 0,
        handler: mockHandler,
      };

      registrar.register(action);
      // 我们不能直接访问受保护的storage属性，因此通过get方法验证注册
      expect(() => registrar.get('testAction')).not.toThrow();
      
      const storedAction = registrar.get('testAction');
      expect(storedAction).toEqual(action);
    });

    it('should clear cache when registering new action', () => {
      const action1: ActionEntry = {
        name: 'action1',
        category: ActionCategory.PREPARE,
        description: 'Action 1',
        offset: 0,
        handler: mockHandler,
      };
      const action2: ActionEntry = {
        name: 'action2',
        category: ActionCategory.PREPARE,
        description: 'Action 2',
        offset: 0,
        handler: mockHandler,
        isHttp: true,
      };

      // Add two actions
      registrar.register(action1);
      registrar.register(action2);

      // Get HTTP pipeline to populate cache
      const httpPipeline = registrar.getHttpPipeline();
      expect(httpPipeline).toHaveLength(1);
      expect(httpPipeline[0].name).toBe('action2');

      // Add another HTTP action
      const action3: ActionEntry = {
        name: 'action3',
        category: ActionCategory.PREPARE,
        description: 'Action 3',
        offset: 0,
        handler: mockHandler,
        isHttp: true,
      };
      registrar.register(action3);

      // Cache should be cleared, so re-fetching should include the new action
      const httpPipelineAfter = registrar.getHttpPipeline();
      expect(httpPipelineAfter).toHaveLength(2);
    });
  });

  describe('get', () => {
    it('should return a registered action', () => {
      const action: ActionEntry = {
        name: 'testAction',
        category: ActionCategory.PREPARE,
        description: 'Test action description',
        offset: 0,
        handler: mockHandler,
      };

      registrar.register(action);
      const result = registrar.get('testAction');

      expect(result).toEqual(action);
    });

    it('should throw an error if action does not exist', () => {
      expect(() => registrar.get('nonexistentAction')).toThrow(EntityActionRegistrarError);
      try {
        registrar.get('nonexistentAction');
      } catch (error: any) {
        expect(error.code).toBe(KernelErrorCode.ACTION_NOT_FOUND);
      }
    });
  });

  describe('getHttpPipeline', () => {
    it('should return only HTTP actions', () => {
      const httpAction: ActionEntry = {
        name: 'httpAction',
        category: ActionCategory.PREPARE,
        description: 'HTTP action',
        offset: 0,
        handler: mockHandler,
        isHttp: true,
      };
      const normalAction: ActionEntry = {
        name: 'normalAction',
        category: ActionCategory.PREPARE,
        description: 'Normal action',
        offset: 0,
        handler: mockHandler,
      };

      registrar.register(httpAction);
      registrar.register(normalAction);

      const httpPipeline = registrar.getHttpPipeline();
      expect(httpPipeline).toHaveLength(1);
      expect(httpPipeline[0].name).toBe('httpAction');
    });

    it('should cache HTTP pipeline results', () => {
      const httpAction: ActionEntry = {
        name: 'httpAction',
        category: ActionCategory.PREPARE,
        description: 'HTTP action',
        offset: 0,
        handler: mockHandler,
        isHttp: true,
      };

      registrar.register(httpAction);

      // First call to getHttpPipeline should compute and cache
      const httpPipeline1 = registrar.getHttpPipeline();
      // Second call should use cache
      const httpPipeline2 = registrar.getHttpPipeline();

      expect(httpPipeline1).toBe(httpPipeline2);
    });
  });

  describe('getPreparePipeline', () => {
    it('should return only prepare category actions', () => {
      const prepareAction: ActionEntry = {
        name: 'prepareAction',
        category: ActionCategory.PREPARE,
        description: 'Prepare action',
        offset: 0,
        handler: mockHandler,
      };
      const processAction: ActionEntry = {
        name: 'processAction',
        category: ActionCategory.PROCESS,
        description: 'Process action',
        offset: 0,
        handler: mockHandler,
      };

      registrar.register(prepareAction);
      registrar.register(processAction);

      const preparePipeline = registrar.getPreparePipeline();
      expect(preparePipeline).toHaveLength(1);
      expect(preparePipeline[0].name).toBe('prepareAction');
    });
  });

  describe('getPipeline', () => {
    it('should return all registered actions', () => {
      const action1: ActionEntry = {
        name: 'action1',
        category: ActionCategory.PREPARE,
        description: 'Action 1',
        offset: 0,
        handler: mockHandler,
      };
      const action2: ActionEntry = {
        name: 'action2',
        category: ActionCategory.PROCESS,
        description: 'Process action',
        offset: 0,
        handler: mockHandler,
      };

      registrar.register(action1);
      registrar.register(action2);

      const allActions = registrar.getPipeline();
      expect(allActions).toHaveLength(2);
      expect(allActions.some(a => a.name === 'action1')).toBeTruthy();
      expect(allActions.some(a => a.name === 'action2')).toBeTruthy();
    });
  });

  describe('unregister', () => {
    it('should remove an action and clear cache', () => {
      const action: ActionEntry = {
        name: 'testAction',
        category: ActionCategory.PREPARE,
        description: 'Test action',
        offset: 0,
        handler: mockHandler,
        isHttp: true,
      };

      registrar.register(action);
      // 验证action已被注册
      expect(() => registrar.get('testAction')).not.toThrow();

      // Populate cache
      const httpPipeline = registrar.getHttpPipeline();
      expect(httpPipeline).toHaveLength(1);

      registrar.unregister('testAction');
      // 验证action已被移除
      expect(() => registrar.get('testAction')).toThrow();

      // Cache should be cleared
      const httpPipelineAfter = registrar.getHttpPipeline();
      expect(httpPipelineAfter).toHaveLength(0);
    });
  });

  describe('clear', () => {
    it('should clear all actions and cache', () => {
      const action: ActionEntry = {
        name: 'testAction',
        category: ActionCategory.PREPARE,
        description: 'Test action',
        offset: 0,
        handler: mockHandler,
        isHttp: true,
      };

      registrar.register(action);
      // 验证action已被注册
      expect(() => registrar.get('testAction')).not.toThrow();

      // Populate cache
      const httpPipeline = registrar.getHttpPipeline();
      expect(httpPipeline).toHaveLength(1);

      registrar.clear();
      // 验证所有action已被清除
      expect(() => registrar.get('testAction')).toThrow();

      // Cache should be cleared
      const httpPipelineAfter = registrar.getHttpPipeline();
      expect(httpPipelineAfter).toHaveLength(0);
    });
  });

  describe('name property', () => {
    it('should have the correct name constant', () => {
      expect(registrar.name).toBe('action');
    });
  });
});