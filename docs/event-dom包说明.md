# @orbitjs/event-dom

## 概述

`@orbitjs/event-dom` 是 OrbitJS 的 DOM 事件处理包，提供高级的 DOM 事件绑定、手势识别和事件转换功能。该包依赖于核心事件系统 `@orbitjs/event`，专注于浏览器环境的事件处理。

## 架构定位

### 与核心事件系统的关系

```
@orbitjs/event (核心事件系统)
    ↓ 依赖
@orbitjs/event-dom (DOM事件处理)
```

- **@orbitjs/event**: 环境无关的核心事件系统，可在 Node.js 和浏览器中使用
- **@orbitjs/event-dom**: 浏览器专用的事件处理层，提供 DOM 事件适配和手势识别

### 职责边界

**✅ event-dom 负责：**
- DOM 元素事件绑定
- 原生 DOM 事件到语义化事件的转换
- 手势识别（tap, swipe, drag, long-press 等）
- 事件映射和解析
- 设备能力检测和适配

**❌ event-dom 不负责：**
- 事件总线的核心逻辑（由 @orbitjs/event 提供）
- 非 DOM 环境的事件处理
- 业务逻辑相关的事件处理

## 目录结构

```
src/event-dom/
├── index.ts                      # 主入口文件
└── adapters/                     # 适配器目录
    ├── index.ts                  # 适配器导出
    ├── createEventAdapter.ts     # 事件适配器工厂函数
    ├── dom/                      # DOM事件适配器
    │   ├── index.ts
    │   └── DomEventAdapter.ts    # DOM事件适配器核心类
    ├── processors/               # 手势处理器
    │   ├── index.ts
    │   ├── factory.ts            # 处理器工厂
    │   ├── GestureProcessor.ts   # 基础处理器
    │   ├── TapProcessor.ts       # 点击处理器
    │   ├── DoubleTapProcessor.ts # 双击处理器
    │   ├── LongPressProcessor.ts # 长按处理器
    │   ├── SwipeProcessor.ts     # 滑动处理器
    │   ├── DragProcessor.ts      # 拖拽处理器
    │   ├── HoverProcessor.ts     # 悬停处理器
    │   ├── ContextMenuProcessor.ts # 右键菜单处理器
    │   └── SubmitProcessor.ts    # 提交处理器
    ├── semantic-map/             # 语义映射
    │   ├── index.ts
    │   ├── base.ts               # 基础事件映射
    │   ├── gesture.ts            # 手势事件映射
    │   ├── pointer.ts            # 指针事件映射
    │   ├── touch.ts              # 触摸事件映射
    │   ├── mouse.ts              # 鼠标事件映射
    │   ├── keyboard.ts           # 键盘事件映射
    │   └── resolve.ts            # 映射解析器
    └── utils/                    # 工具函数
        ├── index.ts
        └── validation.ts         # 验证工具
```

## 核心功能

### 1. 事件适配器创建

```typescript
import { createEventAdapter } from '@orbitjs/event-dom';

// 创建事件适配器
const adapter = createEventAdapter();

// 绑定语义化事件
adapter.bind(element, 'tap', (event) => {
    console.log('Tapped!', event);
});

adapter.bind(element, 'swipe', (event) => {
    console.log('Swiped!', event.direction, event.distance);
});
```

### 2. 支持的手势事件

| 手势 | 说明 | 事件数据 |
|------|------|----------|
| `tap` | 单击 | 位置、时间戳 |
| `double-tap` | 双击 | 位置、时间间隔 |
| `long-press` | 长按 | 位置、持续时间 |
| `swipe` | 滑动 | 方向、距离、速度 |
| `drag` | 拖拽 | 起始位置、当前位置、移动距离 |
| `hover` | 悬停 | 位置、进入/离开状态 |
| `context-menu` | 右键菜单 | 位置 |
| `submit` | 提交 | 表单数据 |

### 3. 事件映射系统

事件映射系统将原生 DOM 事件转换为语义化事件：

```
原生事件                语义化事件
mousedown/touchstart  → press
mousemove/touchmove   → move
mouseup/touchend      → release
touchcancel           → cancel
wheel                 → wheel
keydown               → keydown
keyup                 → keyup
```

### 4. 设备能力适配

自动检测设备能力并选择最优事件类型：

```typescript
// 自动适配
- 指针设备 → pointer events
- 触摸设备 → touch events
- 鼠标设备 → mouse events
- 键盘设备 → keyboard events
```

## 依赖关系

```json
{
  "dependencies": {
    "@orbitjs/event": "workspace:*",
    "@orbitjs/runtime-env": "workspace:*",
    "@orbitjs/logger": "workspace:*",
    "@orbitjs/utils": "workspace:*"
  }
}
```

### 依赖说明

- **@orbitjs/event**: 提供核心事件类型定义（IEventAdapter, GestureSemantic 等）
- **@orbitjs/runtime-env**: 提供运行环境检测（isBrowser, detectInputCapabilities）
- **@orbitjs/logger**: 提供日志记录功能
- **@orbitjs/utils**: 提供工具函数（字符串、几何计算等）

## 使用示例

### 基础使用

```typescript
import { createEventAdapter } from '@orbitjs/event-dom';

const adapter = createEventAdapter();
const element = document.getElementById('my-button');

// 绑定点击事件
const unbind = adapter.bind(element, 'tap', (event) => {
    console.log('Button tapped!', event);
});

// 解绑事件
unbind();
```

### 手势识别

```typescript
import { createEventAdapter } from '@orbitjs/event-dom';

const adapter = createEventAdapter();
const element = document.getElementById('gesture-area');

// 滑动识别
adapter.bind(element, 'swipe', (event) => {
    console.log('Swipe direction:', event.direction); // 'left', 'right', 'up', 'down'
    console.log('Swipe distance:', event.distance);
    console.log('Swipe velocity:', event.velocity);
});

// 拖拽识别
adapter.bind(element, 'drag', (event) => {
    console.log('Drag from:', event.startPos, 'to:', event.currentPos);
    console.log('Drag distance:', event.distance);
});

// 长按识别
adapter.bind(element, 'long-press', (event) => {
    console.log('Long pressed at:', event.position);
    console.log('Duration:', event.duration);
});
```

### 多手势组合

```typescript
import { createEventAdapter } from '@orbitjs/event-dom';

const adapter = createEventAdapter();
const element = document.getElementById('interactive-area');

// 单击
adapter.bind(element, 'tap', handleTap);

// 双击
adapter.bind(element, 'double-tap', handleDoubleTap);

// 长按
adapter.bind(element, 'long-press', handleLongPress);

// 滑动
adapter.bind(element, 'swipe', handleSwipe);
```

## 设计原则

### 1. 环境隔离

- 核心事件逻辑在 `@orbitjs/event` 中，环境无关
- DOM 特定逻辑在 `@orbitjs/event-dom` 中，仅浏览器可用

### 2. 语义化事件

- 将底层 DOM 事件转换为高级语义化事件
- 开发者无需关心 touch/mouse/pointer 的差异
- 统一的事件接口，简化开发

### 3. 性能优化

- 按需创建处理器
- 事件委托支持
- 自动清理机制

### 4. 可扩展性

- 支持自定义手势处理器
- 支持自定义事件映射
- 灵活的配置选项

## 与其他包的对比

| 特性 | @orbitjs/event | @orbitjs/event-dom |
|------|----------------|-------------------|
| 环境支持 | Node.js + 浏览器 | 仅浏览器 |
| 核心功能 | 事件总线、作用域 | DOM事件适配、手势识别 |
| 依赖 | 无环境依赖 | 依赖 DOM API |
| 使用场景 | 通用事件通信 | UI 交互处理 |

## 迁移指南

### 从旧版本迁移

如果你之前使用的是 `src/events/adapters` 中的代码：

```typescript
// 旧版本
import { createEventAdapter } from '@/events/adapters';

// 新版本
import { createEventAdapter } from '@orbitjs/event-dom';
```

### 从 kernel/events 迁移

```typescript
// 旧版本
import { DomEventAdapter } from '@/kernel/events/adapters/dom';

// 新版本
import { DomEventAdapter } from '@orbitjs/event-dom';
```

## 测试

测试文件位于 `test/unit/kernel/events/adapters/` 目录，包含：

- DomEventAdapter 测试
- 各手势处理器测试
- 语义映射测试
- 验证工具测试

## 未来规划

1. **更多手势支持**: 添加 pinch、rotate 等多点触控手势
2. **性能优化**: 优化事件处理性能，减少内存占用
3. **TypeScript 增强**: 提供更完善的类型定义
4. **文档完善**: 添加更多使用示例和最佳实践

## 相关文档

- [事件系统架构说明](./架构说明.md)
- [EventBus说明](./EventBus的说明.md)
- [事件适配器说明](./事件适配器相关说明.md)
