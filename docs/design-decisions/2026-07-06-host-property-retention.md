# ComposableBase.host 属性移除决策

## 背景

`ComposableBase.host` 是一个 getter 属性，返回 `this` 自身。在生产代码中完全没有被使用，仅在单元测试中被访问。

## 决策

**移除 `host` 属性。**

## 原因

### 1. 原型复制模式下无语义价值

在当前原型复制架构（`createForgedClass` + `copyPrototypeMethods`）下，能力方法中的 `this` 直接指向宿主实例，不存在"能力自身"与"宿主"的区分。`this.host === this` 恒成立，`host` 没有提供任何额外信息。

### 2. 生产代码零使用

全局搜索 `src/` 目录，`this.host` 无任何实际使用。所有能力方法直接使用 `this` 访问宿主。

### 3. 减少原型污染

每移除一个内置属性，`BUILTIN_KEYS` 保护列表就少一项，原型也更精简。

## 变更

- `src/composable/forge.ts` — 移除 host getter 定义和 BUILTIN_KEYS 中的 'host'
- `src/composable/types/composable.ts` — 移除 IComposableBase 中的 `readonly host: any`

## 历史

- 2026-07-06：初始决策为保留 host 属性（见下方历史原因）
- 2026-07-22：重新评估后决定移除。原因：原型复制模式下 this 即宿主，host 无语义价值；生产代码零使用
