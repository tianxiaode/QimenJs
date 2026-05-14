# 新框架能力实现指南

## 核心变化

### ❌ 不再需要 AbilityBase

**旧方式：**
```typescript
class EventAbility extends AbilityBase<HostType> {
    protected host: HostType;
    
    protected expose() {
        return {
            on: (event, handler) => {
                // this.host 访问宿主
            }
        };
    }
}
```

**新方式：**
```typescript
class EventAbility implements IPrecompilableAbility {
    readonly name = 'Event';
    
    precompile(): IPrecompiledAbility {
        const descriptorFactories = new Map();
        
        descriptorFactories.set('on', 
            DescriptorFactory.method((host, event, handler) => {
                // host 通过闭包捕获
            })
        );
        
        return { name: 'Event', descriptorFactories };
    }
}
```

## 实现步骤

### 1. 实现 IPrecompilableAbility 接口

```typescript
import { DescriptorFactory } from '@/kernel/composable';
import type { IPrecompiledAbility, IPrecompilableAbility } from '@/kernel/composable';

class YourAbility implements IPrecompilableAbility {
    readonly name = 'YourAbility';
    
    precompile(): IPrecompiledAbility {
        // ...
    }
}
```

### 2. 实现 precompile() 方法

```typescript
precompile(): IPrecompiledAbility {
    const descriptorFactories = new Map();
    
    // 添加 getter
    descriptorFactories.set('loading', 
        DescriptorFactory.getter(host => host.state.loading)
    );
    
    // 添加方法
    descriptorFactories.set('on', 
        DescriptorFactory.method((host, event, handler) => {
            // 实现
        })
    );
    
    // 添加 getter/setter
    descriptorFactories.set('value', 
        DescriptorFactory.accessor(
            host => host.state.value,
            (host, value) => { host.state.value = value; }
        )
    );
    
    // 销毁函数（可选）
    const createDisposer = (host) => () => {
        // 清理逻辑
    };
    
    return { 
        name: this.name,
        descriptorFactories,
        createDisposer  // 可选
    };
}
```

### 3. 注册能力

```typescript
import { ComposableRegistrar } from '@/kernel/registrars';

const registrar = ComposableRegistrar.getInstance();

registrar.register(
    { name: 'YourAbility', ctor: YourAbility },
    new YourAbility(),
    { immediate: true }  // 可选：立即预编译
);
```

### 4. 使用能力

```typescript
import { Ability, ComposableBase } from '@/kernel/composable';

@Ability('YourAbility')
class User extends ComposableBase {
    constructor() {
        super();
    }
}

const user = new User();
user.on('click', () => {});  // 直接使用
```

## 完整示例

### EventAbility

```typescript
class EventAbility implements IPrecompilableAbility {
    readonly name = 'Event';
    
    precompile(): IPrecompiledAbility {
        const descriptorFactories = new Map();
        
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
        
        descriptorFactories.set('emit', 
            DescriptorFactory.method((host, event: string, data: any) => {
                const handlers = host.__events__?.get(event);
                if (handlers) {
                    handlers.forEach(handler => handler(data));
                }
            })
        );
        
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
```

### FlatLocalStateAbility

```typescript
class FlatLocalStateAbility implements IPrecompilableAbility {
    readonly name = 'FlatLocalState';
    
    precompile(): IPrecompiledAbility {
        const descriptorFactories = new Map();
        
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
```

## 新方式的优势

### ✅ 无需基类
- 不继承 AbilityBase
- 直接实现接口
- 更灵活

### ✅ 无需 this.host
- host 通过闭包捕获
- 无需存储引用
- 内存更优

### ✅ 预编译
- precompile() 返回工厂函数
- 运行时直接使用
- 性能最优

### ✅ 类型安全
- 完整的类型定义
- 编译时检查
- 智能提示

## DescriptorFactory 方法

| 方法 | 用途 | 示例 |
|------|------|------|
| `getter()` | 创建 getter | `DescriptorFactory.getter(host => host.value)` |
| `setter()` | 创建 setter | `DescriptorFactory.setter((host, v) => host.value = v)` |
| `accessor()` | 创建 getter/setter | `DescriptorFactory.accessor(getter, setter)` |
| `method()` | 创建方法 | `DescriptorFactory.method((host, ...args) => {})` |
| `value()` | 创建值 | `DescriptorFactory.value(0)` |
| `dynamicValue()` | 创建动态值 | `DescriptorFactory.dynamicValue(host => new Map())` |
| `readonlyValue()` | 创建只读值 | `DescriptorFactory.readonlyValue('constant')` |
| `computed()` | 创建计算属性 | `DescriptorFactory.computed(host => expensive(host))` |

## 总结

**新框架能力实现：**

1. ❌ 不需要 AbilityBase
2. ✅ 直接实现 IPrecompilableAbility 接口
3. ✅ 使用 DescriptorFactory 创建描述符
4. ✅ 通过闭包捕获 host
5. ✅ 提供销毁函数（可选）

**更简单、更灵活、性能更好！**
