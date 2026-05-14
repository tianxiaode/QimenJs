# 新版 AbilityBase 设计说明

## 设计思路

**结合了熟悉的 expose() API 和预编译性能优势！**

### 核心特点

1. ✅ **熟悉的API** - 使用 expose() 方法定义属性
2. ✅ **自动预编译** - 内部自动转换为预编译能力
3. ✅ **销毁提醒** - 提供 onDispose() 方法，不易忘记
4. ✅ **类型安全** - 完整的类型定义和检查
5. ✅ **性能最优** - 预编译 + 闭包捕获

## 使用方式

### 基本用法

```typescript
import { AbilityBase, type IExposeResult } from '@/kernel/composable';

class EventAbility extends AbilityBase {
    readonly name = 'Event';
    
    // 1. 定义要暴露的属性和方法
    protected expose(): IExposeResult {
        const scope = globalEventBus.createEventScope();
        
        return {
            // getter
            eventScope: { get: () => scope },
            
            // 方法
            on: (event, handler) => scope.on(event, handler),
            emit: (event, data) => scope.emit(event, data),
        };
    }
    
    // 2. 销毁处理（可选）
    protected onDispose(): void {
        this.scope?.dispose();
    }
}
```

### 完整示例

#### EventAbility

```typescript
class EventAbility extends AbilityBase {
    readonly name = 'Event';
    private scope: any;
    
    protected expose(): IExposeResult {
        this.scope = globalEventBus.createEventScope();
        
        return {
            eventScope: { get: () => this.scope },
            on: (event, handler) => this.scope.on(event, handler),
            once: (event, handler) => this.scope.once(event, handler),
            emit: (event, data) => this.scope.emit(event, data, this.host),
        };
    }
    
    protected onDispose(): void {
        this.scope?.dispose();
        this.scope = null;
    }
}
```

#### DomainAbility

```typescript
class DomainAbility extends AbilityBase {
    readonly name = 'Domain';
    
    protected expose(): IExposeResult {
        let config = this.host.getStatic<DomainConfig>(DOMAIN_CACHE_SYMBOL);
        
        if (!config) {
            const domainName = this.host.domain;
            if (domainName) {
                config = DomainRegistrar.getInstance().get(domainName);
                this.host.setStatic(DOMAIN_CACHE_SYMBOL, config);
            }
        }
        
        return {
            domainConfig: {
                get: () => config,
                enumerable: true,
            },
        };
    }
}
```

#### SystemAbility

```typescript
class SystemAbility extends AbilityBase {
    readonly name = 'System';
    
    protected expose(): IExposeResult {
        const registrar = SystemRegistrar.getInstance();
        
        const systemConfig = (key?) => {
            return key !== undefined 
                ? registrar.get(key) 
                : registrar.getAll();
        };
        
        return {
            systemConfig,
        };
    }
}
```

## IExposeResult 类型

### 支持的定义方式

```typescript
interface IExposeResult {
    // 1. getter
    loading: { get: () => boolean };
    
    // 2. setter
    value: { set: (v: any) => void };
    
    // 3. getter/setter
    data: { get: () => any; set: (v: any) => void };
    
    // 4. 方法
    on: (event: string, handler: Function) => void;
    
    // 5. 值
    count: number;
}
```

## 对比三种方式

### 方式1：旧版 AbilityBase

```typescript
class EventAbility extends AbilityBase<T> {
    protected expose() {
        return {
            on: (event, handler) => { /* this.host */ },
        };
    }
}
```

**问题：**
- ❌ 每次实例化都调用 expose()
- ❌ 需要创建 Ability 实例
- ❌ 性能较差

### 方式2：defineAbility

```typescript
class EventAbility implements IPrecompilableAbility {
    precompile() {
        return defineAbility()
            .method('on', (host, event, handler) => { })
            .build('Event');
    }
}
```

**问题：**
- ⚠️ API 不够直观
- ⚠️ 容易忘记销毁函数

### 方式3：新版 AbilityBase（推荐）

```typescript
class EventAbility extends AbilityBase {
    readonly name = 'Event';
    
    protected expose() {
        return {
            on: (event, handler) => { },
        };
    }
    
    protected onDispose() {
        // 清理逻辑
    }
}
```

**优势：**
- ✅ 熟悉的 expose() API
- ✅ 自动预编译
- ✅ onDispose() 提醒销毁
- ✅ 性能最优

## 工作原理

### 1. precompile() 方法

```typescript
precompile(): IPrecompiledAbility {
    const descriptorFactories = new Map();
    
    // 调用 expose() 获取定义
    const props = this.expose();
    
    // 转换为描述符工厂
    for (const [key, value] of Object.entries(props)) {
        const factory = this.createDescriptorFactory(value);
        descriptorFactories.set(key, factory);
    }
    
    // 创建销毁函数
    const createDisposer = (host) => () => {
        this.host = host;
        this.onDispose();  // ← 调用子类的销毁方法
    };
    
    return { name, descriptorFactories, createDisposer };
}
```

### 2. 自动转换

```typescript
// expose() 返回
{
    loading: { get: () => state.loading },  // getter
    on: (event, handler) => { },            // 方法
    count: 0                                // 值
}

// 自动转换为
Map {
    'loading' => (host) => ({ get: ..., configurable: true }),
    'on' => (host) => ({ value: ..., writable: true }),
    'count' => () => ({ value: 0, writable: true })
}
```

### 3. 销毁处理

```typescript
// ComposableBase 中
const createDisposer = precompiled.createDisposer;
if (createDisposer) {
    disposers.push(createDisposer(host));  // ← 自动调用
}

// createDisposer 内部
() => {
    this.host = host;
    this.onDispose();  // ← 调用子类的 onDispose()
}
```

## 优势总结

### 1. 熟悉的API
- ✅ 使用 expose() 方法定义
- ✅ 与旧版API一致
- ✅ 无需学习新语法

### 2. 自动预编译
- ✅ 内部自动转换
- ✅ 性能最优
- ✅ 无需手动优化

### 3. 销毁提醒
- ✅ onDispose() 方法
- ✅ 类型提示
- ✅ 不易忘记

### 4. 类型安全
- ✅ IExposeResult 类型
- ✅ 编译时检查
- ✅ 智能提示

### 5. 性能最优
- ✅ 预编译
- ✅ 闭包捕获
- ✅ 无运行时开销

## 总结

**新版 AbilityBase 是最佳方案！**

- 熟悉的API（expose）
- 自动预编译（性能）
- 销毁提醒（onDispose）
- 类型安全
- 易于使用

**推荐所有能力都继承 AbilityBase！**
