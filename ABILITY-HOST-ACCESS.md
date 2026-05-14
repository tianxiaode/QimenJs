# AbilityBase this.host 访问机制详解

## 问题分析

### 原始问题

**在 expose() 中直接使用 this.host 会出错！**

```typescript
// ❌ 错误示例
class DomainAbility extends AbilityBase {
    protected expose(): IExposeResult {
        // 此时 this.host 是 undefined！
        const domain = this.host.domain;  // ❌ 错误
        
        return {
            domainConfig: { get: () => domain }
        };
    }
}
```

### 问题根源

**执行时机分析：**

```
1. precompile() 阶段（注册时）
   ├── 创建临时实例
   ├── tempInstance.host = null
   ├── 调用 tempInstance.expose()  ← 此时 this.host 是 null！
   └── 返回预编译能力

2. 运行时（实例创建时）
   ├── 调用 descriptorFactory(host)
   ├── 设置 this.host = host  ← 此时才设置 host
   └── 返回属性描述符
```

**关键点：**
- `expose()` 在预编译阶段调用，此时 `this.host` 还未设置
- `this.host` 在运行时才通过闭包捕获设置

## 解决方案

### 方案：在 getter/setter/方法中访问 this.host

**正确做法：**

```typescript
// ✅ 正确示例
class DomainAbility extends AbilityBase {
    protected expose(): IExposeResult {
        return {
            // 在 getter 中访问 this.host
            domainConfig: {
                get: (): DomainConfig => {
                    // 此时 this.host 已经设置！
                    let config = this.host.getStatic<DomainConfig>(DOMAIN_CACHE_SYMBOL);
                    
                    if (!config) {
                        const domainName = this.host.domain;  // ✅ 正确
                        config = DomainRegistrar.getInstance().get(domainName);
                        this.host.setStatic(DOMAIN_CACHE_SYMBOL, config);
                    }
                    
                    return config as DomainConfig;
                }
            }
        };
    }
}
```

### 工作原理

**1. 预编译阶段**

```typescript
precompile() {
    // 创建临时实例
    const tempInstance = Object.create(this.constructor.prototype);
    tempInstance.host = null;  // ← 临时设置
    
    // 调用 expose()，返回 getter/setter 定义
    const props = tempInstance.expose();
    
    // 将 getter 转换为描述符工厂
    descriptorFactories.set('domainConfig', (host) => {
        this.host = host;  // ← 运行时设置
        return {
            get: props.domainConfig.get,  // ← getter 函数
            configurable: true,
            enumerable: true
        };
    });
}
```

**2. 运行时**

```typescript
// ComposableBase 创建实例时
const descriptor = descriptorFactory(this);  // ← 传入 host

// descriptorFactory 内部
this.host = host;  // ← 设置 this.host

// 返回描述符
return {
    get: () => {
        // getter 执行时，this.host 已经设置
        return this.host.domain;  // ✅ 可以访问
    }
};
```

## 使用规则

### 规则 1: 不能在 expose() 中直接使用 this.host

```typescript
// ❌ 错误
protected expose() {
    const domain = this.host.domain;  // this.host 是 null
    return { domain: { get: () => domain } };
}
```

### 规则 2: 在 getter/setter 中使用 this.host

```typescript
// ✅ 正确
protected expose() {
    return {
        domain: {
            get: () => this.host.domain  // getter 中访问
        }
    };
}
```

### 规则 3: 在方法中使用 this.host

```typescript
// ✅ 正确
protected expose() {
    return {
        getConfig: () => {
            return this.host.getStatic(CONFIG_SYMBOL);  // 方法中访问
        }
    };
}
```

### 规则 4: 在 onDispose() 中使用 this.host

```typescript
// ✅ 正确
protected onDispose(): void {
    this.host.logger?.info('Disposing');  // onDispose 中访问
    // 清理逻辑
}
```

## 完整示例

### EventAbility

```typescript
class EventAbility extends AbilityBase {
    readonly name = 'Event';
    private scope: any;
    
    protected expose(): IExposeResult {
        // 创建事件作用域（不依赖 this.host）
        this.scope = globalEventBus.createEventScope();
        
        return {
            // getter
            eventScope: { get: () => this.scope },
            
            // 方法（不使用 this.host）
            on: (event, handler) => this.scope.on(event, handler),
            emit: (event, data) => this.scope.emit(event, data),
        };
    }
    
    protected onDispose(): void {
        this.scope?.dispose();  // onDispose 中可以访问 this.host
    }
}
```

### DomainAbility

```typescript
class DomainAbility extends AbilityBase {
    readonly name = 'Domain';
    
    protected expose(): IExposeResult {
        return {
            // getter 中访问 this.host
            domainConfig: {
                get: (): DomainConfig => {
                    let config = this.host.getStatic<DomainConfig>(DOMAIN_CACHE_SYMBOL);
                    
                    if (!config) {
                        const domainName = this.host.domain;  // ✅ 正确
                        config = DomainRegistrar.getInstance().get(domainName);
                        this.host.setStatic(DOMAIN_CACHE_SYMBOL, config);
                    }
                    
                    return config as DomainConfig;
                }
            }
        };
    }
}
```

### DomEventsAbility

```typescript
class DomEventsAbility extends AbilityBase {
    readonly name = 'DomEvents';
    private _adapter?: IEventAdapter<any>;
    
    protected expose(): IExposeResult {
        return {
            // 方法中访问 this.host
            bind: (target, semantic, options) => {
                const scope = this.host.eventScope;  // ✅ 正确
                return this.getAdapter().bind(target, semantic, scope, options, this.host);
            }
        };
    }
}
```

## 实现细节

### AbilityBase 中的关键代码

```typescript
export abstract class AbilityBase {
    protected host: any;
    
    protected abstract expose(): IExposeResult;
    
    precompile(): IPrecompiledAbility {
        // 1. 创建临时实例
        const tempInstance = Object.create(this.constructor.prototype);
        tempInstance.host = null;  // ← 临时设置
        
        // 2. 调用 expose()，获取属性定义
        const props = tempInstance.expose();
        
        // 3. 转换为描述符工厂
        for (const [key, value] of props) {
            descriptorFactories.set(key, (host) => {
                this.host = host;  // ← 运行时设置
                return createDescriptor(value);
            });
        }
        
        return { descriptorFactories };
    }
}
```

## 总结

### 关键要点

**1. this.host 的生命周期**
- 预编译时：`null`（临时实例）
- 运行时：实际 host 对象

**2. 使用规则**
- ❌ 不能在 `expose()` 中直接使用 `this.host`
- ✅ 可以在 getter/setter 中使用 `this.host`
- ✅ 可以在方法中使用 `this.host`
- ✅ 可以在 `onDispose()` 中使用 `this.host`

**3. 原因**
- `expose()` 在预编译阶段调用
- getter/setter/方法在运行时调用
- `this.host` 在运行时才设置

### 最佳实践

**延迟访问 host：**

```typescript
// ✅ 推荐：在 getter 中延迟访问
protected expose() {
    return {
        config: {
            get: () => this.host.getConfig()  // 延迟访问
        }
    };
}
```

**避免在 expose() 中计算：**

```typescript
// ❌ 不推荐：在 expose() 中计算
protected expose() {
    const config = this.host.getConfig();  // 错误！
    return { config: { get: () => config } };
}
```

**DomainAbility 已修复！现在可以正确访问 this.host！**
