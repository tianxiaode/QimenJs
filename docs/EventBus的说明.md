# 组件事件与副作用设计约定

## 1. EventScope

- 每个组件必须在构造阶段创建自己的 EventScope
- 所有副作用（DOM 监听、订阅、定时器）必须注册到 scope
- 组件销毁时必须调用 scope.dispose()

## 2. bind* vs bridge*

### bind*
- 用于组件**内部行为**
- 不进入 EventBus
- 直接执行回调
- 例：click outside、hover、keydown

### bridge*
- 用于组件**对外语义行为**
- 将 DOM 事件转为组件事件
- 通过 scope.emit 对外发布
- 例：submit、toggle、close

## 3. 判断标准

如果一个 DOM 行为变化需要通知组件使用者 → bridge  
否则 → bind

## 组件事件规范

- 组件构造函数内必须创建 EventScope
- 组件内部行为使用 bindXxx
- 对外行为使用 bridgeInputToBus
- 不允许组件直接 emit DOM Event