# 能力定义方式对比

## 旧方式（使用 AbilityBase）

```typescript
import { AbilityBase } from '../../composable';
import type { IComposableBase, IExposeResult } from '../../types';

class EventAbility<T extends IComposableBase> extends AbilityBase<T> {
    protected expose(): IExposeResult {
        const scope = globalEventBus.createEventScope();

        return {
            eventScope: { get: () => scope },
            on: (event: string, handler: EventHandler) => scope.on(event, handler),
            once: (event: string, handler: EventHandler) => scope.once(event, handler),
            emit: (event: string, data?: any) => {
                scope.emit(event, data, this.host);
            },
        };
    }
}
```

## 新方式（使用 defineAbility）

```typescript
import type { IPrecompilableAbility } from '@/kernel/composable';
import { defineAbility } from '@/kernel/composable/AbilityBuilder';

class EventAbility implements IPrecompilableAbility {
    readonly name = 'Event';
    
    precompile() {
        return defineAbility()
            .getter('eventScope', (host) => globalEventBus.createEventScope())
            .method('on', (host, event, handler) => host.eventScope.on(event, handler))
            .method('once', (host, event, handler) => host.eventScope.once(event, handler))
            .method('emit', (host, event, data) => host.eventScope.emit(event, data, host))
            .disposer((host) => () => host.eventScope.dispose())
            .build('Event');
    }
}
```

## 对比分析

### 代码量

| 方式 | 行数 | 复杂度 |
|------|------|--------|
| 旧方式 | ~20行 | 中等 |
| 新方式 | ~10行 | 简单 |

### 可读性

**旧方式：**
- ✅ 结构清晰
- ⚠️ 需要理解 expose() 模式
- ⚠️ getter 需要特殊语法 `{ get: () => ... }`

**新方式：**
- ✅ 链式调用，一目了然
- ✅ 每个方法意图明确
- ✅ 无需特殊语法

### 性能

**旧方式：**
- ❌ 每次实例化都要调用 expose()
- ❌ 需要创建 Ability 实例
- ❌ 需要 this.host 存储

**新方式：**
- ✅ 预编译，运行时零开销
- ✅ 无需 Ability 实例
- ✅ 闭包捕获 host

## 完整示例对比

### DomainAbility

**旧方式：**
```typescript
class DomainAbility<T extends IComposableBase> extends AbilityBase<T> {
    protected expose(): IExposeResult {
        const host = this.host;
        let config = host.getStatic<DomainConfig>(DOMAIN_CACHE_SYMBOL);
        
        if (!config) {
            const domainName = host.domain;
            if (domainName) {
                config = DomainRegistrar.getInstance().get(domainName);
                host.setStatic(DOMAIN_CACHE_SYMBOL, config);
                host.logger?.debug?.(`Domain [${domainName}] initialized.`);
            }
        }

        return {
            domainConfig: {
                get: (): DomainConfig => config as DomainConfig,
                enumerable: true,
            },
        };
    }
}
```

**新方式：**
```typescript
class DomainAbility implements IPrecompilableAbility {
    readonly name = 'Domain';
    
    precompile() {
        return defineAbility()
            .getter('domainConfig', (host) => {
                let config = host.getStatic<DomainConfig>(DOMAIN_CACHE_SYMBOL);
                
                if (!config) {
                    const domainName = host.domain;
                    if (domainName) {
                        config = DomainRegistrar.getInstance().get(domainName);
                        host.setStatic(DOMAIN_CACHE_SYMBOL, config);
                        host.logger?.debug?.(`Domain [${domainName}] initialized.`);
                    }
                }
                
                return config as DomainConfig;
            })
            .build('Domain');
    }
}
```

### SystemAbility

**旧方式：**
```typescript
class SystemAbility<T extends IComposableBase> extends AbilityBase<T> {
    protected expose(): IExposeResult {
        const registrar = SystemRegistrar.getInstance();
        
        const systemConfig = <K extends keyof SystemConfig>(key?: K) => {
            if (key !== undefined) {
                return registrar.get(key);
            }
            return registrar.getAll();
        };

        return {
            systemConfig: systemConfig,
        };
    }
}
```

**新方式：**
```typescript
class SystemAbility implements IPrecompilableAbility {
    readonly name = 'System';
    
    precompile() {
        return defineAbility()
            .method('systemConfig', <K extends keyof SystemConfig>(key?: K) => {
                const registrar = SystemRegistrar.getInstance();
                if (key !== undefined) {
                    return registrar.get(key);
                }
                return registrar.getAll();
            })
            .build('System');
    }
}
```

## defineAbility API

### 链式方法

```typescript
defineAbility()
    // getter 属性
    .getter('name', host => host.value)
    
    // setter 属性
    .setter('name', (host, value) => host.value = value)
    
    // getter/setter
    .accessor('name', 
        host => host.value,
        (host, value) => host.value = value
    )
    
    // 方法
    .method('name', (host, ...args) => { /* 实现 */ })
    
    // 值
    .value('name', 0)
    
    // 动态值
    .dynamicValue('name', host => new Map())
    
    // 销毁函数
    .disposer(host => () => { /* 清理 */ })
    
    // 构建
    .build('AbilityName')
```

### 优势总结

**新方式的优势：**

1. ✅ **更简洁**
   - 链式调用
   - 一行一个属性
   - 无需 return 对象

2. ✅ **更清晰**
   - 方法名即意图
   - 无需特殊语法
   - 类型推断完整

3. ✅ **性能更好**
   - 预编译
   - 无运行时开销
   - 内存占用小

4. ✅ **类型安全**
   - 完整的类型推断
   - 编译时检查
   - 智能提示

## 总结

**新方式（defineAbility）比旧方式更简洁、更清晰、性能更好！**

推荐使用 `defineAbility()` 来定义所有能力。
