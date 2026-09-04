# @qimenjs/icon

**层级**: 第 1 层  
**状态**: ✅ 完成  
**依赖**: 无（纯 CSS + 字体资源）

## 概述

中国风图标库，管理后台专用。参考 FontAwesome 设计规范，提供 102 个图标，覆盖通用操作、导航、状态提示、文件文档、用户管理、日期时间、通讯消息、数据图表、电商财务和中国风特色共 10 个分类。

## 使用方式

### 引入 CSS

```html
<link rel="stylesheet" href="q-icon.css">
```

### 基础用法

```html
<i class="q-icon-save"></i>
<i class="q-icon-search q-icon--lg"></i>
<i class="q-icon-dragon q-icon--2x q-icon--spin"></i>
```

### 图标尺寸

| 类名 | 效果 |
|------|------|
| `q-icon--xs` | 0.75em |
| `q-icon--sm` | 0.875em |
| `q-icon--lg` | 1.33333em |
| `q-icon--2x` ~ `q-icon--5x` | 2em ~ 5em |

### 修饰类

| 类名 | 效果 |
|------|------|
| `q-icon--fw` | 固定宽度（1.25em），适合列表对齐 |
| `q-icon--border` | 添加边框 |
| `q-icon--circle` | 圆形边框 |
| `q-icon--spin` | 旋转动画（2s 线性循环） |
| `q-icon--pulse` | 脉冲动画（1s 步进循环） |
| `q-icon--rotate-90/180/270` | 旋转 |
| `q-icon--flip-h` / `q-icon--flip-v` | 水平/垂直翻转 |
| `q-icon--pull-left` / `q-icon--pull-right` | 浮动对齐 |

## 图标列表

### 通用操作 (E900-E90F)

| 图标 | 类名 | 寓意 |
|------|------|------|
| 保存 | `q-icon-save` | 玉玺 |
| 刷新 | `q-icon-refresh` | 太极循环 |
| 编辑 | `q-icon-edit` | 毛笔 |
| 删除 | `q-icon-delete` | 断笔/撕纸 |
| 添加 | `q-icon-add` | 加盖印章 |
| 复制 | `q-icon-copy` | 双联印章 |
| 粘贴 | `q-icon-paste` | 裱画 |
| 剪切 | `q-icon-cut` | 剪刀 |
| 撤销 | `q-icon-undo` | 回字纹 |
| 重做 | `q-icon-redo` | 旋纹 |
| 关闭 | `q-icon-close` | 合卷 |
| 确认 | `q-icon-check` | 朱批 |
| 打印 | `q-icon-print` | 雕版 |
| 锁定 | `q-icon-lock` | 锁 |
| 解锁 | `q-icon-unlock` | 开锁 |
| 导出 | `q-icon-export` | 传书 |

### 导航操作 (E910-E91F)

| 图标 | 类名 | 寓意 |
|------|------|------|
| 返回 | `q-icon-back` | 牌坊 |
| 前进 | `q-icon-forward` | 牌坊 |
| 上/下/左/右 | `q-icon-up/down/left/right` | 方向 |
| 上传 | `q-icon-upload` | 飞鸽传书 |
| 下载 | `q-icon-download` | 收卷 |
| 搜索 | `q-icon-search` | 探幽寻迹 |
| 筛选 | `q-icon-filter` | 竹筛 |
| 设置 | `q-icon-settings` | 文房四宝 |
| 菜单 | `q-icon-menu` | 折扇 |
| 更多 | `q-icon-more` | 画轴展开 |
| 首页 | `q-icon-home` | 家/宅院 |
| 仪表盘 | `q-icon-dashboard` | 罗盘 |
| 通知 | `q-icon-notification` | 信鸽 |

### 状态提示 (E920-E92F)

| 图标 | 类名 | 寓意 |
|------|------|------|
| 成功 | `q-icon-success` | 双喜 |
| 警告 | `q-icon-warning` | 铜锣 |
| 错误 | `q-icon-error` | 败笔 |
| 信息 | `q-icon-info` | 书简 |
| 疑问 | `q-icon-question` | 猜谜 |
| 收藏/未收藏 | `q-icon-star` / `q-icon-star-empty` | 祥瑞 |
| 喜欢/不喜欢 | `q-icon-heart` / `q-icon-heart-empty` | 如意 |
| 标记 | `q-icon-flag` | 旗帜 |
| 标签 | `q-icon-tag` | 书签 |
| 铃铛 | `q-icon-bell` | 风铃 |

### 文件文档 (E930-E93F)

| 图标 | 类名 | 寓意 |
|------|------|------|
| 文件 | `q-icon-file` | 书卷 |
| 文件夹 | `q-icon-folder` | 书函 |
| 打开文件夹 | `q-icon-folder-open` | 开函 |
| 打开文件 | `q-icon-file-open` | 展卷 |
| PDF | `q-icon-file-pdf` | 卷轴 |
| Word | `q-icon-file-word` | 文稿 |
| Excel | `q-icon-file-excel` | 账册 |
| 图片 | `q-icon-file-image` | 画卷 |
| 压缩包 | `q-icon-file-archive` | 书匣 |
| 代码 | `q-icon-file-code` | 竹简 |

### 用户管理 (E940-E94F)

| 图标 | 类名 | 寓意 |
|------|------|------|
| 用户 | `q-icon-user` | 文人 |
| 用户组 | `q-icon-users` | 雅集 |
| 添加用户 | `q-icon-user-add` | 招贤 |
| 移除用户 | `q-icon-user-remove` | 辞行 |
| 认证用户 | `q-icon-user-check` | 金榜 |
| 待审用户 | `q-icon-user-clock` | 候考 |
| 角色 | `q-icon-role` | 官帽 |
| 权限 | `q-icon-permission` | 玉玺 |
| 资料 | `q-icon-profile` | 名帖 |

### 日期时间 (E950-E95F)

| 图标 | 类名 | 寓意 |
|------|------|------|
| 日历 | `q-icon-calendar` | 黄历 |
| 时钟 | `q-icon-clock` | 日晷 |
| 时间 | `q-icon-time` | 时辰 |
| 沙漏 | `q-icon-hourglass` | 漏刻 |

### 通讯消息 (E960-E96F)

| 图标 | 类名 | 寓意 |
|------|------|------|
| 邮件 | `q-icon-mail` | 书信 |
| 读信 | `q-icon-mail-open` | 展信 |
| 聊天 | `q-icon-chat` | 对谈 |
| 评论 | `q-icon-comment` | 题跋 |
| 发送 | `q-icon-send` | 飞鸽 |
| 收件箱 | `q-icon-inbox` | 信函 |

### 数据图表 (E970-E97F)

| 图标 | 类名 | 寓意 |
|------|------|------|
| 柱状图 | `q-icon-chart-bar` | 算筹 |
| 折线图 | `q-icon-chart-line` | 山脉 |
| 饼图 | `q-icon-chart-pie` | 罗盘 |
| 面积图 | `q-icon-chart-area` | 层峦 |
| 表格 | `q-icon-table` | 九宫格 |
| 列表 | `q-icon-list` | 清单 |

### 电商/财务 (E980-E98F)

| 图标 | 类名 | 寓意 |
|------|------|------|
| 购物 | `q-icon-shopping` | 市集 |
| 购物车 | `q-icon-cart` | 货担 |
| 钱包 | `q-icon-wallet` | 荷包 |
| 货币 | `q-icon-coin` | 铜钱 |
| 信用 | `q-icon-credit` | 银票 |
| 订单 | `q-icon-order` | 契据 |
| 发票 | `q-icon-invoice` | 票据 |

### 中国风特色 (E990-E99F)

| 图标 | 类名 | 寓意 |
|------|------|------|
| 龙 | `q-icon-dragon` | 祥瑞 |
| 凤凰 | `q-icon-phoenix` | 祥瑞 |
| 灯笼 | `q-icon-lantern` | 节日 |
| 茶壶 | `q-icon-teapot` | 茶道 |
| 竹子 | `q-icon-bamboo` | 君子 |
| 梅花 | `q-icon-plum` | 傲骨 |
| 印章 | `q-icon-seal` | 信用 |
| 卷轴 | `q-icon-scroll` | 典籍 |
| 算盘 | `q-icon-abacus` | 计算 |
| 毛笔 | `q-icon-brush` | 书写 |
| 墨砚 | `q-icon-ink` | 文房 |
| 扇子 | `q-icon-fan` | 雅致 |
| 寺庙 | `q-icon-temple` | 建筑 |
| 长城 | `q-icon-greatwall` | 地标 |
| 中国 | `q-icon-china` | 华表 |
| 太极 | `q-icon-yin-yang` | 哲学 |

## 目录结构

```
src/icon/
├── q-icon.css              # 图标 CSS（@font-face + 基础样式 + 图标类）
├── svg/                    # 102 个独立 SVG 源文件
│   ├── save.svg
│   ├── dragon.svg
│   └── ...
└── fonts/                  # 生成的字体文件
    ├── q-icon.woff2        # WOFF2 格式（主用，3.8KB）
    ├── q-icon.woff         # WOFF 格式（fallback）
    ├── q-icon.ttf          # TTF 格式（fallback）
    └── icon-map.json       # 图标名→Unicode 映射
```

## 构建命令

```bash
# 从 SVG 源文件生成字体文件
node scripts/build-icon-font.js
```

构建流程：`svg/*.svg` → SVG 字体（中间产物）→ TTF → WOFF2 + WOFF

## 设计决策

- **字体图标方案**：使用 `@font-face` + Unicode 私用区（E900-E99F），参考 FontAwesome 规范
- **CSS 变量集成**：尺寸和边框色使用 `var(--q-icon-size-*)` 和 `var(--q-color-border)`，与主题系统联动
- **BEM 命名**：图标类 `q-icon-{name}`，修饰类 `q-icon--{modifier}`
- **currentColor**：SVG 源文件使用 `stroke="currentColor"` / `fill="currentColor"`，图标颜色跟随 CSS `color` 属性
- **中国风寓意**：每个图标都有中国风寓意命名（如"保存"对应"玉玺"），体现文化特色
