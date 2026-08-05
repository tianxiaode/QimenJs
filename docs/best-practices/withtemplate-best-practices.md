# 组件定义最佳实践

> 所有组件直接 `extends Component` + `useTemplate(tpl)`，类定义后编译模板。

## 核心模式

```typescript
import { Component } from '@qimenjs/component-core';
import type { TplNode } from '@qimenjs/component-core';

const BUTTON_TPL: TplNode = {
    tag: 'button',
    name: 'root',
    cls: 'q-btn',
    children: [
        { name: 'icon', tag: 'i', cls: 'q-btn__icon', hidden: true },
        { name: 'label', tag: 'span', cls: 'q-btn__label' },
    ],
};

class ButtonComponent extends Component {
    type = 'Button';

    onAfterInit(props?: ButtonProps): void {
        this.update(props);
    }

    update(props?: Partial<ButtonProps>): void {
        if (props?.icon !== undefined) this.icon = props.icon;
        if (props?.label !== undefined) this.label = props.label;
    }
}
ButtonComponent.useTemplate(BUTTON_TPL);
```

**要点**：
- `class XxxComponent extends Component` — 具名类
- `type = 'Xxx'` — 组件类型标识
- `useTemplate(tpl)` — 注册模板并触发预编译
- 方法直接写在 class 里，无需 body 对象

## 模板定义（TplNode）

```typescript
interface TplNode {
    tag?: string;           // DOM 标签名
    name?: string;          // 节点名（用于 nodeMap 访问）
    cls?: string;           // CSS 类名
    type?: string;          // 子组件类型（编译为骨架占位）
    children?: TplNode[];   // 子节点
    hidden?: boolean;       // 初始隐藏
    i18n?: string;          // i18n 翻译 key
    permission?: string | true;  // 权限控制
    badge?: string;         // 徽标声明
    // ... 更多字段见 tpl-node-types.ts
}
```

### tag 节点 vs type 节点

| 类型 | 编译产物 | 运行时 |
|------|---------|--------|
| **tag 节点** | 真实 HTML | 直接渲染，contentMode 自动推导 |
| **type 节点** | `<div class="q-skeleton"></div>` | 运行时实例化子组件替换占位符 |

### contentMode 自动推导

编译时根据 tag 推导内容操作模式：

| tag | contentMode | 操作 API |
|-----|-------------|---------|
| `img`, `video`, `audio`, `source` | `src` | `el.src = value` |
| `a` | `link` | `el.href = value` |
| 其他 | `value` | `el.textContent = value` |

## 组件 body

`useTemplate` 支持传入 `ComponentTemplate`（含 body）：

```typescript
const TEMPLATE: ComponentTemplate = {
    tpl: { tag: 'div', name: 'root', children: [...] },
    body: {
        // 静态类属性
        type: 'MyComponent',
        entityKey: 'user',
        eventKey: 'user-form',

        // 方法（挂到原型）
        onAfterInit(props) { this.loadData(); },
        onBtnClick(event) { this.submit(); },

        // getter/setter（defineProperty 到原型）
        label: {
            get() { return this._label; },
            set(v) { this._label = v; },
        },
    },
};

class MyComponent extends Component {}
MyComponent.useTemplate(TEMPLATE);
```

## 事件处理

### domEvents — DOM 事件委托

```typescript
// 三层嵌套：DOM事件 → 组件路径 → action
static domEvents = {
    click: {
        closeBtn: { submit: { handler: true } },  // → onCloseBtnSubmitClick
    },
    input: {
        root: { handler: '_onInput' },  // 自定义 handler 名
    },
};
```

**handler 默认命名**：`on${PascalCase(path)}${PascalCase(action)}${PascalCase(event)}`

### listens — 统一事件订阅

```typescript
static listens = {
    // 监听子组件事件
    toolbar: { click: { handler: 'onToolbarClick' } },

    // 监听实体事件
    entity: { listed: { handler: 'onEntityListed' } },

    // 监听系统事件
    system: { 'permission:change': { handler: 'onPermissionChange' } },
};
```

### childEvents — 子组件事件

```typescript
static childEvents = {
    grid: { rowClick: 'onGridRowClick' },
};
```

## 组件间通信

| 机制 | 使用方式 | 场景 |
|------|---------|------|
| **$ 前缀访问器** | `this.$icon` → `nodeMap.icon.component` | 父访问子组件实例 |
| **ComponentEventBus** | `this.componentEmit('save', data)` / `this.componentOn(source, 'save', handler)` | 跨组件层事件通信 |
| **eventKey 传播** | 子组件自动继承父组件的 eventKey | 同一事件通道 |
| **entityKey 传播** | 子组件自动继承父组件的 entityKey | 同一实体通道 |

## 模板派生

### 只改方法，模板不变

```typescript
class DropdownButton extends ButtonComponent {
    type = 'Dropdown';
    onAfterInit(props) { super.onAfterInit(props); this._initDropdown(); }
}
// 无需 useTemplate，继承父类编译产物
```

### 改模板 + 改方法

```typescript
class CustomButton extends Component {
    type = 'CustomButton';
    static tpl = {
        tag: 'button', name: 'root', cls: 'q-custom-btn',
        children: [
            { name: 'icon', tag: 'i', cls: 'q-custom-btn__icon' },
            { name: 'label', tag: 'span', cls: 'q-custom-btn__label' },
            { name: 'badge', tag: 'span', cls: 'q-custom-btn__badge' },
        ],
    };
    onAfterInit(props) { /* ... */ }
}
CustomButton.useTemplate(CustomButton.tpl);
```

## 反模式

| 反模式 | 正确做法 |
|--------|---------|
| `addEventListener` | `this.bind()` |
| 用 class 定义 Ability | 用纯对象定义 Ability |
| 闭包变量存储状态 | `abilityState()` |
| 手动管理清理 | `onCleanup()` |
| 裸实例化 Component | `extends Component` + `useTemplate` |
| 忘记 `static` 关键字 | 类级别配置必须用 `static` |

## 参见

- [组件编译引擎与模板系统](../architecture/compile-engine-and-template.md)
- [事件系统](../architecture/event-system.md)
- [ComposableBase 最佳实践](./composable-best-practices.md)
