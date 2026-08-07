# QimenJS CSS按需打包插件

## 功能

自动分析组件依赖，按需打包CSS，避免打包未使用的组件样式。

## 安装

```bash
npm install --save-dev vite
```

## 使用

### 1. 配置Vite插件

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { qimenCssPlugin } from './build-tools/vite-plugin-qimen-css';

export default defineConfig({
    plugins: [
        qimenCssPlugin({
            // 入口文件（支持glob模式）
            entryPoints: [
                'src/main.ts',
                'src/pages/**/*.ts'
            ],
            
            // 组件根目录
            componentRoot: 'src/component',
            
            // 是否生成独立的CSS文件
            emitFile: true,
            
            // CSS输出文件名
            outputFileName: 'qimen-components.css',
            
            // 是否在开发模式下注入CSS
            injectInDev: true,
            
            // 是否打印调试信息
            debug: false
        })
    ]
});
```

### 2. 组件定义CSS

组件CSS使用TypeScript定义：

```ts
// src/component/button/button.css.ts
export const buttonCSS = `
.q-button {
    display: inline-flex;
    align-items: center;
    /* ... */
}
`;
```

组件导出CSS：

```ts
// src/component/button/index.ts
export { ButtonComponent } from './ButtonComponent';
export { buttonCSS } from './button.css';
```

### 3. 使用组件

```ts
// src/main.ts
import { ButtonComponent } from '@qimenjs/component/button';
import { HeroComponent } from '@qimenjs/component/hero';

// 插件会自动注入：
// import '/src/component/button/button.css';
// import '/src/component/hero/hero.css';

// 使用组件...
```

## 工作原理

### 1. 构建开始时（buildStart）

```
扫描组件目录
  ↓
建立组件→CSS映射
  {
    'src/component/button/index.ts' => 'src/component/button/button.css.ts',
    'src/component/hero/index.ts' => 'src/component/hero/hero.css.ts',
    ...
  }
  ↓
分析入口文件
  ↓
递归收集组件依赖
  ↓
确定需要打包的CSS文件
```

### 2. 转换模块时（transform）

```
检测到组件import
  ↓
自动注入CSS import
  import { ButtonComponent } from '@qimenjs/component/button';
  ↓
  import '/src/component/button/button.css';
  import { ButtonComponent } from '@qimenjs/component/button';
```

### 3. 生成打包产物时（generateBundle）

```
合并所有收集到的CSS
  ↓
去重优化
  ↓
输出到 qimen-components.css
```

## 配置选项

### entryPoints

入口文件列表，支持glob模式。

```ts
entryPoints: [
    'src/main.ts',           // 单个文件
    'src/pages/**/*.ts'      // glob模式
]
```

### componentRoot

组件根目录，默认 `'src/component'`。

```ts
componentRoot: 'src/component'
```

### emitFile

是否生成独立的CSS文件，默认 `true`。

```ts
emitFile: true  // 生成 qimen-components.css
emitFile: false // 不生成，依赖运行时注入
```

### outputFileName

CSS输出文件名，默认 `'qimen-components.css'`。

```ts
outputFileName: 'bundle.css'
```

### injectInDev

是否在开发模式下注入CSS，默认 `true`。

```ts
injectInDev: true   // 开发时自动注入
injectInDev: false  // 开发时不注入（需手动import）
```

### debug

是否打印调试信息，默认 `false`。

```ts
debug: true  // 打印详细日志
```

## 示例

### 开发模式

```bash
npm run dev
```

插件会：
1. 扫描组件目录
2. 分析入口文件依赖
3. 自动注入CSS import（HMR支持）

### 生产构建

```bash
npm run build
```

插件会：
1. 收集所有使用的组件CSS
2. 合并去重
3. 输出到 `dist/qimen-components.css`

## 注意事项

1. **组件必须有index.ts**：插件通过 `index.ts` 识别组件入口
2. **CSS文件命名**：必须以 `.css.ts` 结尾（如 `button.css.ts`）
3. **CSS导出命名**：变量名必须以 `CSS` 结尾（如 `buttonCSS`）
4. **递归依赖**：插件会自动递归收集子组件依赖

## 与CompileEngine集成

插件可与 `CompileEngine.collectDependencies()` 配合使用：

```ts
import { CompileEngine } from '@qimenjs/component-core';

// 在模板中收集组件依赖
const tpl = {
    tag: 'div',
    children: [
        { type: ButtonComponent, name: 'btn' }
    ]
};

const deps = CompileEngine.collectDependencies(tpl);
// deps: Set<Function> { ButtonComponent }
```

## 性能优化

- **构建时分析**：仅在构建开始时扫描一次
- **递归收集**：自动收集嵌套组件依赖
- **去重合并**：相同CSS只打包一次
- **HMR支持**：开发时热更新

## 故障排查

### CSS未注入

检查：
1. 组件是否有 `index.ts`
2. CSS文件是否以 `.css.ts` 结尾
3. CSS变量是否以 `CSS` 结尾
4. 入口文件配置是否正确

### 打包后CSS缺失

检查：
1. `emitFile` 是否为 `true`
2. 组件是否在入口文件中被import
3. 开启 `debug: true` 查看详细日志