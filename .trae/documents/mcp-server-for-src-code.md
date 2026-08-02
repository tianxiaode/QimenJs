# 为 QimenJs src 代码构建 MCP 服务

## Context（为什么做这件事）

用户已安装 `@modelcontextprotocol/sdk@^1.30.0` 和 `zod@^4.4.3`，希望把项目 `src/` 代码以 MCP 服务形式暴露出来，供 **Trae 内 + 其他 MCP 客户端**（Claude Desktop / Cursor 等）消费。

工具能力范围选定为 **完整套件（含调用图）**：基础文件 I/O + TS 语义分析 + 引用/依赖调用图。运行方式为 **ts-node 直跑**（`--transpile-only`，免编译，改代码即时生效）。

注意：在 Trae 内，助手本就拥有 Read/Grep/Glob/LS 内置工具可访问 `src/`。本 MCP 服务的核心增量价值在于：(1) 可移植到无内置文件工具的客户端；(2) 项目感知（了解 src/ 模块布局）；(3) 基于 TypeScript compiler API 的语义分析与调用图——这些是内置工具做不到的。

## 架构总览

新增独立目录 `mcp-server/`（与 `src/` 同级，不参与库构建），采用 stdio 传输：

```
mcp-server/
├── tsconfig.json                 # 独立 CJS 配置，避免根 tsconfig 的 ESNext 干扰
├── README.md                     # 使用说明
└── src/
    ├── index.ts                  # 入口：创建 McpServer + StdioServerTransport，注册全部工具
    ├── project/
    │   ├── project-context.ts    # 工作区根解析 + 路径越界防护
    │   └── ts-service.ts         # LanguageServiceHost + 单例 LanguageService（懒加载）
    ├── tools/
    │   ├── file-tools.ts         # list_modules / list_files / read_file / search_code
    │   ├── symbol-tools.ts       # get_symbols
    │   └── graph-tools.ts        # find_references / get_dependencies / get_dependents
    └── utils/
        ├── fs-utils.ts           # walkDir / readFileLines / resolveWorkspacePath
        └── mcp-result.ts         # text() / json() / error() 响应助手
```

根目录新增：
- `.mcp.json` — Trae / Claude Desktop 通用 MCP 配置
- `package.json` 增加 `mcp` 和 `mcp:inspect` 脚本

## 关键实现要点

### 1. `mcp-server/tsconfig.json`（CJS，隔离于根 ESNext 配置）
```json
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "commonjs",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true,
    "types": ["node"],
    "outDir": "./dist",
    "rootDir": "src",
    "resolveJsonModule": true
  },
  "include": ["src/**/*"]
}
```
`module: commonjs` 确保 ts-node 输出 CJS，`require('@modelcontextprotocol/sdk/server')` 走 SDK 的 CJS 构建（exports map 中 `"require"` → `dist/cjs/server/index.js`）。

### 2. `project/project-context.ts` — 工作区根解析（cwd 无关）
从 `__dirname` 向上查找包含 `src/` 子目录且 `package.json` 的 `name` 为 `"qimenjs"` 的目录，定为 `WORKSPACE_ROOT`。这样无论被哪个客户端以何种 cwd spawn，都能正确定位。导出 `resolveWorkspacePath(rel)`，解析后校验 `resolved.startsWith(WORKSPACE_ROOT)`，越界即抛错（防止 `../../etc/passwd`）。

### 3. `project/ts-service.ts` — TS LanguageService 单例（懒加载）
实现 `ts.LanguageServiceHost`：
- 读取根 `tsconfig.json`（`ts.readConfigFile` + `ts.parseJsonConfigFileContent`），继承其 `compilerOptions`（含 `@qimenjs/*` 和 `@/*` 的 `paths` 映射——语义工具的跨模块引用解析依赖它）
- `getScriptFileNames()` 返回 `src/` 下全部 832 个 `.ts` 文件
- `getScriptSnapshot()` 用 `ts.ScriptSnapshot.fromString(fs.readFileSync(...))`
- `getScriptVersion()` 返回 mtime 时间戳，文件改动后自动失效缓存

`getLanguageService()` 首次调用时构造 `ts.createLanguageService(host, ...)`；此后所有语义工具复用单例。首次调用（find_references 需完整 program）预计预热 3-8s（832 文件），后续增量。导出 `invalidate(filePath)` 供未来扩展监听文件变化。

### 4. 工具清单（均用 `server.registerTool` 现代非废弃 API）

**File tools**（无需 TS，纯 fs）：

| 工具 | 入参 | 输出 |
|---|---|---|
| `list_modules` | 无 | `src/` 顶层目录 + 各目录 .ts 文件数 |
| `list_files` | `path?`(默认"src"), `recursive?`, `ext?`(默认".ts") | 相对路径列表 |
| `read_file` | `path`, `startLine?`, `endLine?` | 带 `cat -n` 风格行号的内容；路径越界拒绝 |
| `search_code` | `pattern`(正则), `path?`, `glob?`, `maxResults?`(默认100), `ignoreCase?` | `file:line:match` 列表，自实现递归 grep 不依赖 ripgrep |

**Symbol tools**（TS LanguageService）：

| 工具 | 入参 | 输出 |
|---|---|---|
| `get_symbols` | `file` | 顶层声明数组 `{name, kind, line, exported, modifiers}`（class/interface/function/type/enum/var） |

**Graph tools**（TS LanguageService）：

| 工具 | 入参 | 输出 |
|---|---|---|
| `find_references` | `file`, `line`, `column?`（无 column 时取该行首个非空白 token 位置） | `ts.findReferences` 结果：`[{name, locations:[{file,line,column}]}]` |
| `get_dependencies` | `file` | 该文件 import 的模块，解析到实际文件：`[{specifier, resolvedFile, importedNames}]`，利用 `sourceFile.resolvedModules`（自动跟随 @qimenjs 别名） |
| `get_dependents` | `file` | 反向扫描全部源文件，找 import 指向该文件者：`[{file, specifier, importedNames}]` |

所有工具入参用 zod raw shape（如 `{ path: z.string(), recursive: z.boolean().optional() }`）作为 `inputSchema`。返回值经 `mcp-result.ts` 的 `text()` / `json()` / `error()` 统一封装为 `CallToolResult`。

### 5. `index.ts` 入口
```ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerFileTools } from './tools/file-tools';
import { registerSymbolTools } from './tools/symbol-tools';
import { registerGraphTools } from './tools/graph-tools';

const server = new McpServer({ name: 'qimen-src', version: '0.1.0' });
registerFileTools(server);
registerSymbolTools(server);
registerGraphTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);
```
（从 CJS require 时，`@modelcontextprotocol/sdk/server/mcp.js` 子路径经 exports map 的 `./*` 通配解析到 CJS 构建。）

### 6. `.mcp.json`（根目录，Trae/Claude Desktop 通用）
```json
{
  "mcpServers": {
    "qimen-src": {
      "command": "node",
      "args": ["--require", "ts-node/register/transpile-only", "mcp-server/src/index.ts"],
      "env": { "TS_NODE_PROJECT": "mcp-server/tsconfig.json" }
    }
  }
}
```
用 `node --require ts-node/register/transpile-only` 而非 `npx ts-node`——规避 Windows 下 `npx`/`cmd` 问题，直接复用项目本地 `node_modules/ts-node`。`TS_NODE_PROJECT` 环境变量强制使用 mcp-server 独立 tsconfig。

### 7. `package.json` 脚本新增
```json
"mcp": "ts-node --transpile-only --project mcp-server/tsconfig.json mcp-server/src/index.ts",
"mcp:inspect": "npx @modelcontextprotocol/inspector npm run mcp"
```

## 待创建/修改文件

- 新建 `mcp-server/tsconfig.json`
- 新建 `mcp-server/src/index.ts`
- 新建 `mcp-server/src/project/project-context.ts`
- 新建 `mcp-server/src/project/ts-service.ts`
- 新建 `mcp-server/src/tools/file-tools.ts`
- 新建 `mcp-server/src/tools/symbol-tools.ts`
- 新建 `mcp-server/src/tools/graph-tools.ts`
- 新建 `mcp-server/src/utils/fs-utils.ts`
- 新建 `mcp-server/src/utils/mcp-result.ts`
- 新建 `mcp-server/README.md`
- 新建 `.mcp.json`（根目录）
- 修改 `package.json`（新增 `mcp` / `mcp:inspect` 脚本）

## 验证步骤

1. **类型检查**：`npx tsc --noEmit -p mcp-server/tsconfig.json`（独立于库 tsc，零错误）
2. **冒烟启动**：`npm run mcp` 应打印 MCP server 日志并等待 stdin（Ctrl+C 退出）
3. **MCP Inspector 调试**：`npm run mcp:inspect`，在浏览器界面逐个调用工具验证：
   - `list_modules` → 返回 src/ 顶层模块
   - `read_file { path: "src/component/entity-toolbar/EntityToolbarComponent.ts" }` → 返回带行号内容
   - `get_symbols { file: "src/component/entity-toolbar/EntityToolbarComponent.ts" }` → 返回导出符号
   - `find_references { file: "...", line: 108 }` → 返回 `Button` 符号引用位置
   - `get_dependencies` / `get_dependents` → 返回正确的 import 关系
4. **Trae 接入**：保存 `.mcp.json` 后在 Trae 中重载 MCP 服务，确认 `qimen-src` 工具列表出现且可调用
5. **路径越界防护**：调用 `read_file { path: "../../etc/passwd" }` 应返回 `isError: true`
