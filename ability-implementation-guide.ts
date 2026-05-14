/**
 * 新框架能力实现指南
 * 
 * 不再需要 AbilityBase，直接实现 IPrecompilableAbility 接口
 */

import { DescriptorFactory } from '@/kernel/composable';
import type { IPrecompiledAbility, IPrecompilableAbility } from '@/kernel/composable';

// ============================================
// 示例1：简单能力（无状态）
// ============================================

/**
 * 事件能力
 * 
 * 直接实现 IPrecompilableAbility 接口
 * 无需继承任何基类
 */
class EventAbility implements IPrecompilableAbility {
    readonly name = 'Event';
    
    precompile(): IPrecompiledAbility {
        const descriptorFactories = new Map();
        
        // 方法：订阅事件
        descriptorFactories.set('on', 
            DescriptorFactory.method((host, event: string, handler: Function) => {
                if (!host.__events__) {
                    host.__events__ = new Map();
                }
                if (!host.__events__.has(event)) {
                    host.__events__.set(event, []);
                }
                host.__events__.get(event)!.push(handler);
            })
        );
        
        // 方法：触发事件
        descriptorFactories.set('emit', 
            DescriptorFactory.method((host, event: string, data: any) => {
                const handlers = host.__events__?.get(event);
                if (handlers) {
                    handlers.forEach(handler => handler(data));
                }
            })
        );
        
        // 销毁函数
        const createDisposer = (host: any) => () => {
            host.__events__?.clear();
            delete host.__events__;
        };
        
        return { 
            name: this.name,
            descriptorFactories, 
            createDisposer 
        };
    }
}

// ============================================
// 示例2：带状态的能力
// ============================================

/**
 * Schema能力
 * 
 * 直接实现接口，无需基类
 */
class SchemaAbility implements IPrecompilableAbility {
    readonly name = 'Schema';
    
    precompile(): IPrecompiledAbility {
        const descriptorFactories = new Map();
        
        // getter：schema定义
        descriptorFactories.set('schema', 
            DescriptorFactory.getter(host => host.__schema__)
        );
        
        // 方法：验证数据
        descriptorFactories.set('validate', 
            DescriptorFactory.method((host, data: any) => {
                // 简单验证逻辑
                return data && typeof data === 'object';
            })
        );
        
        // 方法：设置schema
        descriptorFactories.set('setSchema', 
            DescriptorFactory.method((host, schema: any) => {
                host.__schema__ = schema;
            })
        );
        
        return { 
            name: this.name,
            descriptorFactories 
        };
    }
}

// ============================================
// 示例3：复杂能力（getter/setter + 状态）
// ============================================

/**
 * Domain能力
 * 
 * 展示完整的getter/setter和状态管理
 */
class DomainAbility implements IPrecompilableAbility {
    readonly name = 'Domain';
    
    precompile(): IPrecompiledAbility {
        const descriptorFactories = new Map();
        
        // getter：domain名称
        descriptorFactories.set('domain', 
            DescriptorFactory.getter(host => host.__domain__ || 'default')
        );
        
        // getter/setter：当前实体
        descriptorFactories.set('currentEntity', 
            DescriptorFactory.accessor(
                host => host.__currentEntity__,
                (host, entity) => { 
                    host.__currentEntity__ = entity;
                    host.logger?.info('Current entity changed');
                }
            )
        );
        
        // getter：是否为空
        descriptorFactories.set('isEmpty', 
            DescriptorFactory.getter(host => !host.__currentEntity__)
        );
        
        // 方法：加载实体
        descriptorFactories.set('loadEntity', 
            DescriptorFactory.method(async (host, id: string) => {
                // 模拟异步加载
                const entity = { id, loaded: true };
                host.__currentEntity__ = entity;
                host.logger?.info(`Entity loaded: ${id}`);
                return entity;
            })
        );
        
        // 销毁函数
        const createDisposer = (host: any) => () => {
            delete host.__domain__;
            delete host.__currentEntity__;
            host.logger?.info('Domain ability disposed');
        };
        
        return { 
            name: this.name,
            descriptorFactories,
            createDisposer
        };
    }
}

// ============================================
// 示例4：本地状态能力（FlatLocalStateAbility）
// ============================================

/**
 * 本地状态能力
 * 
 * 替代原来的 FlatLocalStateAbility
 */
class FlatLocalStateAbility implements IPrecompilableAbility {
    readonly name = 'FlatLocalState';
    
    precompile(): IPrecompiledAbility {
        const descriptorFactories = new Map();
        
        // getter：loading状态
        descriptorFactories.set('loading', 
            DescriptorFactory.getter(host => host.state.loading)
        );
        
        // getter：是否为空
        descriptorFactories.set('isEmpty', 
            DescriptorFactory.getter(host => host.state.items.length === 0)
        );
        
        // getter：总数
        descriptorFactories.set('total', 
            DescriptorFactory.getter(host => host.state.items.length)
        );
        
        // getter：items列表
        descriptorFactories.set('items', 
            DescriptorFactory.getter(host => host.state.items)
        );
        
        // getter：是否有变更
        descriptorFactories.set('hasChanges', 
            DescriptorFactory.getter(host => host.state.hasChanges)
        );
        
        // getter：新增项
        descriptorFactories.set('adds', 
            DescriptorFactory.getter(host => host.state.changes.added)
        );
        
        // getter：更新项
        descriptorFactories.set('updates', 
            DescriptorFactory.getter(host => host.state.changes.updated)
        );
        
        // 方法：获取删除计划
        descriptorFactories.set('getDeletionPlan', 
            DescriptorFactory.method((host, ids: (string | number)[]) => {
                return host.state.getDeletionPlan(ids);
            })
        );
        
        return { 
            name: this.name,
            descriptorFactories 
        };
    }
}

// ============================================
// 对比：旧方式 vs 新方式
// ============================================

console.log('=== 旧方式 vs 新方式 ===\n');

console.log('旧方式（需要 AbilityBase）：');
console.log(`
class EventAbility extends AbilityBase<HostType> {
    protected host: HostType;
    
    protected expose() {
        return {
            on: (event, handler) => {
                // this.host 访问宿主
            }
        };
    }
    
    dispose() {
        // 清理逻辑
    }
}
`);

console.log('新方式（直接实现接口）：');
console.log(`
class EventAbility implements IPrecompilableAbility {
    readonly name = 'Event';
    
    precompile(): IPrecompiledAbility {
        const descriptorFactories = new Map();
        
        descriptorFactories.set('on', 
            DescriptorFactory.method((host, event, handler) => {
                // host 通过闭包捕获
            })
        );
        
        const createDisposer = (host) => () => {
            // 清理逻辑
        };
        
        return { name: 'Event', descriptorFactories, createDisposer };
    }
}
`);

console.log('\n=== 新方式的优势 ===\n');

console.log('✅ 无需基类');
console.log('   - 不继承 AbilityBase');
console.log('   - 直接实现接口');
console.log('   - 更灵活');

console.log('\n✅ 无需 this.host');
console.log('   - host 通过闭包捕获');
console.log('   - 无需存储引用');
console.log('   - 内存更优');

console.log('\n✅ 预编译');
console.log('   - precompile() 返回工厂函数');
console.log('   - 运行时直接使用');
console.log('   - 性能最优');

console.log('\n✅ 类型安全');
console.log('   - 完整的类型定义');
console.log('   - 编译时检查');
console.log('   - 智能提示');

console.log('\n=== 使用步骤 ===\n');

console.log('1. 定义能力类');
console.log('   - 实现 IPrecompilableAbility 接口');
console.log('   - 提供 readonly name 属性');
console.log('   - 实现 precompile() 方法');

console.log('\n2. 实现 precompile() 方法');
console.log('   - 创建 descriptorFactories Map');
console.log('   - 使用 DescriptorFactory 创建描述符');
console.log('   - 可选：提供 createDisposer');

console.log('\n3. 注册能力');
console.log(`
registrar.register(
    { name: 'Event', ctor: EventAbility },
    new EventAbility(),
    { immediate: true }
);
`);

console.log('\n4. 使用能力');
console.log(`
@Ability('Event')
class User extends ComposableBase {}

const user = new User();
user.on('click', () => {});
`);

// ============================================
// 总结
// ============================================

console.log('\n=== 总结 ===\n');

console.log('新框架能力实现：');
console.log('1. ❌ 不需要 AbilityBase');
console.log('2. ✅ 直接实现 IPrecompilableAbility 接口');
console.log('3. ✅ 使用 DescriptorFactory 创建描述符');
console.log('4. ✅ 通过闭包捕获 host');
console.log('5. ✅ 提供销毁函数（可选）');
console.log('');
console.log('更简单、更灵活、性能更好！');
