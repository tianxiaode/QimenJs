/**
 * HttpActionRegistrar 单元测试
 */

import { HttpActionRegistrar, HttpActionCategory } from '@/http';

describe('HttpActionRegistrar', () => {
    let registrar: HttpActionRegistrar;
    
    beforeEach(() => {
        registrar = HttpActionRegistrar.getInstance();
        // 先解锁再清空
        (registrar as any).isLocked = false;
        registrar.clear(); // 清空之前的注册
    });
    
    describe('getInstance', () => {
        it('should return singleton instance', () => {
            const instance1 = HttpActionRegistrar.getInstance();
            const instance2 = HttpActionRegistrar.getInstance();
            expect(instance1).toBe(instance2);
        });
    });
    
    describe('register', () => {
        it('should register single action', () => {
            const action = {
                name: 'TestAction',
                category: HttpActionCategory.PREPARE,
                offset: 10,
                handler: async () => {},
                description: 'Test action',
            };
            
            registrar.register(action);
            
            expect(registrar.get('TestAction')).toEqual(action);
        });
        
        it('should throw error when locked', () => {
            registrar.lock();
            
            expect(() => {
                registrar.register({
                    name: 'Test',
                    category: HttpActionCategory.PREPARE,
                    offset: 10,
                    handler: async () => {},
                });
            }).toThrow();
        });
    });
    
    describe('registerAll', () => {
        it('should register multiple actions', () => {
            const actions = [
                {
                    name: 'Action1',
                    category: HttpActionCategory.PREPARE,
                    offset: 10,
                    handler: async () => {},
                },
                {
                    name: 'Action2',
                    category: HttpActionCategory.EXCHANGE,
                    offset: 20,
                    handler: async () => {},
                },
            ];
            
            registrar.registerAll(actions);
            
            expect(registrar.get('Action1')).toBeDefined();
            expect(registrar.get('Action2')).toBeDefined();
        });
    });
    
    describe('getPipeline', () => {
        it('should return empty array when no actions', () => {
            const pipeline = registrar.getPipeline();
            expect(pipeline).toEqual([]);
        });
        
        it('should return actions sorted by category and offset', () => {
            registrar.registerAll([
                {
                    name: 'Action3',
                    category: HttpActionCategory.PROCESS,
                    offset: 10,
                    handler: async () => {},
                },
                {
                    name: 'Action1',
                    category: HttpActionCategory.PREPARE,
                    offset: 10,
                    handler: async () => {},
                },
                {
                    name: 'Action2',
                    category: HttpActionCategory.EXCHANGE,
                    offset: 10,
                    handler: async () => {},
                },
            ]);
            
            const pipeline = registrar.getPipeline();
            
            expect(pipeline[0].name).toBe('Action1'); // PREPARE = 100
            expect(pipeline[1].name).toBe('Action2'); // EXCHANGE = 200
            expect(pipeline[2].name).toBe('Action3'); // PROCESS = 300
        });
        
        it('should use cache', () => {
            registrar.register({
                name: 'Test',
                category: HttpActionCategory.PREPARE,
                offset: 10,
                handler: async () => {},
            });
            
            const pipeline1 = registrar.getPipeline();
            const pipeline2 = registrar.getPipeline();
            
            expect(pipeline1).toBe(pipeline2); // 同一个引用
        });
    });
    
    describe('unregister', () => {
        it('should unregister action', () => {
            registrar.register({
                name: 'Test',
                category: HttpActionCategory.PREPARE,
                offset: 10,
                handler: async () => {},
            });
            
            expect(registrar.get('Test')).toBeDefined();
            
            registrar.unregister('Test');
            
            expect(registrar.get('Test')).toBeUndefined();
        });
        
        it('should clear cache after unregister', () => {
            registrar.register({
                name: 'Test',
                category: HttpActionCategory.PREPARE,
                offset: 10,
                handler: async () => {},
            });
            
            const pipeline1 = registrar.getPipeline();
            
            registrar.unregister('Test');
            
            const pipeline2 = registrar.getPipeline();
            
            expect(pipeline1).not.toBe(pipeline2); // 缓存已清除
        });
    });
    
    describe('has', () => {
        it('should return true if action exists', () => {
            registrar.register({
                name: 'Test',
                category: HttpActionCategory.PREPARE,
                offset: 10,
                handler: async () => {},
            });
            
            expect(registrar.has('Test')).toBe(true);
            expect(registrar.has('NonExistent')).toBe(false);
        });
    });
    
    describe('getNames', () => {
        it('should return all action names', () => {
            registrar.registerAll([
                {
                    name: 'Action1',
                    category: HttpActionCategory.PREPARE,
                    offset: 10,
                    handler: async () => {},
                },
                {
                    name: 'Action2',
                    category: HttpActionCategory.EXCHANGE,
                    offset: 20,
                    handler: async () => {},
                },
            ]);
            
            const names = registrar.getNames();
            
            expect(names).toContain('Action1');
            expect(names).toContain('Action2');
        });
    });
    
    describe('clear', () => {
        it('should clear all actions', () => {
            registrar.registerAll([
                {
                    name: 'Action1',
                    category: HttpActionCategory.PREPARE,
                    offset: 10,
                    handler: async () => {},
                },
                {
                    name: 'Action2',
                    category: HttpActionCategory.EXCHANGE,
                    offset: 20,
                    handler: async () => {},
                },
            ]);
            
            registrar.clear();
            
            expect(registrar.getPipeline()).toEqual([]);
        });
    });

    describe('doInspect', () => {
        it('should output empty when no actions', () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            (registrar as any).doInspect();
            expect(consoleSpy).toHaveBeenCalledWith('  (empty)');
            consoleSpy.mockRestore();
        });

        it('should output action names and descriptions', () => {
            registrar.register({
                name: 'InspectAction',
                category: HttpActionCategory.PREPARE,
                offset: 10,
                handler: async () => {},
                description: 'Test description',
            });

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            (registrar as any).doInspect();
            expect(consoleSpy).toHaveBeenCalledWith('  InspectAction: Test description');
            consoleSpy.mockRestore();
        });

        it('should handle action without description', () => {
            registrar.register({
                name: 'NoDescAction',
                category: HttpActionCategory.PREPARE,
                offset: 10,
                handler: async () => {},
            });

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            (registrar as any).doInspect();
            expect(consoleSpy).toHaveBeenCalledWith('  NoDescAction: no description');
            consoleSpy.mockRestore();
        });
    });
});
