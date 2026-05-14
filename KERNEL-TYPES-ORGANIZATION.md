# Kernel Types 整理总结

## 整理原则

**将所有类型定义集中到 `kernel/types` 目录，防止循环引用！**

## 文件结构

### 整理前

```
src/kernel/
├── composable/
│   ├── types.ts          ← 类型定义（重复）
│   ├── AbilityBase.ts
│   └── ...
└── types/
    ├── composable.ts     ← 类型定义（旧）
    └── ...
```

### 整理后

```
src/kernel/
├── composable/
│   ├── AbilityBase.ts    ← 只包含实现
│   ├── ComposableBase.ts
│   ├── DescriptorFactory.ts
│   ├── DebounceAbilityBase.ts
│   └── index.ts          ← 重新导出types
└── types/
    ├── composable.ts     ← 所有类型定义 ⭐
    ├── abilities/
    ├── entities/
    ├── events/
    └── ...
```

## types/composable.ts 内容

### 基硎接口

```typescript
// 可组合接口
interface IComposable {
    attach: (host: any) => void;
    dispose?: () => void;
}

// 可组合基类接口
interface IComposableBase {
    domain?: string;
    logger: ILogger;
    getStatic<T>(key: string | symbol): T | undefined;
    setStatic<T>(key: string | symbol, value: T): void;
    [key: string]: any;
}

// 能力宿主基类类型
type AbilityHostBase = Omit<IComposableBase, 'getStatic' | 'setStatic'>;
```

### 暴露结果类型

```typescript
// 暴露值类型
type ExposeValue = PropertyDescriptor | any;

// 暴露结果接口
interface IExposeResult {
    [key: string | symbol]: ExposeValue;
}
```

### 预编译能力类型

```typescript
// 描述符工厂函数类型
type DescriptorFactoryFn<T = any> = (host: T) => PropertyDescriptor;

// 销毁函数工厂类型
type DisposerFactoryFn<T = any> = (host: T) => () => void;

// 预编译能力接口
interface IPrecompiledAbility<T = any> {
    readonly name: string;
    readonly descriptorFactories: Map<string | symbol, DescriptorFactoryFn<T>>;
    readonly createDisposer?: DisposerFactoryFn<T>;
}

// 可预编译能力类接口
interface IPrecompilableAbility<T = any> {
    readonly name: string;
    precompile(): IPrecompiledAbility<T>;
}
```

### 能力注册类型

```typescript
// 能力注册条目
interface IAbilityRegistrationEntry {
    readonly name: string;
    readonly description?: string;
    readonly deps?: readonly string[];
    readonly abilityClass: IPrecompilableAbility;
}

// 能力注册选项
interface IAbilityRegistrationOptions {
    readonly immediate?: boolean;
}
```

### 工具类型

```typescript
// 能力装饰器类型
type AbilityDecorator = <T extends new (...args: any[]) => any>(constructor: T) => T;

// 提取宿主类型
type ExtractHostType<T extends IPrecompilableAbility> = 
    T extends IPrecompilableAbility<infer H> ? H : never;

// 能力属性映射类型
type AbilityProperties<T = any> = Record<string | symbol, DescriptorFactoryFn<T>>;
```

## 导入方式

### 从 composable 导入（推荐）

```typescript
import { 
    AbilityBase, 
    ComposableBase,
    type IExposeResult,
    type IPrecompilableAbility
} from '@/kernel/composable';
```

### 从 types 导入

```typescript
import type { 
    IExposeResult,
    IPrecompilableAbility 
} from '@/kernel/types/composable';
```

## 优势

### 1. 防止循环引用
- ✅ 所有类型定义集中在 types 目录
- ✅ 实现文件只导入类型
- ✅ 清晰的依赖关系

### 2. 易于维护
- ✅ 类型定义集中管理
- ✅ 修改类型只需改一处
- ✅ 自动同步更新

### 3. 清晰的结构
- ✅ types/ - 类型定义
- ✅ composable/ - 实现
- ✅ 职责分离

### 4. 向后兼容
- ✅ composable/index.ts 重新导出所有类型
- ✅ 现有代码无需修改
- ✅ 平滑迁移

## 已更新的文件

✅ **types/composable.ts** - 合并所有类型定义
✅ **composable/types.ts** - 已删除
✅ **composable/AbilityBase.ts** - 更新导入
✅ **composable/DescriptorFactory.ts** - 更新导入
✅ **composable/index.ts** - 更新导出
✅ **registrars/ComposableRegistrar.ts** - 更新导入

## 使用建议

**推荐从 composable 导入：**

```typescript
// ✅ 推荐
import { AbilityBase, type IExposeResult } from '@/kernel/composable';

// ⚠️ 也可以，但不推荐
import type { IExposeResult } from '@/kernel/types/composable';
```

**原因：**
- composable/index.ts 已经重新导出所有类型
- 导入路径更短
- 更符合使用习惯

## 总结

**类型整理完成！**

- ✅ 所有类型定义集中在 types 目录
- ✅ 防止循环引用
- ✅ 清晰的文件结构
- ✅ 易于维护
- ✅ 向后兼容
