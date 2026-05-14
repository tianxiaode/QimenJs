# 能力文件导入修复总结

## 问题分析

### 问题根源

**类型定义写在类定义文件中，导致循环引用！**

```
AbilityBase.ts
├── 定义了 IExposeResult 类型
└── 导出 IExposeResult

EventAbility.ts
├── 从 AbilityBase 导入 IExposeResult
└── AbilityBase 又可能依赖 EventAbility
    └── 循环引用！
```

### 错误表现

```typescript
// ❌ 错误：从 AbilityBase 导入类型
import { AbilityBase, type IExposeResult } from '@/kernel/composable/AbilityBase';
```

## 解决方案

### 原则

**所有类型定义必须放在 `types` 目录，实现文件只导入类型！**

```
types/composable.ts
├── 定义所有类型
└── 导出类型

AbilityBase.ts
├── 从 types 导入类型
└── 只包含实现
```

### 修复方式

**正确的导入方式：**

```typescript
// ✅ 正确：从 types 导入类型
import { AbilityBase } from '@/kernel/composable/AbilityBase';
import type { IExposeResult } from '@/kernel/types/composable';
```

## 已修复的文件

### 1. EventAbility.ts

**修复前：**
```typescript
import { AbilityBase, type IExposeResult } from '@/kernel/composable/AbilityBase';
```

**修复后：**
```typescript
import { AbilityBase } from '@/kernel/composable/AbilityBase';
import type { IExposeResult } from '@/kernel/types/composable';
```

### 2. DomainAbility.ts

**修复前：**
```typescript
import { AbilityBase, type IExposeResult } from '@/kernel/composable/AbilityBase';
```

**修复后：**
```typescript
import { AbilityBase } from '@/kernel/composable/AbilityBase';
import type { IExposeResult } from '@/kernel/types/composable';
```

### 3. SystemAbility.ts

**修复前：**
```typescript
import { AbilityBase, type IExposeResult } from '@/kernel/composable/AbilityBase';
```

**修复后：**
```typescript
import { AbilityBase } from '@/kernel/composable/AbilityBase';
import type { IExposeResult } from '@/kernel/types/composable';
```

### 4. DomEventsAbility.ts

**修复前：**
```typescript
import {
    BindOptions,
    GestureSemantic,
    IComposableBase,
    IEventAdapter,
    IExposeResult,  // ← 从 types 导入
} from '../../types';
import { AbilityBase } from '../../composable';

export class DomEventsAbility<T extends IComposableBase> extends AbilityBase<T> {
    // 旧版泛型参数
}
```

**修复后：**
```typescript
import type { 
    IComposableBase,
    IEventAdapter,
    BindOptions,
    GestureSemantic,
} from '../../types';
import type { IExposeResult } from '../../types/composable';  // ← 明确导入
import { AbilityBase } from '../../composable';

export class DomEventsAbility extends AbilityBase {
    readonly name = 'DomEvents';  // ← 添加名称
    // 移除泛型参数
}
```

## 修复要点

### 1. 类型导入分离

**原则：**
- ✅ 类型从 `types` 目录导入
- ✅ 实现从 `composable` 目录导入
- ✅ 使用 `import type` 明确类型导入

**示例：**
```typescript
// ✅ 正确
import { AbilityBase } from '@/kernel/composable/AbilityBase';
import type { IExposeResult } from '@/kernel/types/composable';

// ❌ 错误
import { AbilityBase, type IExposeResult } from '@/kernel/composable/AbilityBase';
```

### 2. 移除泛型参数

**旧版本：**
```typescript
export class DomEventsAbility<T extends IComposableBase> extends AbilityBase<T> {
    // ...
}
```

**新版本：**
```typescript
export class DomEventsAbility extends AbilityBase {
    readonly name = 'DomEvents';
    // ...
}
```

### 3. 添加能力名称

**所有能力必须定义 `name` 属性：**
```typescript
export class DomEventsAbility extends AbilityBase {
    readonly name = 'DomEvents';  // ← 必须定义
    // ...
}
```

## 目录结构

### 正确的结构

```
src/kernel/
├── types/
│   ├── composable.ts          ← 所有类型定义
│   ├── abilities/
│   ├── entities/
│   └── events/
├── composable/
│   ├── AbilityBase.ts         ← 实现（导入类型）
│   ├── ComposableBase.ts
│   └── index.ts
└── abilities/
    └── system/
        ├── EventAbility.ts    ← 实现（导入类型）
        ├── DomainAbility.ts
        ├── SystemAbility.ts
        └── DomEventsAbility.ts
```

### 依赖关系

```
types/composable.ts
    ↓ (类型导入)
AbilityBase.ts
    ↓ (继承)
EventAbility.ts, DomainAbility.ts, etc.
```

**单向依赖，无循环！**

## 优势

### 1. 防止循环引用
- ✅ 类型定义独立
- ✅ 单向依赖
- ✅ 编译安全

### 2. 清晰的结构
- ✅ types/ - 类型定义
- ✅ composable/ - 基硎实现
- ✅ abilities/ - 具体能力

### 3. 易于维护
- ✅ 类型集中管理
- ✅ 修改影响范围小
- ✅ 编译错误清晰

### 4. 类型安全
- ✅ `import type` 明确意图
- ✅ 编译时检查
- ✅ 智能提示

## 总结

**所有能力文件导入已修复！**

- ✅ 类型从 types 目录导入
- ✅ 实现从 composable 目录导入
- ✅ 移除泛型参数
- ✅ 添加能力名称
- ✅ 防止循环引用
- ✅ 清晰的依赖关系

**最佳实践：类型定义永远放在 types 目录！**
