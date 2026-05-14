# orbitjs

OrbitJS 是一个现代化的 JavaScript 生态系统，提供稳定、可靠、跨平台的核心工具和组件，让前端开发像轨道运行一样可预测和有序。

## 核心包

### @orbitjs/event
核心事件系统，提供事件总线、事件作用域管理等功能。环境无关，可在 Node.js 和浏览器中使用。

```typescript
import { EventBus, EventScope, globalEventBus } from '@orbitjs/event';

const bus = new EventBus();
bus.on('user:login', (event) => {
    console.log('User logged in:', event.data);
});
bus.emit('user:login', { userId: '123' });
```

### @orbitjs/event-dom
DOM 事件处理包，提供 DOM 事件适配、手势识别、事件转换等功能。仅浏览器环境可用。

```typescript
import { createEventAdapter } from '@orbitjs/event-dom';

const adapter = createEventAdapter();
adapter.bind(element, 'tap', (event) => {
    console.log('Tapped!', event);
});
adapter.bind(element, 'swipe', (event) => {
    console.log('Swiped!', event.direction);
});
```

## 架构特点

- **模块化设计**: 每个包职责清晰，依赖关系明确
- **环境适配**: 核心包环境无关，特定功能包环境专用
- **类型安全**: 完整的 TypeScript 类型定义
- **高性能**: 优化的实现，最小化运行时开销

## 文档

- [架构说明](./docs/架构说明.md)
- [event-dom包说明](./docs/event-dom包说明.md)
- [EventBus说明](./docs/EventBus的说明.md)

