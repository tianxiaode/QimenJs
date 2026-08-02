# QimenJs src MCP Server

将项目 `src/` 代码以 MCP（Model Context Protocol）服务形式暴露，供 Trae / Claude Desktop / Cursor 等 MCP 客户端消费。基于 `@modelcontextprotocol/sdk` + TypeScript compiler API，提供文件 I/O、语义分析与调用图能力。

## 工具清单

### 文件工具（纯 fs，无需 TS）
| 工具 | 入参 | 说明 |
|---|---|---|
| `list_modules` | 无 | 列出 `src/` 顶层目录及各目录 .ts 文件数 |
| `list_files` | `path?`, `recursive?`, `ext?` | 列出指定目录文件（默认 src，默认 .ts） |
| `read_file` | `path`, `startLine?`, `endLine?` | 读取文件，`cat -n` 风格行号，支持行区间 |
| `search_code` | `pattern`, `path?`, `glob?`, `maxResults?`, `ignoreCase?` | 正则搜索，自实现递归 grep |

### 语义工具（TS LanguageService）
| 工具 | 入参 | 说明 |
|---|---|---|
| `get_symbols` | `file` | 提取顶层声明（class/interface/function/type/enum/variable）及导出状态、修饰符 |

### 调用图工具（TS LanguageService）
| 工具 | 入参 | 说明 |
|---|---|---|
| `find_references` | `file`, `line`, `column?` | 查找符号所有引用位置（column 省略时取该行首个非空白 token） |
| `get_dependencies` | `file` | 该文件 import 的模块，解析到实际文件（跟随 @qimenjs/* 别名） |
| `get_dependents` | `file` | 反向查找谁 import 了该文件 |

> 首次调用语义/调用图工具会预热完整 TS 程序（832 文件，约 3-8s），后续调用增量。

## 运行方式

### 方式一：直接运行（调试）
```bash
npm run mcp
```
使用 `ts-node --transpile-only`，改代码即时生效。

### 方式二：作为 MCP 客户端的服务接入

#### Trae（项目级）
Trae 的项目级 MCP 配置文件是 `.trae/mcp.json`（不是根目录的 `.mcp.json`）。**该文件受 IDE 保护，模型无法写入**——需你手动创建。在项目根 `.trae/` 目录下新建 `mcp.json`，粘贴：

```json
{
  "mcpServers": {
    "qimen-src": {
      "command": "node",
      "args": ["${workspaceFolder}/mcp-server/bootstrap.js"],
      "env": {
        "START_MCP_TIMEOUT_MS": "30000",
        "RUN_MCP_TIMEOUT_MS": "60000"
      }
    }
  }
}
```

然后：
1. 打开 **设置 → MCP**
2. 打开 **启用项目级 MCP** 开关，在弹窗中确认（安全确认，一次性）
3. Trae 会自动加载并 spawn 该 server，工具列表中出现 `qimen-src` 的 8 个工具

> 超时说明：`RUN_MCP_TIMEOUT_MS=60000` 是因为首次语义调用（get_symbols / find_references 等）需预热 832 文件的 TS 程序（约 3-8s）；后续调用很快。不调高会在首次调用超时失败。

> `bootstrap.js` 的作用：在加载 ts-node 前用绝对路径锁定 `mcp-server/tsconfig.json`（CJS），避免 ts-node 误用根 tsconfig（ESNext）导致 `require()` SDK 失败。完全 cwd 无关、不依赖 `${workspaceFolder}` 在 env 的展开。

#### Trae（手动添加，无需项目级开关）
也可走 UI：**设置 → MCP → 添加 → 手动添加**，把上面 `mcpServers.qimen-src` 那段 JSON（去掉外层 `mcpServers` 包裹）粘进输入框，确认即可。该方式写入 Trae 用户级配置，不受项目级开关影响。

#### Claude Desktop / Cursor
把同样的 `mcpServers` JSON 放进各自配置文件（Claude Desktop: `claude_desktop_config.json`；Cursor: `.cursor/mcp.json`）。

### 方式三：MCP Inspector 可视化调试
```bash
npm run mcp:inspect
```
打开浏览器界面逐个调用工具验证。

## 架构

```
mcp-server/
├── tsconfig.json                 # CJS 配置（隔离于根 tsconfig 的 ESNext）
├── bootstrap.js                  # 启动器：锁定 tsconfig + 加载 ts-node（给 MCP 客户端 spawn 用）
└── src/
    ├── index.ts                  # 入口：McpServer + StdioServerTransport
    ├── project/
    │   ├── project-context.ts    # 工作区根解析 + 路径越界防护
    │   └── ts-service.ts         # LanguageServiceHost + 单例（懒加载）
    ├── tools/
    │   ├── file-tools.ts
    │   ├── symbol-tools.ts
    │   └── graph-tools.ts
    └── utils/
        ├── fs-utils.ts
        └── mcp-result.ts
```

关键设计：
- **cwd 无关**：`project-context.ts` 从 `__dirname` 向上查找 `package.json`（name === "qimenjs"）+ `src/`，定位工作区根
- **路径安全**：`resolveWorkspacePath` 校验解析后路径必须位于工作区内，拒绝 `../../etc/passwd` 越界
- **路径别名**：`ts-service.ts` 继承根 `tsconfig.json` 的 `@qimenjs/*`、`@/*` paths 映射，跨模块引用/依赖解析与真实构建一致
- **错误处理**：工具级错误以 `isError: true` 返回（非协议级错误），LLM 可观察并自我纠正

## 类型检查
```bash
npx tsc --noEmit -p mcp-server/tsconfig.json
```
独立于库的 tsc，不影响主构建。
