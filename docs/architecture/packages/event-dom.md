# @qimenjs/event-dom

**层级**: 第 2 层  
**状态**: ✅ 完成  
**测试**: ✅ 通过  
**覆盖率**: 100%

## 概述

DOM 事件处理包，提供高级手势事件识别和处理功能。

## 功能

- **DomEventAdapter** - DOM 事件适配器，将原生事件转换为手势事件
- **手势处理器** - Tap、Swipe、Drag、LongPress、DoubleTap 等处理器
- **事件映射** - 支持鼠标、触摸、指针、键盘等多种输入类型
- **设备能力检测** - 自动检测设备能力并选择最优事件类型

## 手势类型

- `tap` - 点击
- `doubletap` - 双击
- `longpress` - 长按
- `swipe` - 滑动
- `drag` - 拖拽
- `hover` - 悬停
- `contextmenu` - 右键菜单
- `submit` - 提交（回车键）

## 依赖

- `@qimenjs/events` - 事件总线
- `@qimenjs/logger` - 日志记录
- `@qimenjs/utils` - 工具函数
- `@qimenjs/runtime` - 运行时环境检测
- `@qimenjs/error` - 错误处理

## 使用示例

```typescript
import { createEventAdapter } from '@qimenjs/event-dom';

const adapter = createEventAdapter();
const element = document.getElementById('my-button');

// 绑定点击事件
const unbind = adapter.bind(element, 'tap', scope, {
    threshold: 10,
    timeout: 300
});

// 解绑事件
unbind();
```

## API

```typescript
// 创建事件适配器
function createEventAdapter(): IEventAdapter;

// 事件适配器接口
interface IEventAdapter<TTarget = any> {
    bind(
        target: TTarget,
        semantic: GestureSemantic,
        scope: IEventScope,
        options?: BindOptions,
        source?: any
    ): void;
}

// 绑定选项
interface BindOptions {
    preventDefault?: boolean;
    stopPropagation?: boolean;
    capture?: boolean;
    once?: boolean;
    threshold?: number;
    disableFallback?: boolean;
}
```

## 测试状态

- ✅ 16 个测试套件全部通过
- ✅ 145 个测试全部通过
- ✅ 代码覆盖率 100%

## 变更历史

### 2026-06-26
- 修正所有模块引用，使用 `@/` 代替 `@qimenjs/`
- 修正类型导出路径
- 更新错误类引用，使用 error 包中的 GestureError
- 所有测试通过

### 初始版本
- 实现 DOM 事件适配器
- 实现各种手势处理器
- 支持多种输入设备
