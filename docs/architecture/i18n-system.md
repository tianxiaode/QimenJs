# i18n 国际化系统

> QimenJS 的 i18n 系统采用**零依赖**设计，运行时通过外部 IIFE 脚本加载，挂载到 `window.__qimen_i18n__`。支持模板节点自动翻译、错误码多语言查找、系统总线语言切换通知。

## 概述

i18n 系统的核心设计：

- **零依赖**：不依赖任何第三方 i18n 库，运行时通过 `<script>` 加载 `i18n.iife.js`
- **声明式**：模板节点声明 `i18n` 字段，编译时自动收集，运行时自动翻译
- **错误码翻译**：`t(key, true)` 自动从 kernel/validation/http 三个命名空间查找
- **配置值翻译**：`resolveI18nValue('i18n:btn.save')` 自动去掉 `i18n:` 前缀后翻译

## 使用方式

### 直接翻译

```typescript
// 通过全局对象
const i18n = window.__qimen_i18n__;
i18n.t('common.save');                    // → '保存'
i18n.t('greeting', { name: 'World' });    // → '你好, World'

// 通过工具函数
import { t, resolveI18nValue } from '@qimenjs/i18n';
t('error.network.timeout');               // → '网络超时'
```

### 模板节点自动翻译

在 TplNode 中声明 `i18n` 字段：

```typescript
const TPL: TplNode = {
    tag: 'button',
    name: 'root',
    i18n: 'common.save',  // 自动翻译为当前语言的文本
};
```

编译时，声明了 `i18n` 的节点被收集到 `i18nNodes` 数组；运行时，组件初始化时自动将翻译结果写入 DOM。

### 配置值翻译

Schema 字段 label 等配置值支持 `i18n:` 前缀：

```typescript
const schema = {
    name: { label: 'i18n:field.name' },  // 自动翻译
    email: { label: 'i18n:field.email' },
};

// resolveI18nValue 内部逻辑
resolveI18nValue('i18n:btn.save');  // → t('btn.save') → '保存'
resolveI18nValue('普通文本');        // → '普通文本'（无 i18n: 前缀，原样返回）
```

## 系统总线与语言切换

### 语言切换通知

i18n IIFE 内部处理语言切换，通过 `SystemEventBus` 广播 `i18n:change` 事件：

```
i18n.setLocale('en')
  → SystemEventBus.emit('i18n:change', { locale: 'en' })
  → 组件监听 → 重新翻译 i18nNodes → 更新 DOM
```

### 懒桥接

`SystemEventBus` 对 i18n 事件采用**懒桥接**策略：

- 有组件订阅 `i18n:*` 事件时，才注册 i18n IIFE 的 locale 变更回调
- 无订阅时不注册，减少不必要的开销
- 拒绝外部 emit `i18n:` 前缀事件，确保事件源唯一

### 组件自动刷新

组件通过 `LifecycleAbility` 的 `onLocaleChange` 钩子响应语言切换：

```typescript
class MyComponent extends Component {
    onLocaleChange() {
        // 重新渲染需要翻译的内容
        this.refreshI18nNodes();
    }
}
```

编译时收集的 `i18nNodes` 会在语言切换时自动重新翻译并更新 DOM。

## 错误信息的 i18n 翻译

### t(key, isError) 函数

`isError=true` 时，自动从三个错误命名空间查找翻译：

```typescript
t('ENTITY_NOT_FOUND', true);
// 查找顺序：
// 1. kernel.ENTITY_NOT_FOUND  → '未找到指定的实体'
// 2. validation.ENTITY_NOT_FOUND
// 3. http.ENTITY_NOT_FOUND
// 找到第一个非空翻译即返回
```

### 错误处理与 i18n 联动

```
Entity 请求失败
  → KernelError { code: 'ENTITY_NOT_FOUND', context: { entityKey: 'user' } }
  → ComponentEntityDispatch → onEntityError(ctx, domain)
  → defaultEntityErrorHandler(ctx, domain)
  → t(ctx.error.code, true)  // 自动翻译错误码
  → showToast('未找到指定的实体')
```

### KernelErrorCode 分类

| 分类 | 错误码示例 |
|------|-----------|
| 实体操作 | ENTITY_OPERATION_IN_PROGRESS, ENTITY_FETCH_FAILED, ENTITY_NOT_FOUND, ENTITY_PERMISSION_DENIED |
| 分页 | INVALID_PAGE_SIZE |
| 组合 | COMPOSABLE_NOT_FOUND, CIRCULAR_DEPENDENCY |
| Schema | SCHEMA_NOT_FOUND, SCHEMA_REGISTRATION_FAILED |
| 组件 | COMPONENT_TPL_KEY_NOT_FOUND, COMPONENT_BODY_INVALID_FIELD, COMPONENT_INIT_FAILED |
| 文件 | FILE_SIZE_EXCEEDED, FILE_HASH_FAILED, FILE_UPLOAD_FAILED, FILE_TYPE_MISMATCH |
| 初始化 | COMPILE_PRODUCT_NOT_FOUND, NODE_MAP_BUILD_FAILED, PHASE_EXECUTION_FAILED |

## 参见

- [事件系统](./event-system.md)
- [实体管理与权限系统](./entity-and-permission.md)
- [验证管道与 Schema](./validation-pipeline.md)