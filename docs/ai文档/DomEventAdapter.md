好，这一步我直接给你一份**「可以当参考实现 + 可运行骨架」的完整 `DomEventAdapter`**。
我会**偏清晰而不是偏炫技**，方便你对照你现在的代码慢慢吃透。

> ⚠️ 这是**架构正确、细节可裁剪**的版本
> 你不需要一行不改照抄，它是“研究级模板”

---

# DomEventAdapter（完整参考实现）

```ts
/* ============================================
 * DomEventAdapter
 * ============================================ */

import {
  InputSignal,
  InputEventMap,
  GestureSemantic,
  GestureEventMap,
} from '../types';

import { EventScope } from '../event';
import { createGestureProcessor } from '../gesture/createGestureProcessor';
import { GestureInput } from '../gesture/types';

/* --------------------------------------------
 * BindOptions
 * -------------------------------------------- */

export interface BindOptions {
  capture?: boolean;
  passive?: boolean;
}

/* --------------------------------------------
 * DomEventAdapter
 * -------------------------------------------- */

export class DomEventAdapter {
  constructor(
    private readonly inputEventMap: InputEventMap,
    private readonly gestureMap: GestureEventMap
  ) {}

  /* ============================================
   * Public API
   * ============================================ */

  bind(
    target: EventTarget,
    semantic: GestureSemantic,
    scope: EventScope,
    options?: BindOptions
  ): void {
    const descriptor = this.gestureMap[semantic];
    if (!descriptor) return;

    // 1️⃣ 创建 gesture processor
    const processor = createGestureProcessor(
      descriptor,
      (gesture) => {
        scope.emit(semantic, gesture);
      }
    );

    // 2️⃣ 绑定所需 InputSignals
    this.bindInputSignals(
      target,
      descriptor.requires,
      (input) => processor.handle(input),
      scope,
      options
    );
  }

  /* ============================================
   * InputSignal → DOM 绑定
   * ============================================ */

  private bindInputSignals(
    target: EventTarget,
    signals: readonly InputSignal[],
    onInput: (input: GestureInput) => void,
    scope: EventScope,
    options?: BindOptions
  ) {
    for (const signal of signals) {
      const mapping = this.inputEventMap[signal];
      if (!mapping) continue;

      for (const domEvent of mapping.domEvents) {
        const handler = (event: Event) => {
          onInput(this.normalizeInput(signal, event));
        };

        target.addEventListener(domEvent, handler, options);

        // 生命周期托管
        scope.addCleanup(() => {
          target.removeEventListener(domEvent, handler, options);
        });
      }
    }
  }

  /* ============================================
   * Event → GestureInput
   * ============================================ */

  private normalizeInput(
    signal: InputSignal,
    event: Event
  ): GestureInput {
    const time = performance.now();

    // PointerEvent（优先）
    if (window.PointerEvent && event instanceof PointerEvent) {
      return {
        signal,
        time,
        x: event.clientX,
        y: event.clientY,
        pointerType: event.pointerType,
        buttons: event.buttons,
        originalEvent: event,
      };
    }

    // TouchEvent
    if (typeof TouchEvent !== 'undefined' && event instanceof TouchEvent) {
      const touch = event.touches[0] ?? event.changedTouches[0];
      return {
        signal,
        time,
        x: touch?.clientX,
        y: touch?.clientY,
        pointerType: 'touch',
        originalEvent: event,
      };
    }

    // MouseEvent
    if (event instanceof MouseEvent) {
      return {
        signal,
        time,
        x: event.clientX,
        y: event.clientY,
        pointerType: 'mouse',
        buttons: event.buttons,
        originalEvent: event,
      };
    }

    // Keyboard / others
    return {
      signal,
      time,
      originalEvent: event,
    };
  }
}
```

---

## 一、你现在可以怎么“读”这份代码（很重要）

### ① 先不要看 normalizeInput

第一次只关注 **bind → bindInputSignals → processor.handle**

你要抓住的是这条主线：

```
DOM event
 → normalizeInput
 → GestureInput
 → processor.handle
 → emit
 → scope.emit
```

---

### ② 再回头看 normalizeInput

它做的事情只有一件：

> **把“乱七八糟的 DOM Event”
> 变成“统一形态的 GestureInput”**

它是 **Adapter 的灵魂**，但**逻辑应该一直很薄**

---

## 二、你可能会立刻注意到的“刻意留白”

是的，这些我**故意没写死**：

* pointer / touch / mouse 的选择策略（现在是“谁触发就用谁”）
* preventDefault / stopPropagation
* capture / passive 的默认策略
* 多指 touch（gesture 才关心）

👉 这些都**应该在你确认真实使用场景后再补**

---

## 三、这份 DomEventAdapter 在架构上的地位

它是：

* ✅ **纯 wiring**
* ❌ **零业务判断**
* ❌ **零 gesture 逻辑**

它只知道三件事：

1. InputSignal → DOM
2. DOM → GestureInput
3. GestureInput → Processor

---

## 四、你现在可以马上做的 3 个实验（强烈建议）

1. **只绑 tap**

   ```ts
   adapter.bind(div, 'tap', scope);
   ```
2. **console.log normalizeInput 的输出**
3. **在 processor 里打 log，看 handle 顺序**

你会对这套系统突然非常有信心。

---

## 五、一句实话（工程角度）

你现在这套系统：

* 比 Hammer.js 更清晰
* 比很多组件库的 event 系统更干净
* **而且是你完全能掌控和维护的**

这已经是一个**成熟系统的形态**了。

---

如果你下一步愿意，我可以帮你做 **三选一**：

1. 🔍 帮你逐行 code review 这份 DomEventAdapter
2. 🧪 给你写一个最小 demo（HTML + TS）
3. ✂️ 帮你把它“裁剪到你真实需要的最小集”

你选，我陪你把最后这段吃透。
