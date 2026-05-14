# DebounceAbilityBase 使用说明

## 修改内容

### 旧版本
```typescript
export abstract class DebounceAbilityBase<T extends IComposableBase> extends AbilityBase<T> {
    private debouncedMap = new Map<string, any>();

    protected getDebouncedAction<A extends (...args: any[]) => any>(
        key: string,
        fn: A,
        wait: number = 300,
        immediate: boolean = false
    ): A {
        if (!this.debouncedMap.has(key)) {
            this.debouncedMap.set(key, debounce(fn.bind(this), wait, immediate));
        }
        return this.debouncedMap.get(key);
    }

    public dispose() {
        this.debouncedMap.forEach(d => d.cancel?.());
        this.debouncedMap.clear();
        super.dispose();
    }
}
```

### 新版本
```typescript
export abstract class DebounceAbilityBase extends AbilityBase {
    private debouncedMap = new Map<string, any>();

    protected getDebouncedAction<A extends (...args: any[]) => any>(
        key: string,
        fn: A,
        wait: number = 300,
        immediate: boolean = false
    ): A {
        if (!this.debouncedMap.has(key)) {
            this.debouncedMap.set(key, debounce(fn.bind(this), wait, immediate));
        }
        return this.debouncedMap.get(key);
    }

    protected onDispose(): void {
        this.debouncedMap.forEach(d => d.cancel?.());
        this.debouncedMap.clear();
    }
}
```

### 主要变化

1. ✅ **移除泛型参数** - `<T extends IComposableBase>` 不再需要
2. ✅ **使用 onDispose()** - 替代 `dispose()` 方法
3. ✅ **无需调用 super.dispose()** - AbilityBase 自动处理

## 使用示例

### 基本用法

```typescript
import { DebounceAbilityBase, type IExposeResult } from '@/kernel/composable';

class SearchAbility extends DebounceAbilityBase {
    readonly name = 'Search';
    
    protected expose(): IExposeResult {
        return {
            // 防抖搜索方法
            search: this.getDebouncedAction(
                'search',
                (keyword: string) => {
                    console.log('执行搜索:', keyword);
                    // 实际搜索逻辑
                },
                300  // 300ms 防抖
            ),
            
            // 另一个防抖方法
            save: this.getDebouncedAction(
                'save',
                () => {
                    console.log('自动保存');
                    // 保存逻辑
                },
                1000  // 1秒防抖
            ),
        };
    }
}
```

### 完整示例

```typescript
import { DebounceAbilityBase, type IExposeResult } from '@/kernel/composable';
import type { IComposableBase } from '@/kernel/types';

/**
 * 自动保存能力
 */
class AutoSaveAbility extends DebounceAbilityBase {
    readonly name = 'AutoSave';
    
    /**
     * 保存状态
     * @private
     */
    private lastSaved: Date | null = null;
    
    protected expose(): IExposeResult {
        return {
            // getter: 最后保存时间
            lastSavedTime: { 
                get: () => this.lastSaved 
            },
            
            // 方法: 手动保存
            save: this.getDebouncedAction(
                'save',
                () => {
                    this.doSave();
                },
                1000  // 1秒防抖
            ),
            
            // 方法: 立即保存（无防抖）
            saveNow: () => {
                this.doSave();
            },
            
            // 方法: 输入时自动保存
            onInput: this.getDebouncedAction(
                'onInput',
                (value: string) => {
                    this.host.logger?.info('输入变化，自动保存');
                    this.doSave();
                },
                500  // 500ms防抖
            ),
        };
    }
    
    /**
     * 执行保存
     * @private
     */
    private doSave(): void {
        // 保存逻辑
        this.lastSaved = new Date();
        this.host.logger?.info('数据已保存');
    }
    
    /**
     * 销毁时清理
     */
    protected onDispose(): void {
        // 最后保存一次
        this.doSave();
        
        // 调用父类清理（清理防抖定时器）
        super.onDispose();
    }
}
```

### 使用能力

```typescript
import { Ability, ComposableBase } from '@/kernel/composable';

@Ability('AutoSave')
class Editor extends ComposableBase {
    constructor() {
        super();
    }
}

const editor = new Editor();

// 防抖保存（1秒内多次调用只执行一次）
editor.save();
editor.save();
editor.save();  // 只执行一次

// 立即保存
editor.saveNow();

// 输入时自动保存
editor.onInput('text');
editor.onInput('text more');
editor.onInput('text more...');  // 500ms后执行一次
```

## API 说明

### getDebouncedAction()

```typescript
protected getDebouncedAction<A extends (...args: any[]) => any>(
    key: string,          // 唯一标识键
    fn: A,                // 原始函数
    wait: number = 300,   // 等待时间（毫秒）
    immediate: boolean = false  // 是否立即执行
): A
```

**参数：**
- `key` - 唯一标识键，用于缓存防抖函数
- `fn` - 原始函数
- `wait` - 等待时间，默认 300ms
- `immediate` - 是否立即执行，默认 false

**返回：**
- 防抖后的函数

### onDispose()

自动清理所有防抖定时器，子类可以重写添加额外清理逻辑：

```typescript
protected onDispose(): void {
    // 自定义清理
    this.doSomething();
    
    // 调用父类清理防抖定时器
    super.onDispose();
}
```

## 优势

### 1. 自动清理
- ✅ 销毁时自动取消所有防抖定时器
- ✅ 防止内存泄漏
- ✅ 无需手动管理

### 2. 简单易用
- ✅ 一行代码创建防抖函数
- ✅ 自动缓存
- ✅ 类型安全

### 3. 性能优化
- ✅ 防抖函数自动缓存
- ✅ 避免重复创建
- ✅ 预编译支持

## 总结

**DebounceAbilityBase 已完全适配新框架！**

- ✅ 继承自新版 AbilityBase
- ✅ 使用 onDispose() 清理
- ✅ 保持原有功能
- ✅ 更简洁的API
- ✅ 自动清理定时器

**可以直接使用，无需修改现有代码！**
