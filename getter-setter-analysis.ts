/**
 * Getter/Setter 属性处理分析
 * 
 * 问题：FlatLocalStateAbility 中的 loading 等属性是 getter，不是方法
 */

// ============================================
// 问题分析
// ============================================

console.log('=== 问题分析 ===\n');

console.log('FlatLocalStateAbility 的 expose() 返回：');
console.log(`
{
    // getter 属性
    loading: { get: () => state.loading },
    isEmpty: { get: () => state.items.length === 0 },
    total: { get: () => state.items.length },
    items: { get: () => state.items },
    
    // 普通方法
    getDeletionPlan: (ids) => state.getDeletionPlan(ids),
    
    // getter 属性
    adds: { get: () => state.changes.added },
    updates: { get: () => state.changes.updated }
}
`);

console.log('\n当前方案的处理：');
console.log(`
// AbilityBase.ts
private makeDescriptor(value: any): PropertyDescriptor {
    if (value && typeof value === 'object' && ('get' in value || 'set' in value)) {
        // getter/setter
        return {
            ...value,
            configurable: true,
            enumerable: true
        };
    } else {
        // 普通值或函数
        return {
            value: typeof value === 'function' ? value.bind(this.host) : value,
            writable: true,
            configurable: true,
            enumerable: true
        };
    }
}
`);

console.log('\n优化方案需要处理：');
console.log('✅ getter/setter 属性');
console.log('✅ 普通方法');
console.log('✅ 普通值');


// ============================================
// 解决方案：工厂函数返回描述符
// ============================================

console.log('\n\n=== 解决方案：工厂函数返回描述符 ===\n');

interface IPropertyDescriptorFactory {
    (host: any): PropertyDescriptor;
}

interface IPrecompiledAbility {
    /**
     * 属性描述符工厂
     * key: 属性名
     * value: 工厂函数，返回属性描述符
     */
    descriptorFactories: Map<string, IPropertyDescriptorFactory>;
    
    /**
     * 销毁函数工厂
     */
    createDisposer?: (host: any) => () => void;
    
    /**
     * 能力名称
     */
    name: string;
}

console.log('方案：工厂函数返回完整的属性描述符');
console.log(`
interface IPrecompiledAbility {
    descriptorFactories: Map<string, (host) => PropertyDescriptor>;
}

// getter 属性
descriptorFactories.set('loading', (host) => ({
    get: () => host.state.loading,
    configurable: true,
    enumerable: true
}));

// 普通方法
descriptorFactories.set('getDeletionPlan', (host) => ({
    value: (ids) => host.state.getDeletionPlan(ids),
    writable: true,
    configurable: true,
    enumerable: true
}));

// 普通值
descriptorFactories.set('eventCount', (host) => ({
    value: 0,
    writable: true,
    configurable: true,
    enumerable: true
}));
`);


// ============================================
// 完整实现示例
// ============================================

console.log('\n\n=== 完整实现示例 ===\n');

class FlatLocalStateAbilityOptimized {
    name = 'FlatLocalState';
    
    static precompile(): IPrecompiledAbility {
        const descriptorFactories = new Map<string, IPropertyDescriptorFactory>();
        
        // getter 属性：loading
        descriptorFactories.set('loading', (host) => ({
            get: () => {
                // 通过闭包访问 host.state
                return host.state.loading;
            },
            configurable: true,
            enumerable: true
        }));
        
        // getter 属性：isEmpty
        descriptorFactories.set('isEmpty', (host) => ({
            get: () => host.state.items.length === 0,
            configurable: true,
            enumerable: true
        }));
        
        // getter 属性：total
        descriptorFactories.set('total', (host) => ({
            get: () => host.state.items.length,
            configurable: true,
            enumerable: true
        }));
        
        // getter 属性：items
        descriptorFactories.set('items', (host) => ({
            get: () => host.state.items,
            configurable: true,
            enumerable: true
        }));
        
        // 普通方法：getDeletionPlan
        descriptorFactories.set('getDeletionPlan', (host) => ({
            value: (ids: (string | number)[]) => {
                return host.state.getDeletionPlan(ids);
            },
            writable: true,
            configurable: true,
            enumerable: true
        }));
        
        // getter 属性：adds
        descriptorFactories.set('adds', (host) => ({
            get: () => host.state.changes.added,
            configurable: true,
            enumerable: true
        }));
        
        // getter 属性：updates
        descriptorFactories.set('updates', (host) => ({
            get: () => host.state.changes.updated,
            configurable: true,
            enumerable: true
        }));
        
        return { descriptorFactories, name: 'FlatLocalState' };
    }
}

console.log('FlatLocalStateAbility 预编译完成');


// ============================================
// 使用示例
// ============================================

console.log('\n=== 使用示例 ===\n');

// 模拟 host
const mockHost = {
    name: 'TestEntity',
    state: {
        loading: false,
        items: [{ id: 1, name: 'Item1' }, { id: 2, name: 'Item2' }],
        hasChanges: true,
        changes: {
            added: [{ id: 3, name: 'Item3' }],
            updated: [{ id: 1, name: 'Item1-Updated' }]
        },
        getDeletionPlan: (ids: number[]) => ({ toDelete: ids })
    }
};

// 预编译
const ability = FlatLocalStateAbilityOptimized.precompile();

// 挂载能力
ability.descriptorFactories.forEach((factory, key) => {
    const descriptor = factory(mockHost);
    Object.defineProperty(mockHost, key, descriptor);
});

console.log('能力挂载完成');

// 使用能力
console.log('\n使用能力：');
console.log('loading:', (mockHost as any).loading);
console.log('isEmpty:', (mockHost as any).isEmpty);
console.log('total:', (mockHost as any).total);
console.log('items:', (mockHost as any).items);
console.log('adds:', (mockHost as any).adds);
console.log('updates:', (mockHost as any).updates);
console.log('getDeletionPlan:', (mockHost as any).getDeletionPlan([1, 2]));

// 修改状态，验证 getter 实时性
console.log('\n修改状态：');
mockHost.state.loading = true;
mockHost.state.items.push({ id: 3, name: 'Item3' });

console.log('loading (更新后):', (mockHost as any).loading);
console.log('total (更新后):', (mockHost as any).total);


// ============================================
// 对比当前方案
// ============================================

console.log('\n\n=== 对比当前方案 ===\n');

console.log('当前方案：');
console.log(`
expose() {
    return {
        loading: { get: () => state.loading },  // getter 对象
        getDeletionPlan: (ids) => ...           // 方法
    };
}

// makeDescriptor() 判断类型
if (value && typeof value === 'object' && ('get' in value || 'set' in value)) {
    // getter/setter
} else {
    // 普通值或函数
}
`);

console.log('\n优化方案：');
console.log(`
precompile() {
    // 直接返回描述符工厂
    descriptorFactories.set('loading', (host) => ({
        get: () => host.state.loading,
        configurable: true,
        enumerable: true
    }));
    
    descriptorFactories.set('getDeletionPlan', (host) => ({
        value: (ids) => host.state.getDeletionPlan(ids),
        writable: true,
        configurable: true,
        enumerable: true
    }));
}

// 无需类型判断，直接使用
descriptorFactories.forEach((factory, key) => {
    Object.defineProperty(host, key, factory(host));
});
`);

console.log('\n优势：');
console.log('✅ 无需运行时类型判断');
console.log('✅ 直接返回完整描述符');
console.log('✅ getter/setter 完美支持');
console.log('✅ 普通方法完美支持');
console.log('✅ 普通值完美支持');


// ============================================
// 更优雅的实现
// ============================================

console.log('\n\n=== 更优雅的实现 ===\n');

/**
 * 描述符工厂辅助函数
 */
class DescriptorFactory {
    /**
     * 创建 getter 描述符
     */
    static getter(getter: (host: any) => any): IPropertyDescriptorFactory {
        return (host) => ({
            get: () => getter(host),
            configurable: true,
            enumerable: true
        });
    }
    
    /**
     * 创建 setter 描述符
     */
    static setter(setter: (host: any, value: any) => void): IPropertyDescriptorFactory {
        return (host) => ({
            set: (value) => setter(host, value),
            configurable: true,
            enumerable: true
        });
    }
    
    /**
     * 创建 getter/setter 描述符
     */
    static accessor(
        getter: (host: any) => any,
        setter?: (host: any, value: any) => void
    ): IPropertyDescriptorFactory {
        return (host) => {
            const descriptor: PropertyDescriptor = {
                get: () => getter(host),
                configurable: true,
                enumerable: true
            };
            if (setter) {
                descriptor.set = (value) => setter(host, value);
            }
            return descriptor;
        };
    }
    
    /**
     * 创建方法描述符
     */
    static method(method: (host: any, ...args: any[]) => any): IPropertyDescriptorFactory {
        return (host) => ({
            value: (...args: any[]) => method(host, ...args),
            writable: true,
            configurable: true,
            enumerable: true
        });
    }
    
    /**
     * 创建值描述符
     */
    static value(value: any): IPropertyDescriptorFactory {
        return (host) => ({
            value,
            writable: true,
            configurable: true,
            enumerable: true
        });
    }
}

console.log('使用辅助函数：');
console.log(`
class FlatLocalStateAbility {
    static precompile() {
        const descriptorFactories = new Map();
        
        // getter 属性（简洁）
        descriptorFactories.set('loading', 
            DescriptorFactory.getter(host => host.state.loading)
        );
        
        // 方法（简洁）
        descriptorFactories.set('getDeletionPlan', 
            DescriptorFactory.method((host, ids) => host.state.getDeletionPlan(ids))
        );
        
        // 值（简洁）
        descriptorFactories.set('eventCount', 
            DescriptorFactory.value(0)
        );
        
        return { descriptorFactories, name: 'FlatLocalState' };
    }
}
`);


// ============================================
// 完整示例（使用辅助函数）
// ============================================

console.log('\n=== 完整示例（使用辅助函数） ===\n');

class FlatLocalStateAbilityElegant {
    name = 'FlatLocalState';
    
    static precompile(): IPrecompiledAbility {
        const descriptorFactories = new Map<string, IPropertyDescriptorFactory>();
        
        // getter 属性
        descriptorFactories.set('loading', 
            DescriptorFactory.getter(host => host.state.loading)
        );
        descriptorFactories.set('isEmpty', 
            DescriptorFactory.getter(host => host.state.items.length === 0)
        );
        descriptorFactories.set('total', 
            DescriptorFactory.getter(host => host.state.items.length)
        );
        descriptorFactories.set('items', 
            DescriptorFactory.getter(host => host.state.items)
        );
        descriptorFactories.set('hasChanges', 
            DescriptorFactory.getter(host => host.state.hasChanges)
        );
        descriptorFactories.set('adds', 
            DescriptorFactory.getter(host => host.state.changes.added)
        );
        descriptorFactories.set('updates', 
            DescriptorFactory.getter(host => host.state.changes.updated)
        );
        
        // 方法
        descriptorFactories.set('getDeletionPlan', 
            DescriptorFactory.method((host, ids) => host.state.getDeletionPlan(ids))
        );
        
        return { descriptorFactories, name: 'FlatLocalState' };
    }
}

console.log('使用辅助函数的实现更简洁优雅！');


// ============================================
// 总结
// ============================================

console.log('\n\n=== 总结 ===\n');

console.log('✅ getter/setter 完美支持');
console.log('✅ 普通方法完美支持');
console.log('✅ 普通值完美支持');
console.log('✅ 无需运行时类型判断');
console.log('✅ 直接返回完整描述符');
console.log('✅ 辅助函数让实现更简洁');
console.log('');
console.log('方案：');
console.log('1. 工厂函数返回 PropertyDescriptor');
console.log('2. 使用 DescriptorFactory 辅助类');
console.log('3. getter/setter/method/value 统一处理');
