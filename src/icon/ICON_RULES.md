# QimenJS 图标绘制规则

AI 扩展新图标时，必须遵循此规则。核心思路：**不用算法计算出图形，而是按基本线条怎么画的规则，把图标分解为基本笔画组合**。

## 笔画风格：楷体（永字八法）

图标核心笔画参考**楷体**的笔画体系，AI 画图标时按楷体笔势思维分解：

| 楷体笔画 | 图标对应 | P 原语 |
|---------|---------|--------|
| 勒（横 一） | 水平线 | `P.line` |
| 努（竖 丨） | 垂直线 | `P.line` |
| 撇（丿） | 斜线 | `P.line` |
| 捺（㇏） | 斜线 | `P.line` |
| 折（𠃍） | 直角转折 | `P.polyline` |
| 趯（钩 亅） | 弧线钩 | `P.arc` / `P.qcurve` |
| 弯 | 弧线 | `P.arc` / `P.ccurve` |
| 侧（点 丶） | 圆点 | `P.circle` + fill / `P.triangle` |

设计要点（楷体笔势对图标的指导）：
- **横平竖直为主干**：横竖笔画保持水平/垂直，不用斜的
- **撇捺简化为斜线**：楷体撇捺有弧度，图标中简化为直线斜线（几何线条难以体现笔锋）
- **弯钩用弧线**：钩/弯笔画用 `P.arc`/`P.qcurve` 画弧线，这是楷体风格区别于纯几何图标的关键
- **点用圆点**：楷体点画（侧）用实心圆点（circle + fill），模拟顿笔
- **圆头线帽模拟顿笔**：round cap 的圆润起收笔对应楷体的顿笔变化

## 基本约定

- 默认 viewBox **24x24**（坐标范围 0-24），但每个图标可自定义 viewBox（如 48x48、512x512）
- 设计约束在于**笔画风格**（楷体），而非 viewBox 尺寸——viewBox 大小不影响最终字体渲染
- 默认 stroke-width **2**（24x24 viewBox 下），更大 viewBox 时按比例增大（如 48x48 用 4）
- stroke-linecap round，stroke-linejoin round（构建自动添加）
- 去掉圆圈外框，只保留图标核心形状
- 实心图标用 `fill: 'currentColor'` + 图标级 `strokeWidth: 0`
- y 轴向下为正（SVG 坐标系）：顶部 y 小，底部 y 大

## 笔画原语（P）参考

导入方式：`import { P } from './strokes'`

### 直线类

| 原语 | 签名 | 用途 |
|------|------|------|
| `P.line` | `(x1,y1,x2,y2)` | 横/竖/撇/捺/斜线，任意两点连线 |
| `P.polyline` | `(...pts)` | 折线/多段线，不闭合。如 V 字、勾、对勾 |
| `P.polygon` | `(...pts)` | 闭合多边形。如三角轮廓、铅笔轮廓、五角星 |

### 弧线类

| 原语 | 签名 | 用途 |
|------|------|------|
| `P.circle` | `(cx,cy,r)` | 正圆轮廓（如 radio、search 镜片） |
| `P.arc` | `(cx,cy,r,startAngle,endAngle)` | 圆弧（如 refresh 旋转弧） |
| `P.qcurve` | `(x1,y1,cx,cy,x2,y2)` | 二次贝塞尔（简单弯钩） |
| `P.ccurve` | `(x1,y1,c1x,c1y,c2x,c2y,x2,y2)` | 三次贝塞尔（复杂曲线，如心形） |

### 填充类

| 原语 | 签名 | 用途 |
|------|------|------|
| `P.triangle` | `(x1,y1,x2,y2,x3,y3)` | 实心三角形（配合 fill + strokeWidth:0） |
| `P.rect` | `(x,y,w,h,rx?)` | 矩形/圆角矩形（如 checkbox、save） |
| `P.gear` | `(cx,cy,innerR,outerR,teeth)` | 齿轮轮廓 |

### 角度约定（P.arc 用）

- `0` = 3点钟方向（右），`0.5π` = 6点钟（下），`π` = 9点钟（左），`1.5π` = 12点钟（上）
- endAngle > startAngle → 顺时针（视觉上）；需要逆时针时让 startAngle > endAngle
- 弧线长度判断：`Math.abs(endAngle - startAngle)`，超过 π 用 largeArc

### 复杂形状

不规则曲线（心形、月亮等）直接写 SVG path 字符串，不必强套原语：
```typescript
{ d: 'M12 20 C8 16 4 12 4 8 C4 5 7 3 12 7 C17 3 20 5 20 8 C20 12 16 16 12 20 Z' }
```

## 图标定义格式

在 `src/icon/definitions.ts` 的 `icons` 数组中添加：

```typescript
{
    name: '图标名',           // kebab-case，如 chevron-down
    paths: [
        { d: P.line(3, 6, 21, 6) },                          // 线条笔画
        { d: P.circle(12, 12, 4), fill: 'currentColor' },     // 实心笔画
    ],
    // viewBox: '0 0 48 48',  // 可选：自定义 viewBox（默认 0 0 24 24）
    // strokeWidth: 0,        // 仅纯实心图标需要
}
```

### viewBox 选择指南

- **24x24**：简单图标（箭头、对勾、菜单等），坐标范围够用
- **48x48**：中等复杂度图标（folder-open、palette 等），需要更精细的坐标
- **更大尺寸**：极复杂图标，按需设定
- stroke-width 按 viewBox 比例调整：24x24→2, 48x48→4, 512x512→约20

## 设计模式（参考现有图标）

- **对勾**：polyline 三点 `[4,12]→[9,17]→[20,6]`
- **V字箭头**（chevron-down）：polyline `[6,9]→[12,15]→[18,9]`
- **箭头**（arrow-down）：竖线 + polyline V 字组合
- **铅笔**（edit）：polygon 五边形轮廓 + 笔尖分界线
- **删除**（delete）：多条 line/polyline 组合（顶横线+桶身+提手+两条竖纹）
- **实心圆点**（more）：circle + fill，图标级 strokeWidth: 0

## 构建流程（必须完整执行）

1. 在 `src/icon/definitions.ts` 添加图标定义
2. **同步**更新 `scripts/build-icons.js` 中的硬编码副本（此文件有 P 原语和图标定义的独立副本，两边必须一致）
3. 运行 `npm run build:icons` 重新生成 SVG + 字体 + CSS 映射
4. 用 `icon-test.html` 在浏览器确认渲染效果（字体图标需浏览器验证，不能只看 SVG）

## 注意事项

- 字体只能用 fill 渲染：构建脚本会做 stroke→fill 转换（tubes 方案），所以定义时只管用 stroke 思维画，无需手算偏移
- 填充三角形/圆点的方向需与 tubes 方案一致（逆时针 y-down），否则可能被 fill rule 挖空
- `P.circle` 已内置正确的 sweep 方向，直接用即可
- 新图标名字避免与现有图标重复，可参考 `src/icon/fonts/icon-map.json`
