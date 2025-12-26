# event-dom

`event-dom` 是一套 **组件级事件与输入抽象工具**，用于解决以下问题：

- 组件内部 DOM 事件如何安全绑定与释放
- 组件对外如何暴露“行为语义”，而不是 DOM 细节
- 如何为未来的多平台（Web / Mobile / 小程序）预留扩展空间
- 如何统一管理事件生命周期，避免泄漏

---

## 核心设计原则

### 1. 组件作者只关心「语义行为」

组件不应该对外暴露：

- `click`
- `mouseenter`
- `keydown`

而应该暴露：

- `press`
- `hover`
- `focus`
- `outside`

这些被称为 **InputType（输入语义）**。

---

### 2. 组件必须有自己的事件作用域（EventScope）

**每个组件实例都必须创建一个 `EventScope`**，用于管理：

- DOM 事件监听
- EventBus 订阅
- cleanup / dispose

```ts
class MyComponent {
  private scope = createEventScope();

  dispose() {
    this.scope.dispose();
  }
}
