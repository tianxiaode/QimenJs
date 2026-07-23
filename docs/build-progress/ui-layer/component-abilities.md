# @qimenjs/component-abilities

**层级**: UI 层  
**状态**: ⚠️ 开发中  
**测试**: ✅  
**覆盖率**: ~80%

## 构建历史


### 2026-07-18
- ✅ 溢出处理从 Ability 模式迁移到域配置驱动模式
- ✅ 删除 OverflowScrollAbility / OverflowMenuAbility / ExpandArrowAbility
- ✅ 新增域配置键：tooltip / overflowConfig / submenu / contextMenu（body-keys.ts）
- ✅ 新增域配置类型：OverflowConfigDecl / SubmenuDecl / ContextMenuDecl（layout-types.ts）
- ✅ InitAbility 新增 _initDomainOverlays 统一调度域浮层初始化
- ✅ 溢出浮层组件：OverflowScrollComponent（浮动箭头 + 拖拽滚动 + 便捷方法 + 钩子）
- ✅ 溢出浮层组件：OverflowMenuComponent（浮动触发按钮 + 菜单管理）
- ✅ 模板编译器 handler: true 自动推导改为 on{NodeName}{Event}（如 onPrevIconClick）
- ✅ ItemGroupComponent 改用 overflowConfig 域配置，模板精简
- ✅ MenuItemComponent 改用 submenu 域配置，移除 ExpandArrowAbility
- ✅ PanelComponent 展开箭头改为内联管理，移除 ExpandArrowAbility
- ✅ 8个实体能力文件合并为单一 EntityAbility + validateEntityEvent 校验
- ✅ EntityDispatchCenter 改用独立 EventBus 实例（非 globalEventBus scope）
- ✅ body.bridges → body.listens，DomEventDecl.entities 改为 string（直接指定 mgr 方法名）

### 2026-07-13
- ✅ 新增 GroupSelectAbility（radio 互斥/checkbox 多选）
- ✅ 新增 MenuItemManageAbility（池化复用菜单项）
- ✅ OverlayHostAbility 改为从 component-core 重导出

### 2026-07-12
- ✅ 新增 ChildSlotAbility 子组件插槽替换能力
- ✅ 新增 FloatingLayerAbility 浮层通用能力
- ✅ 新增 TemplateCacheAbility 模板缓存与快速克隆
- ✅ 新增 ArrowAbility 箭头能力
- ✅ 新增 TooltipOverlayAbility/OverlayMaskAbility 浮层能力

## 域配置驱动模式

### 设计思路

将溢出、tooltip、子菜单等从独立 Ability 类迁移到组件 body 的域配置键，一个配置项对接一个浮动层类型：

```ts
// 组件 body 声明
{
    tooltip: { text: '提示' },           // → 自动对接 tooltip 浮动层
    overflowConfig: { type: 'menu' },    // → 自动对接溢出浮动层
    submenu: { type: 'Menu' },           // → 自动对接子菜单浮动层
    contextMenu: { type: 'Menu' },       // → 自动对接右键菜单浮动层
}
```

### 域配置键（DOMAIN_OVERLAY_KEYS）

| 键 | 配置类型 | 默认浮层类型 | 说明 |
|---|---|---|---|
| tooltip | TooltipProps | Tips | 提示框 |
| overflowConfig | OverflowConfigDecl | OverflowScroll/OverflowMenu | 溢出处理 |
| submenu | SubmenuDecl | Menu | 子菜单 |
| contextMenu | ContextMenuDecl | Menu | 右键菜单 |

### 模板 handler 自动推导

`handler: true` 自动生成 `on{NodeName}{Event}` 格式的 handler 名：

```ts
// 模板声明
{ name: 'prevIcon', events: { click: { handler: true } } }
// 自动推导 → onPrevIconClick

// body 中直接写方法
onPrevIconClick(): void { this.scrollByStep('prev'); }
```

前后钩子自然推导：`beforePrevIconClick` / `afterPrevIconClick`

## 测试状态

### 通过的测试
- ✅ GroupSelectAbility - 分组选择
- ✅ MenuItemManageAbility - 菜单项管理
- ✅ ChildSlotAbility - 插槽替换

## 遗留工作

### 中优先级
- [ ] 补充 FloatingLayerAbility 测试
- [ ] 补充 TemplateCacheAbility 测试
- [ ] 补充 OverflowScrollComponent 测试
- [ ] 补充 OverflowMenuComponent 测试

## 使用统计

### 依赖的包
- @qimenjs/composable (L1)
- @qimenjs/component-core (UI)

### 被以下包使用
- @qimenjs/component (UI)
